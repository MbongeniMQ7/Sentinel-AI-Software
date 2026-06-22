"""In-memory store used when Redis is not available.

Provides the same async interface for worker state, telemetry history,
and active WebSocket connections that the rest of the application expects.
"""

import asyncio
from collections import defaultdict, deque
from typing import Any, Deque, Dict, Optional, Set

from fastapi import WebSocket


class InMemoryStore:
    def __init__(self) -> None:
        self._data: Dict[str, Any] = {}
        self._lists: Dict[str, Deque] = defaultdict(lambda: deque(maxlen=3600))
        self._connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    # ------------------------------------------------------------------ key/value
    async def set(self, key: str, value: Any) -> None:
        async with self._lock:
            self._data[key] = value

    async def get(self, key: str) -> Optional[Any]:
        return self._data.get(key)

    async def delete(self, key: str) -> None:
        async with self._lock:
            self._data.pop(key, None)

    async def keys(self, pattern: str = "*") -> list:
        prefix = pattern.rstrip("*")
        return [k for k in self._data if k.startswith(prefix)]

    # ------------------------------------------------------------------ lists
    async def lpush(self, key: str, value: Any, maxlen: int = 3600) -> None:
        async with self._lock:
            self._lists[key].appendleft(value)
            while len(self._lists[key]) > maxlen:
                self._lists[key].pop()

    async def lrange(self, key: str, start: int, end: int) -> list:
        items = list(self._lists[key])
        if end == -1:
            return items[start:]
        return items[start : end + 1]

    # ------------------------------------------------------------------ websockets
    async def add_connection(self, ws: WebSocket) -> None:
        async with self._lock:
            self._connections.add(ws)

    async def remove_connection(self, ws: WebSocket) -> None:
        async with self._lock:
            self._connections.discard(ws)

    async def broadcast(self, message: str) -> None:
        dead: Set[WebSocket] = set()
        for ws in list(self._connections):
            try:
                await ws.send_text(message)
            except Exception:
                dead.add(ws)
        for ws in dead:
            await self.remove_connection(ws)


store = InMemoryStore()
