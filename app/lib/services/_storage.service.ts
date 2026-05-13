import { Storage } from '@google-cloud/storage'
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

// ---------------------------------------------------------------------------
// Object Storage Service (Provider-Agnostic Facade)
// Punto único transversal para uploads/reads de media.
// ---------------------------------------------------------------------------

const normalizeMultilineEnvValue = (value: string | undefined): string => (value ?? '').replace(/\\n/g, '\n')

const gcsPrivateKey: string | undefined = process.env.GCS_PRIVATE_KEY
const gcsClientEmail: string | undefined = process.env.GCS_CLIENT_EMAIL

const GCS_CONFIG = {
  projectId: process.env.GCS_PROJECT_ID,
  bucketName: process.env.GCS_BUCKET_NAME,
  credentials:
    typeof gcsClientEmail === 'string' && gcsClientEmail.length > 0 && typeof gcsPrivateKey === 'string' && gcsPrivateKey.length > 0
      ? {
          client_email: gcsClientEmail,
          private_key: normalizeMultilineEnvValue(gcsPrivateKey)
        }
      : undefined
}

const SIGNED_URL_EXPIRATION_SECONDS = 15 * 60 // 15 minutos
const SIGNED_READ_URL_EXPIRATION_SECONDS = 60 * 60 // 1 hora
const MEDIA_PROXY_PRIVATE_TOKEN_EXPIRATION_SECONDS = 55 * 60 // 55 minutos
const MEDIA_PROXY_TOKEN_VERSION = 'v1'
const MEDIA_PROXY_CIPHER_ALGORITHM = 'aes-256-gcm'
const MEDIA_PROXY_IV_LENGTH_BYTES = 12

type MediaProxyTokenScope = 'private' | 'public_pdf' | 'public_prefixed'

type MediaProxyTokenPayload = {
  containerName: string
  objectPath: string
  exp?: number
  scope: MediaProxyTokenScope
  allowedPrefix?: string
  userId?: string
}

export const STORAGE_PUBLIC_MEDIA_PREFIXES = {
  EXERCISES_VIDEOS: 'exercises/videos/',
  MARKETPLACE_STOREFRONTS: 'marketplace/storefronts/'
} as const

export type StoragePublicMediaPrefix = (typeof STORAGE_PUBLIC_MEDIA_PREFIXES)[keyof typeof STORAGE_PUBLIC_MEDIA_PREFIXES]

const fromBase64Url = (value: string): string => Buffer.from(value, 'base64url').toString('utf8')

const getMediaProxySecret = (): string => {
  const secret = process.env.MEDIA_PROXY_SECRET || process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('MEDIA_PROXY_SECRET o SESSION_SECRET es requerido para firmar tokens de media proxy')
  }
  return secret
}

const getMediaProxyEncryptionKey = (): Buffer => {
  const secret = getMediaProxySecret()
  return createHash('sha256').update(secret).digest()
}

const normalizeMediaObjectPath = (objectPath: string): string => {
  const normalized = objectPath.replace(/^\/+/, '')
  if (normalized.length === 0 || normalized.includes('..')) {
    throw new Error('objectPath inválido para media proxy token')
  }
  return normalized
}

