"""Computer-vision fatigue detection service.

Provides frame-level analysis using MediaPipe Face Mesh landmarks
to extract Eye Aspect Ratio (EAR), Mouth Aspect Ratio (MAR),
head-pose angles and PERCLOS over a rolling window.

Designed to run at the edge (e.g. on an industrial camera node) and
emit a CVReading every frame.
"""

from __future__ import annotations

import math
from collections import deque
from dataclasses import dataclass, field
from typing import Deque, List, Optional, Tuple

import numpy as np

from app.core.config import settings
from app.models import CVReading


# ────────────────────────────────────────── geometry helpers
def _euclidean(p1: np.ndarray, p2: np.ndarray) -> float:
    return float(np.linalg.norm(p1 - p2))


def _eye_aspect_ratio(landmarks: np.ndarray, indices: List[int]) -> float:
    """Compute EAR from 6 eye landmark indices.

    EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
    """
    p1 = landmarks[indices[0]]
    p2 = landmarks[indices[1]]
    p3 = landmarks[indices[2]]
    p4 = landmarks[indices[3]]
    p5 = landmarks[indices[4]]
    p6 = landmarks[indices[5]]

    vertical_1 = _euclidean(p2, p6)
    vertical_2 = _euclidean(p3, p5)
    horizontal = _euclidean(p1, p4)

    if horizontal < 1e-6:
        return 0.0
    return (vertical_1 + vertical_2) / (2.0 * horizontal)


def _mouth_aspect_ratio(landmarks: np.ndarray, indices: List[int]) -> float:
    """Compute MAR from 8 mouth landmark indices."""
    top_lip = landmarks[indices[1]]
    bottom_lip = landmarks[indices[7]]
    left_corner = landmarks[indices[0]]
    right_corner = landmarks[indices[4]]

    vertical = _euclidean(top_lip, bottom_lip)
    horizontal = _euclidean(left_corner, right_corner)
    if horizontal < 1e-6:
        return 0.0
    return vertical / horizontal


# MediaPipe Face Mesh landmark index groups (based on canonical face model)
# These are approximate – fine-tune with real calibration data.
LEFT_EYE_INDICES = [362, 385, 387, 263, 373, 380]
RIGHT_EYE_INDICES = [33, 160, 158, 133, 153, 144]
MOUTH_INDICES = [61, 40, 37, 0, 267, 270, 291, 321]


# ────────────────────────────────────────── PERCLOS tracker
@dataclass
class PerclosTracker:
    """Maintains a rolling window of eye-closure events."""

    window_seconds: int = settings.PERCLOS_WINDOW_SECONDS
    fps: float = 10.0  # frames per second of incoming feed
    _buffer: Deque[bool] = field(default_factory=deque)

    @property
    def _max_frames(self) -> int:
        return int(self.window_seconds * self.fps)

    def update(self, eyes_closed: bool) -> float:
        """Add a frame and return current PERCLOS (0-1)."""
        self._buffer.append(eyes_closed)
        while len(self._buffer) > self._max_frames:
            self._buffer.popleft()
        if not self._buffer:
            return 0.0
        return sum(self._buffer) / len(self._buffer)


# ────────────────────────────────────────── blink rate tracker
@dataclass
class BlinkRateTracker:
    """Counts blinks per minute over a rolling one-minute window."""

    fps: float = 10.0
    _ear_buffer: Deque[float] = field(default_factory=lambda: deque(maxlen=600))
    _blink_count: int = 0
    _was_closed: bool = False

    def update(self, ear: float) -> float:
        """Update with current EAR, return blinks/min estimate."""
        is_closed = ear < settings.EAR_THRESHOLD
        if is_closed and not self._was_closed:
            self._blink_count += 1
        self._was_closed = is_closed

        self._ear_buffer.append(ear)
        frames_in_window = len(self._ear_buffer)
        seconds_in_window = frames_in_window / max(self.fps, 1.0)
        if seconds_in_window < 1:
            return 0.0
        blinks_per_min = (self._blink_count / seconds_in_window) * 60
        # decay old blinks as the buffer fills past one minute
        if frames_in_window >= int(self.fps * 60):
            self._blink_count = max(0, self._blink_count - 1)
        return blinks_per_min


# ────────────────────────────────────────── head pose estimator
def _estimate_head_pose(landmarks: np.ndarray) -> Tuple[float, float]:
    """Very lightweight head-pose estimation.

    Returns (pitch, yaw) in degrees using a simplified PnP-free heuristic.
    pitch > 0  => head tilted downward (nodding)
    yaw   > 0  => head turned right
    """
    nose_tip = landmarks[4]
    chin = landmarks[152]
    left_eye = landmarks[33]
    right_eye = landmarks[263]

    # pitch: vertical displacement of chin relative to nose
    dy = float(chin[1] - nose_tip[1])
    dz = float(chin[2] - nose_tip[2]) if landmarks.shape[1] > 2 else 1.0
    pitch = math.degrees(math.atan2(dy, max(abs(dz), 1e-6)))

    # yaw: horizontal asymmetry between eyes
    eye_dx = float(right_eye[0] - left_eye[0])
    eye_dz = float(right_eye[2] - left_eye[2]) if landmarks.shape[1] > 2 else 1.0
    yaw = math.degrees(math.atan2(eye_dz, max(abs(eye_dx), 1e-6)))

    return pitch, yaw


# ────────────────────────────────────────── main service
class CVFatigueService:
    """Stateful per-worker computer-vision fatigue analyser.

    Call ``process_landmarks`` with a (N, 2|3) array of Face Mesh landmark
    coordinates (pixel-space) each frame to get a CVReading.
    """

    def __init__(self, fps: float = 10.0) -> None:
        self._perclos = PerclosTracker(fps=fps)
        self._blink = BlinkRateTracker(fps=fps)

    def process_landmarks(self, landmarks: np.ndarray) -> CVReading:
        """Analyse a single frame and return a CVReading."""
        left_ear = _eye_aspect_ratio(landmarks, LEFT_EYE_INDICES)
        right_ear = _eye_aspect_ratio(landmarks, RIGHT_EYE_INDICES)
        ear = (left_ear + right_ear) / 2.0

        mar = _mouth_aspect_ratio(landmarks, MOUTH_INDICES)

        eyes_closed = ear < settings.EAR_THRESHOLD
        perclos = self._perclos.update(eyes_closed)
        blink_rate = self._blink.update(ear)

        pitch, yaw = _estimate_head_pose(landmarks)

        return CVReading(
            ear=round(ear, 4),
            mar=round(mar, 4),
            head_pose_pitch=round(pitch, 2),
            head_pose_yaw=round(yaw, 2),
            perclos=round(perclos, 4),
            blink_rate=round(blink_rate, 2),
        )

    def process_raw_frame(self, frame: np.ndarray) -> Optional[CVReading]:
        """Process a raw BGR/RGB frame using MediaPipe (optional heavy path).

        This method is provided for edge nodes that have MediaPipe installed.
        Returns None if no face is detected.
        """
        try:
            import mediapipe as mp  # type: ignore

            mp_face_mesh = mp.solutions.face_mesh
            with mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                min_detection_confidence=0.5,
            ) as face_mesh:
                rgb = frame[:, :, ::-1] if frame.shape[2] == 3 else frame
                result = face_mesh.process(rgb)
                if not result.multi_face_landmarks:
                    return None
                h, w = frame.shape[:2]
                raw = result.multi_face_landmarks[0].landmark
                lm = np.array(
                    [[p.x * w, p.y * h, p.z * w] for p in raw], dtype=np.float32
                )
                return self.process_landmarks(lm)
        except ImportError:
            return None
