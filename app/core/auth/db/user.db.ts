import type { EmailVerificationToken, Role, User } from '@prisma/client'

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

  /**
   * Lista cuentas con rol administrativo (ADMIN/SUPERADMIN)
   */
  static async listAdminAccounts(params: { search?: string; page?: number; per_page?: number }): Promise<{
    admins: Array<{
      id: string
      email: string
      first_name: string
      last_name: string
      role: 'ADMIN' | 'SUPERADMIN'
      created_at: Date
    }>
    total: number
  }> {
    const page = params.page ?? 1
    const per_page = params.per_page ?? 20
    const skip = (page - 1) * per_page
    const adminRoles: Role[] = ['ADMIN', 'SUPERADMIN']

    const where = {
      role: { in: adminRoles },
      ...(params.search
        ? {
            OR: [
              { email: { contains: params.search, mode: 'insensitive' as const } },
              { first_name: { contains: params.search, mode: 'insensitive' as const } },
              { last_name: { contains: params.search, mode: 'insensitive' as const } }
            ]
          }
        : {})
    }

    const [admins, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: per_page,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          created_at: true
        }
      }),
      db.user.count({ where })
    ])

    return {
      admins: admins.map((admin) => ({
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role as 'ADMIN' | 'SUPERADMIN',
        created_at: admin.created_at
      })),
      total
    }
  }

  /**
   * Promueve una cuenta existente por email al rol ADMIN.
   */
  static async promoteToAdminByEmail(target_email: string): Promise<
    | {
        status: 'not_found'
      }
    | {
        status: 'already_admin'
        user: Pick<User, 'id' | 'role' | 'email' | 'first_name' | 'last_name'>
      }
    | {
        status: 'promoted'
        user: Pick<User, 'id' | 'role' | 'email' | 'first_name' | 'last_name'>
      }
  > {
    const user = await db.user.findUnique({
      where: { email: target_email },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true
      }
    })

    if (!user) {
      return { status: 'not_found' }
    }

    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
      return { status: 'already_admin', user }
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        role: 'ADMIN',
        updated_at: new Date()
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true
      }
    })

    return { status: 'promoted', user: updated }
  }

  /**
   * Cuenta usuarios creados desde una fecha dada.
   */
  static async countCreatedSince(since: Date): Promise<number> {
    return db.user.count({
      where: {
        created_at: { gte: since }
      }
    })
  }
}