const normalizeMediaAllowedPrefix = (allowedPrefix: string): string => {
  const normalized = allowedPrefix.replace(/^\/+/, '').trim()
  if (normalized.length === 0 || normalized.includes('..')) {
    throw new Error('allowedPrefix inválido para media proxy token')
  }

  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

export const isObjectPathAllowedForPrefix = (objectPath: string, allowedPrefix: string): boolean => {
  const normalizedObjectPath = normalizeMediaObjectPath(objectPath)
  const normalizedAllowedPrefix = normalizeMediaAllowedPrefix(allowedPrefix)
  return normalizedObjectPath.startsWith(normalizedAllowedPrefix)
}

const normalizeMediaProxyPayload = (
  parsed: Partial<MediaProxyTokenPayload> & {
    bucketName?: string
  }
): MediaProxyTokenPayload | null => {
  const containerName = typeof parsed.containerName === 'string' ? parsed.containerName : parsed.bucketName
  const objectPath = typeof parsed.objectPath === 'string' ? parsed.objectPath.replace(/^\/+/, '') : ''
  const scope: MediaProxyTokenScope = parsed.scope === 'public_pdf' ? 'public_pdf' : parsed.scope === 'public_prefixed' ? 'public_prefixed' : 'private'
  const userId = typeof parsed.userId === 'string' && parsed.userId.length > 0 ? parsed.userId : undefined
  const allowedPrefix = typeof parsed.allowedPrefix === 'string' && parsed.allowedPrefix.length > 0 ? parsed.allowedPrefix : undefined
  const exp = typeof parsed.exp === 'number' ? parsed.exp : undefined

  if (!containerName || !objectPath || objectPath.includes('..')) {
    return null
  }

  if (scope === 'private') {
    if (!userId || typeof exp !== 'number') {
      return null
    }

    if (exp <= Math.floor(Date.now() / 1000)) {
      return null
    }
  }

  if (scope === 'public_prefixed') {
    if (!allowedPrefix) {
      return null
    }

    try {
      if (!isObjectPathAllowedForPrefix(objectPath, allowedPrefix)) {
        return null
      }
    } catch {
      return null
    }
  }

  return {
    containerName,
    objectPath,
    scope,
    ...(allowedPrefix ? { allowedPrefix } : {}),
    ...(typeof exp === 'number' ? { exp } : {}),
    ...(userId ? { userId } : {})
  }
}

const encryptMediaProxyPayload = (payload: MediaProxyTokenPayload): string => {
  const key = getMediaProxyEncryptionKey()
  const iv = randomBytes(MEDIA_PROXY_IV_LENGTH_BYTES)
  const cipher = createCipheriv(MEDIA_PROXY_CIPHER_ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return [MEDIA_PROXY_TOKEN_VERSION, iv.toString('base64url'), encrypted.toString('base64url'), authTag.toString('base64url')].join('.')
}

const decryptMediaProxyPayload = (token: string): MediaProxyTokenPayload | null => {
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== MEDIA_PROXY_TOKEN_VERSION) {
    return null
  }

  const [, ivBase64, encryptedBase64, authTagBase64] = parts

  try {
    const iv = Buffer.from(ivBase64, 'base64url')
    const encrypted = Buffer.from(encryptedBase64, 'base64url')
    const authTag = Buffer.from(authTagBase64, 'base64url')

    const key = getMediaProxyEncryptionKey()
    const decipher = createDecipheriv(MEDIA_PROXY_CIPHER_ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
    const parsed = JSON.parse(decrypted) as Partial<MediaProxyTokenPayload> & { bucketName?: string }
    return normalizeMediaProxyPayload(parsed)
  } catch {
    return null
  }
}

const signPayload = (payloadBase64: string): string => {
  const secret = getMediaProxySecret()
  return createHmac('sha256', secret).update(payloadBase64).digest('base64url')
}

const constantTimeCompare = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, 'utf8')
  const rightBuffer = Buffer.from(right, 'utf8')
  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }
  return timingSafeEqual(leftBuffer, rightBuffer)
}

const verifyLegacyMediaProxyToken = (token: string): MediaProxyTokenPayload | null => {
  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [payloadBase64, signature] = parts
  const expectedSignature = signPayload(payloadBase64)
  if (!constantTimeCompare(signature, expectedSignature)) {
    return null
  }

  try {
    const parsed = JSON.parse(fromBase64Url(payloadBase64)) as Partial<MediaProxyTokenPayload> & { bucketName?: string }
    return normalizeMediaProxyPayload(parsed)
  } catch {
    return null
  }
}

