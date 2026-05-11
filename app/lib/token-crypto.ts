import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// ─────────────────────────────────────────────────────────────────────────────
// Cifrado AES-256-GCM para tokens de integración de Google Calendar.
// Módulo independiente sin dependencias del dominio calendar — evita ciclos de
// importación cuando es usado dinámicamente desde los servicios del provider.
// ─────────────────────────────────────────────────────────────────────────────

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY?.trim() ?? ''
  if (raw.length === 0) {
    const googleClientSecretEnv: string | undefined = process.env.GOOGLE_CLIENT_SECRET
    const googleClientSecret = typeof googleClientSecretEnv === 'string' ? googleClientSecretEnv.trim() : ''
    if (googleClientSecret.length === 0) {
      throw new Error('ENCRYPTION_KEY o GOOGLE_CLIENT_SECRET es obligatorio para cifrar tokens.')
    }

    // Fallback: derivar clave desde el client secret de Google (solo dev/local)
    return Buffer.from(googleClientSecret.padEnd(32, '0').slice(0, 32))
  }

  // Esperamos ENCRYPTION_KEY como hex de 64 chars (32 bytes)
  return Buffer.from(raw.slice(0, 64), 'hex')
}

export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Formato: iv(hex):tag(hex):ciphertext(hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptToken(ciphertext: string): string {
  const key = getEncryptionKey()
  const [ivHex, tagHex, encHex] = ciphertext.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const enc = Buffer.from(encHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(enc), decipher.final()])
  return decrypted.toString('utf8')
}
