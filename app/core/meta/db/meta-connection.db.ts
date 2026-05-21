import type { Prisma, UserMetaConnection } from '@prisma/client'

import { db } from '@/db.server'

import type { ISaveMetaConnectionRecordInput, MetaConnectionStatus } from '@lib/interfaces'

export class MetaConnectionDB {
  static async findByUserId(user_id: string): Promise<UserMetaConnection | null> {
    return db.userMetaConnection.findUnique({ where: { user_id } })
  }

  static async upsert(input: ISaveMetaConnectionRecordInput): Promise<UserMetaConnection> {
    const data = {
      token_label: input.token_label ?? null,
      encrypted_access_token: input.encrypted_access_token,
      ad_account_id: input.ad_account_id,
      business_id: input.business_id ?? null,
      status: input.status,
      account_name: input.account_name ?? null,
      account_currency: input.account_currency ?? null,
      timezone_name: input.timezone_name ?? null,
      timezone_offset_hours: input.timezone_offset_hours ?? null,
      last_validated_at: input.last_validated_at ?? null,
      last_error: input.last_error ?? null,
      ...(input.metadata !== undefined ? { metadata: input.metadata as Prisma.InputJsonValue } : {})
    }

    return db.userMetaConnection.upsert({
      where: { user_id: input.user_id },
      create: {
        user_id: input.user_id,
        ...data
      },
      update: data
    })
  }

  static async deleteByUserId(user_id: string): Promise<boolean> {
    const result = await db.userMetaConnection.deleteMany({ where: { user_id } })
    return result.count > 0
  }

  static async updateValidationState(params: {
    user_id: string
    status?: MetaConnectionStatus
    last_error?: string | null
    last_validated_at?: Date | null
  }): Promise<UserMetaConnection | null> {
    const data: Prisma.UserMetaConnectionUpdateInput = {}

    if (params.status !== undefined) {
      data.status = params.status
    }

    if (params.last_error !== undefined) {
      data.last_error = params.last_error
    }

    if (params.last_validated_at !== undefined) {
      data.last_validated_at = params.last_validated_at
    }

    try {
      return await db.userMetaConnection.update({
        where: { user_id: params.user_id },
        data
      })
    } catch {
      return null
    }
  }
}