export function createMediaProxyToken(
  bucketName: string,
  objectPath: string,
  userId: string,
  expiresInSeconds = MEDIA_PROXY_PRIVATE_TOKEN_EXPIRATION_SECONDS
): string {
  const payload: MediaProxyTokenPayload = {
    containerName: bucketName,
    objectPath: normalizeMediaObjectPath(objectPath),
    scope: 'private',
    userId,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  }

  return encryptMediaProxyPayload(payload)
}

export function createPublicMediaProxyToken(bucketName: string, objectPath: string): string {
  const payload: MediaProxyTokenPayload = {
    containerName: bucketName,
    objectPath: normalizeMediaObjectPath(objectPath),
    scope: 'public_pdf'
  }

  return encryptMediaProxyPayload(payload)
}

export function createPrefixedPublicMediaProxyToken(bucketName: string, objectPath: string, allowedPrefix: string): string {
  const normalizedObjectPath = normalizeMediaObjectPath(objectPath)
  const normalizedAllowedPrefix = normalizeMediaAllowedPrefix(allowedPrefix)

  if (!normalizedObjectPath.startsWith(normalizedAllowedPrefix)) {
    throw new Error('objectPath fuera del prefijo permitido para media proxy público')
  }

  const payload: MediaProxyTokenPayload = {
    containerName: bucketName,
    objectPath: normalizedObjectPath,
    scope: 'public_prefixed',
    allowedPrefix: normalizedAllowedPrefix
  }

  return encryptMediaProxyPayload(payload)
}

export function buildMediaProxyUrl(token: string, baseUrl?: string): string {
  const relativePath = `/api/v1/storage/media?token=${encodeURIComponent(token)}`
  if (!baseUrl) {
    return relativePath
  }
  return `${baseUrl.replace(/\/$/, '')}${relativePath}`
}

export function getMaskedReadUrl(objectPath: string, userId: string, bucketName?: string): string {
  const token = createMediaProxyToken(bucketName ?? getDefaultStorageContainerName(), objectPath, userId)
  return buildMediaProxyUrl(token)
}

export function buildPublicMediaProxyUrlFromStorageUrl(sourceUrl: string | null, appBaseUrl: string, allowedPrefix: string): string | null {
  if (sourceUrl === null) {
    return null
  }

  const parsed = parseStoragePublicUrl(sourceUrl)
  if (parsed === null) {
    return sourceUrl
  }

  if (!isAllowedStorageContainer(parsed.containerName)) {
    return null
  }

  try {
    if (!isObjectPathAllowedForPrefix(parsed.objectPath, allowedPrefix)) {
      return null
    }
  } catch {
    return null
  }

  try {
    const normalizedAllowedPrefix = normalizeMediaAllowedPrefix(allowedPrefix)
    const token = createPrefixedPublicMediaProxyToken(parsed.containerName, parsed.objectPath, normalizedAllowedPrefix)
    return buildMediaProxyUrl(token, appBaseUrl)
  } catch {
    return null
  }
}

export function verifyMediaProxyToken(token: string): MediaProxyTokenPayload | null {
  const encryptedPayload = decryptMediaProxyPayload(token)
  if (encryptedPayload) {
    return encryptedPayload
  }

  // Compatibilidad con tokens legacy ya emitidos en sesiones antiguas.
  return verifyLegacyMediaProxyToken(token)
}

function getStorageClient(): Storage {
  if (!GCS_CONFIG.projectId || !GCS_CONFIG.bucketName) {
    throw new Error('Configuración de almacenamiento incompleta para proveedor GCS.')
  }

  if (!GCS_CONFIG.credentials) {
    return new Storage({
      projectId: GCS_CONFIG.projectId
    })
  }

  return new Storage({
    projectId: GCS_CONFIG.projectId,
    credentials: GCS_CONFIG.credentials
  })
}

