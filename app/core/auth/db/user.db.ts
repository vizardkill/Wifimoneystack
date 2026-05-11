import type { EmailVerificationToken, User } from '@prisma/client'

import { db } from '@/db.server'

import type { CreateUserData, UpdateUserData } from '@lib/interfaces'

/**
 * Data Access Object para la entidad User
 */
export class UserDB {
  /**
   * Crea un nuevo usuario
   */
  static async create(userData: CreateUserData): Promise<User> {
    const now = new Date()
    return db.user.create({
      data: {
        ...userData,
        role: userData.role ?? 'USER',
        email_verified: userData.email_verified ?? false,
        is_active: userData.is_active ?? true,
        created_at: now,
        updated_at: now
      }
    })
  }

  /**
   * Busca un usuario por email
   */
  static async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({ where: { email } })
  }

  /**
   * Encuentra un usuario por ID o email
   */
  static async findUser(by: { id: string } | { email: string }): Promise<User | null> {
    return db.user.findUnique({ where: by })
  }

  /**
   * Obtiene un usuario por ID
   */
  static async getById(id: string): Promise<User | null> {
    return db.user.findUnique({ where: { id } })
  }

  /**
   * Obtiene usuarios en modo seguro (sin password), con paginación.
   */
  static async getAll(
    options: { page?: number; limit?: number } = {}
  ): Promise<Pick<User, 'id' | 'created_at' | 'updated_at' | 'email' | 'first_name' | 'last_name' | 'role' | 'email_verified' | 'is_active'>[]> {
    const page = options.page ?? 1
    const limit = Math.min(options.limit ?? 50, 100)
    const skip = (page - 1) * limit

    return db.user.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        email_verified: true,
        is_active: true
      }
    })
  }

  /**
   * Actualiza un usuario
   */
  static async update(id: string, userData: UpdateUserData): Promise<User> {
    return db.user.update({
      where: { id },
      data: { ...userData, updated_at: new Date() }
    })
  }

  /**
   * Elimina un usuario
   */
  static async delete(id: string): Promise<User> {
    return db.user.delete({ where: { id } })
  }

  /**
   * Crea un token de verificación de email
   */
  static async createEmailVerificationToken(userId: string, tokenData: Omit<EmailVerificationToken, 'id' | 'user_id'>): Promise<EmailVerificationToken> {
    return db.emailVerificationToken.create({
      data: {
        ...tokenData,
        user_id: userId
      }
    })
  }

  /**
   * Busca un token de verificación de email
   */
  static async findEmailVerificationToken(token: string): Promise<EmailVerificationToken | null> {
    return db.emailVerificationToken.findUnique({ where: { token } })
  }

  /**
   * Elimina un token de verificación de email
   */
  static async deleteEmailVerificationToken(id: string): Promise<EmailVerificationToken> {
    return db.emailVerificationToken.delete({ where: { id } })
  }

  /**
   * Elimina todos los tokens de verificación de un usuario
   */
  static async deleteAllEmailVerificationTokens(userId: string): Promise<void> {
    await db.emailVerificationToken.deleteMany({ where: { user_id: userId } })
  }

  /**
   * Retorna solo el nombre completo de un usuario por ID.
   * Útil para campos de auditoría sin exponer datos sensibles.
   */
  static async findNameById(id: string): Promise<{ first_name: string; last_name: string } | null> {
    return db.user.findUnique({
      where: { id },
      select: { first_name: true, last_name: true }
    })
  }
}
