import type { PasswordResetToken, Prisma } from '@prisma/client'

import { db } from '@/db.server'

/**
 * Data Access Object para tokens de reseteo de contraseña
 */
export class PasswordResetTokenDB {
  /**
   * Busca un token de reseteo por su valor
   */
  static async findByToken(token: string): Promise<PasswordResetToken | null> {
    return db.passwordResetToken.findUnique({ where: { token } })
  }

  /**
   * Crea un nuevo token de reseteo
   */
  static async create(data: Omit<PasswordResetToken, 'id'>): Promise<PasswordResetToken> {
    return db.passwordResetToken.create({ data })
  }

  /**
   * Elimina todos los tokens de un usuario
   */
  static async deleteManyByUserId(userId: string): Promise<Prisma.BatchPayload> {
    return db.passwordResetToken.deleteMany({ where: { user_id: userId } })
  }

  /**
   * Elimina un token específico por ID
   */
  static async delete(id: string): Promise<PasswordResetToken> {
    return db.passwordResetToken.delete({ where: { id } })
  }
}