export type StorageFolder = 'exercises/videos' | 'exercises/thumbnails' | 'avatars' | 'attachments' | 'branding' | 'receipts' | 'marketplace/storefronts'

export interface SignedUploadUrlOptions {
  /** Nombre final del archivo en el bucket (sin carpeta) */
  fileName: string
  /** MIME type del archivo a subir */
  contentType: string
  /** Subcarpeta destino dentro del bucket */
  folder: StorageFolder
  /**
   * Tamaño exacto del archivo en bytes.
   * Cuando se provee, se incluye como `Content-Length` en `extensionHeaders` de la signed URL v4.
   * GCS rechaza (403) cualquier PUT cuyo header Content-Length no coincida con el valor firmado.
   * Omitir este campo elimina la restricción de tamaño — solo usar cuando el tamaño no sea conocido
   * de antemano y se confíe en otras capas de control (p. ej. bucket quota, policies).
   */
  fileSize?: number
}

export interface SignedUploadUrlResult {
  /** URL firmada para PUT directo desde el cliente */
  signedUrl: string
  /** URL pública permanente del archivo una vez subido */
  publicUrl: string
  /** Ruta completa dentro del bucket */
  objectPath: string
}

export type ParsedStoragePublicUrl = {
  containerName: string
  objectPath: string
}

interface StorageProvider {
  readonly name: string
  getDefaultContainerName(): string
  getSignedUploadUrl(options: SignedUploadUrlOptions): Promise<SignedUploadUrlResult>
  getSignedReadUrl(objectPath: string, containerName?: string): Promise<string>
  parsePublicUrl(publicUrl: string): ParsedStoragePublicUrl | null
  isAllowedContainer(containerName: string): boolean
  buildPublicUrl(objectPath: string, containerName?: string): string
  uploadBuffer(buffer: Buffer, folder: StorageFolder, fileName: string, contentType: string): Promise<{ publicUrl: string; objectPath: string }>
  deleteObject(objectPath: string): Promise<void>
}

const GCS_PUBLIC_URL_BASE = 'https://storage.googleapis.com/'

const ALLOWED_GCS_BUCKETS: ReadonlySet<string> = new Set(
  [GCS_CONFIG.bucketName, 'wmc-marketplace-prod', 'wmc-marketplace-dev'].filter((bucket): bucket is string => typeof bucket === 'string' && bucket.length > 0)
)

