import { type User } from '@prisma/client'
import jwt from 'jsonwebtoken'

import { getServerOnlyModules } from '@lib/functions/_get_server_modules.function'
import { type AuthResult, AuthResultStatus } from '@lib/interfaces'

/**
 * Helper para generación y validación de tokens JWT
 */

/**
 * Genera un token JWT para un usuario
 * @param user - Usuario para el cual generar el token
 * @returns Promise<AuthResult> con el token generado
 */
export async function generateJWTToken(user: User): Promise<AuthResult> {
  if (typeof window !== 'undefined') {
    throw new Error('Server-only modules cannot be loaded on the client.')
  }

  const { fs, path, process } = await getServerOnlyModules()

  const privateKeyPath = path.resolve(process.cwd(), 'jwtRS256.key')
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8')

  const payload = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role
  }

  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '2h'
  })

  return {
    status: AuthResultStatus.SUCCESS,
    error: false,
    message: 'Token generado exitosamente',
    data: {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      token,
      expires_in: 2 * 60 * 60 // 2 horas en segundos
    }
  }
}

/**
 * Valida un token JWT
 * @param token - Token JWT a validar
 * @returns Promise con el payload decodificado
 */
export async function validateJWTToken(token: string): Promise<string | jwt.JwtPayload> {
  if (typeof window !== 'undefined') {
    throw new Error('Server-only modules cannot be loaded on the client.')
  }

  const { fs, path, process } = await getServerOnlyModules()
  const publicKeyPath = path.resolve(process.cwd(), 'jwtRS256.key.pub')
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8')

  return jwt.verify(token, publicKey, { algorithms: ['RS256'] })
}
