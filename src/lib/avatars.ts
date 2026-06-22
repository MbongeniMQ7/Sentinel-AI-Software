// Centralized image assets so avatars/photos can be reused across the app.
import workerAnders from '@/assets/worker-anders.jpg'
import workerBradley from '@/assets/worker-bradley.jpg'
import workerElena from '@/assets/worker-elena.jpg'
import workerJulian from '@/assets/worker-julian.jpg'
import workerLucia from '@/assets/worker-lucia.jpg'
import workerMarcus from '@/assets/worker-marcus.jpg'
import workerMartin from '@/assets/worker-martin.jpg'
import workerSarah from '@/assets/worker-sarah.jpg'
import workerThabiso from '@/assets/worker-thabiso.jpg'
import avatarMarcus from '@/assets/avatar-marcus.jpg'
import adminAvatar from '@/assets/admin-avatar.jpg'

// Worker portraits used for employee directories, grids and detail pages.
export const workerPhotos: string[] = [
  workerAnders,
  workerBradley,
  workerElena,
  workerJulian,
  workerLucia,
  workerMarcus,
  workerMartin,
  workerSarah,
  workerThabiso,
]

// Persona photos for the demo session users.
export const employeeAvatar = workerMarcus
export const managerAvatar = adminAvatar
export const ownerAvatar = avatarMarcus

/** Deterministically pick a worker photo for a given index. */
export function workerPhoto(index: number): string {
  return workerPhotos[index % workerPhotos.length]
}