const gcsStorageProvider: StorageProvider = {
  name: 'gcs',
  getDefaultContainerName(): string {
    if (!GCS_CONFIG.bucketName) {
      throw new Error('GCS_BUCKET_NAME no está definido.')
    }
    return GCS_CONFIG.bucketName
  },
  async getSignedUploadUrl(options: SignedUploadUrlOptions): Promise<SignedUploadUrlResult> {
    const { fileName, contentType, folder, fileSize } = options

    const objectPath = `${folder}/${fileName}`
    const storage = getStorageClient()
    const bucket = storage.bucket(this.getDefaultContainerName())
    const file = bucket.file(objectPath)

    const extensionHeaders: Record<string, string> = {}
    if (fileSize !== undefined && fileSize > 0) {
      extensionHeaders['Content-Length'] = String(fileSize)
    }

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + SIGNED_URL_EXPIRATION_SECONDS * 1000,
      contentType,
      extensionHeaders
    })

    const publicUrl = this.buildPublicUrl(objectPath)

    return {
      signedUrl,
      publicUrl,
      objectPath
    }
  },
  async getSignedReadUrl(objectPath: string, containerName?: string): Promise<string> {
    const storage = getStorageClient()
    const bucket = storage.bucket(containerName ?? this.getDefaultContainerName())
    const file = bucket.file(objectPath)

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + SIGNED_READ_URL_EXPIRATION_SECONDS * 1000
    })

    return signedUrl
  },
  parsePublicUrl(publicUrl: string): ParsedStoragePublicUrl | null {
    const cleanUrl = publicUrl.split('?')[0]
    if (!cleanUrl.startsWith(GCS_PUBLIC_URL_BASE)) {
      return null
    }
    const withoutBase = cleanUrl.slice(GCS_PUBLIC_URL_BASE.length)
    const slashIdx = withoutBase.indexOf('/')
    if (slashIdx === -1) {
      return null
    }
    const containerName = withoutBase.slice(0, slashIdx)

    let objectPath: string
    try {
      objectPath = decodeURIComponent(withoutBase.slice(slashIdx + 1))
    } catch {
      return null
    }

    if (!containerName || !objectPath) {
      return null
    }

    return { containerName, objectPath }
  },
  isAllowedContainer(containerName: string): boolean {
    return ALLOWED_GCS_BUCKETS.has(containerName)
  },
  buildPublicUrl(objectPath: string, containerName?: string): string {
    return `${GCS_PUBLIC_URL_BASE}${containerName ?? this.getDefaultContainerName()}/${objectPath}`
  },
  async uploadBuffer(buffer: Buffer, folder: StorageFolder, fileName: string, contentType: string): Promise<{ publicUrl: string; objectPath: string }> {
    const objectPath = `${folder}/${fileName}`
    const storage = getStorageClient()
    const bucket = storage.bucket(this.getDefaultContainerName())
    const file = bucket.file(objectPath)

    await file.save(buffer, { contentType, resumable: false })

    const publicUrl = this.buildPublicUrl(objectPath)
    return { publicUrl, objectPath }
  },
  async deleteObject(objectPath: string): Promise<void> {
    const storage = getStorageClient()
    const bucket = storage.bucket(this.getDefaultContainerName())
    await bucket.file(objectPath).delete({ ignoreNotFound: true })
  }
}

let providerSingleton: StorageProvider | null = null

function getStorageProvider(): StorageProvider {
  if (providerSingleton) {
    return providerSingleton
  }

  const providerName = (process.env.STORAGE_PROVIDER ?? 'gcs').toLowerCase()
  if (providerName !== 'gcs') {
    throw new Error(`Proveedor de storage no soportado: ${providerName}`)
  }

  providerSingleton = gcsStorageProvider
  return providerSingleton
}

export function getDefaultStorageContainerName(): string {
  return getStorageProvider().getDefaultContainerName()
}

export function buildStoragePublicUrl(objectPath: string, containerName?: string): string {
  return getStorageProvider().buildPublicUrl(objectPath, containerName)
}

export function parseStoragePublicUrl(publicUrl: string): ParsedStoragePublicUrl | null {
  return getStorageProvider().parsePublicUrl(publicUrl)
}

export function isAllowedStorageContainer(containerName: string): boolean {
  return getStorageProvider().isAllowedContainer(containerName)
}

/**
 * Genera una URL firmada (PUT v4) para que el cliente suba un archivo directamente a GCS.
 * Uso desde el cliente:
 *   await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': contentType } })
 * El servidor NO toca el archivo; solo entrega la URL autenticada.
 */
export async function getSignedUploadUrl(options: SignedUploadUrlOptions): Promise<SignedUploadUrlResult> {
  return getStorageProvider().getSignedUploadUrl(options)
}

export const getStorageSignedUploadUrl = getSignedUploadUrl

/**
 * Genera una URL firmada (GET v4) para que el cliente lea/descargue un archivo de GCS.
 * Útil cuando el bucket no tiene acceso público (org policy).
 */
export async function getSignedReadUrl(objectPath: string, bucketName?: string): Promise<string> {
  return getStorageProvider().getSignedReadUrl(objectPath, bucketName)
}

export const getStorageSignedReadUrl = getSignedReadUrl

/** Comprueba si un nombre de bucket pertenece a los buckets permitidos de la plataforma. */
export function isAllowedGcsBucket(bucketName: string): boolean {
  return isAllowedStorageContainer(bucketName)
}

