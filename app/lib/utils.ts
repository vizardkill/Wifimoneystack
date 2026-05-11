import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export const checkPasswordStrength = (password: string): number => {
  if (!password) {
    return 0
  }
  let score = 0
  if (password.length >= 8) {
    score++
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++
  }
  if (/\d/.test(password)) {
    score++
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score++
  }
  return score
}

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(dateString))
}

export const parseSafeFloat = (value: string | null | undefined): number | null => {
  const n = parseFloat(value ?? '')
  return Number.isFinite(n) ? n : null
}

export const parseSafeInt = (value: string | null | undefined): number | null => {
  const n = Number.parseInt(String(value ?? '').trim(), 10)
  return Number.isFinite(n) ? n : null
}

/**
 * Calcula la edad exacta en años a partir de una fecha de nacimiento.
 *
 * Tiene en cuenta mes y día: si la persona aún no ha cumplido años en el
 * año en curso, resta un año al resultado.
 *
 * @param birthDate - Fecha como string ISO, Date, o el valor raw de la DB
 * @returns Edad en años enteros, o `undefined` si la fecha no es válida
 */
export function calcAge(birthDate: Date | string | null | undefined): number | undefined {
  if (birthDate == null) {
    return undefined
  }

  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) {
    return undefined
  }

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age > 0 ? age : undefined
}

/**
 * Extrae las iniciales de un nombre completo (hasta 2 palabras).
 * Ej: "Carlos García" → "CG", "Ana" → "A"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

type StorageUploadResponse = {
  error?: boolean
  objectPath?: string
  publicUrl?: string
}

type UploadViaProxyOptions = {
  responseMode?: 'default' | 'opaque'
}

const uploadImageViaProxy = async (file: File, folder: string, options?: UploadViaProxyOptions): Promise<StorageUploadResponse | null> => {
  const formData = new FormData()
  formData.append('folder', folder)
  formData.append('file', file, file.name)

  if (options?.responseMode === 'opaque') {
    formData.append('responseMode', 'opaque')
  }

  const response = await fetch('/api/v1/storage/uploads', {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    return null
  }

  const result = (await response.json()) as StorageUploadResponse
  if (result.error === true) {
    return null
  }

  return result
}

/**
 * Sube imágenes a través del backend para no exponer requests directos al
 * proveedor de object storage desde el navegador.
 */
export async function uploadImageToStorage(file: File, folder: string): Promise<string | null> {
  try {
    const result = await uploadImageViaProxy(file, folder, { responseMode: 'default' })
    return result?.publicUrl ?? null
  } catch {
    return null
  }
}

/**
 * Sube imágenes y devuelve únicamente el objectPath interno del bucket.
 * Útil cuando no se desea exponer URLs del proveedor en respuestas de red del navegador.
 */
export async function uploadImageToStorageObjectPath(file: File, folder: string): Promise<string | null> {
  try {
    const result = await uploadImageViaProxy(file, folder, { responseMode: 'opaque' })
    return result?.objectPath ?? null
  } catch {
    return null
  }
}

// Backward-compatible aliases. Prefer `uploadImageToStorage*` in new code.
export const uploadImageToGcs = uploadImageToStorage
export const uploadImageToGcsObjectPath = uploadImageToStorageObjectPath
