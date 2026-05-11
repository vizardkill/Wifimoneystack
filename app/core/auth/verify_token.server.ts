import { type User } from '@prisma/client'
import fs from 'fs'
import jwt from 'jsonwebtoken'

export function verifyUserToken(token: string): User | null {
  try {
    const publicKey = fs.readFileSync('jwtRS256.key.pub', 'utf8')
    return jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as User
  } catch {
    return null
  }
}