/**
 * Extrae bucketName y objectPath de cualquier URL pública de GCS.
 * Soporta URLs firmadas (query params) y rutas codificadas.
 * No valida contra el bucket configurado — apto para URLs cross-bucket.
 */
export function parseGcsPublicUrl(publicUrl: string): { bucketName: string; objectPath: string } | null {
  const parsed = parseStoragePublicUrl(publicUrl)
  if (parsed === null) {
    return null
  }
  return { bucketName: parsed.containerName, objectPath: parsed.objectPath }
}

/**
 * Extrae el objectPath a partir de una publicUrl del bucket.
 * Solo retorna non-null si la URL pertenece al bucket configurado (GCS_BUCKET_NAME).
 * Para resolución cross-bucket usa parseGcsPublicUrl.
 */
export function objectPathFromPublicUrl(publicUrl: string): string | null {
  const parsed = parseStoragePublicUrl(publicUrl)
  if (parsed === null) {
    return null
  }
  if (parsed.containerName !== getDefaultStorageContainerName()) {
    return null
  }
  return parsed.objectPath
}

/**
 * Resuelve una URL de GCS a una URL firmada de lectura.
 * Solo firma si el bucket pertenece a la lista de buckets permitidos.
 * Si la URL no es de GCS, la devuelve tal cual.
 * Si la conversión o el firmado fallan, devuelve null.
 */
export async function resolveGcsUrl(url: string | null): Promise<string | null> {
  if (url === null) {
    return null
  }
  const parsed = parseStoragePublicUrl(url)
  if (parsed === null) {
    return url
  }
  if (!isAllowedStorageContainer(parsed.containerName)) {
    return null
  }
  try {
    return await getSignedReadUrl(parsed.objectPath, parsed.containerName)
  } catch {
    return null
  }
}

/**
 * Igual que `resolveGcsUrl`, pero solo firma si el objectPath comienza con
 * `allowedPrefix` y el bucket pertenece a la lista de buckets permitidos.
 * Si el objeto no está bajo el prefijo permitido o el bucket no está autorizado
 * devuelve `null` en lugar de la URL original para no exponer rutas internas.
 * Para URLs que no pertenecen a GCS (externas) devuelve la URL tal cual.
 *
 * Uso típico:
 *   resolveGcsUrlScoped(exercise.video_url, 'exercises/videos/')
 *   resolveGcsUrlScoped(block.image_url,    'branding/')
 */
export async function resolveGcsUrlScoped(url: string | null, allowedPrefix: string): Promise<string | null> {
  if (url === null) {
    return null
  }
  const parsed = parseStoragePublicUrl(url)
  if (parsed === null) {
    // Not a GCS URL — return as-is (could be an external URL)
    return url
  }
  if (!isAllowedStorageContainer(parsed.containerName)) {
    // Bucket is not in the allowlist — refuse to sign.
    return null
  }
  if (!parsed.objectPath.startsWith(allowedPrefix)) {
    // Object is outside the allowed folder — refuse to sign to avoid leaking object paths.
    return null
  }
  try {
    return await getSignedReadUrl(parsed.objectPath, parsed.containerName)
  } catch {
    return null
  }
}

/**
 * Sube un Buffer directamente al bucket (uso server-side).
 * Útil para thumbnails generados en el servidor (frames de video, etc.).
 */
export async function uploadBufferToStorage(
  buffer: Buffer,
  folder: StorageFolder,
  fileName: string,
  contentType: string
): Promise<{ publicUrl: string; objectPath: string }> {
  return getStorageProvider().uploadBuffer(buffer, folder, fileName, contentType)
}

export const uploadBufferToGcs = uploadBufferToStorage

/**
 * Elimina un archivo del bucket. Usado en soft-delete de ejercicios o reemplazos.
 */
export async function deleteStorageObject(objectPath: string): Promise<void> {
  await getStorageProvider().deleteObject(objectPath)
}
