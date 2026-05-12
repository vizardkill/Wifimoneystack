import assert from 'node:assert/strict'
import test from 'node:test'

import { UserDB } from '@/core/auth/db/user.db'
import { CLS_ListAdminAccounts, CLS_PromoteUserToAdmin } from '@/core/auth/services/_promote-admin-user.service'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'

import { overrideStaticMethod, withOverrides } from '../helpers/mock-static'

test('CLS_ListAdminAccounts bloquea actor que no sea SUPERADMIN', async () => {
  const restores = [
    overrideStaticMethod(UserDB, 'getById', async () => ({
      id: 'admin-1',
      email: 'admin@demo.com',
      first_name: 'Admin',
      last_name: 'Uno',
      password: 'hashed-password',
      role: 'ADMIN' as const,
      provider_type: 'JWT' as const,
      provider_id: null,
      email_verified: true,
      email_verified_at: new Date('2026-01-01T00:00:00.000Z'),
      profile_picture: null,
      country_id: null,
      locale: null,
      is_active: true,
      last_login_at: null,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z')
    }))
  ]

  await withOverrides(restores, async () => {
    const result = await new CLS_ListAdminAccounts({ actor_user_id: 'admin-1' }).main()
    assert.equal(result.error, true)
    assert.equal(result.status, 'forbidden')
  })
})

test('CLS_PromoteUserToAdmin bloquea promoción duplicada', async () => {
  const superAdmin = {
    id: 'super-1',
    email: 'super@demo.com',
    first_name: 'Super',
    last_name: 'Admin',
    password: 'hashed-password',
    role: 'SUPERADMIN' as const,
    provider_type: 'JWT' as const,
    provider_id: null,
    email_verified: true,
    email_verified_at: new Date('2026-01-01T00:00:00.000Z'),
    profile_picture: null,
    country_id: null,
    locale: null,
    is_active: true,
    last_login_at: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z')
  }

  const restores = [
    overrideStaticMethod(UserDB, 'getById', async () => superAdmin),
    overrideStaticMethod(UserDB, 'promoteToAdminByEmail', async () => ({
      status: 'already_admin' as const,
      user: {
        id: 'admin-2',
        email: 'admin2@demo.com',
        first_name: 'Admin',
        last_name: 'Dos',
        role: 'ADMIN' as const
      }
    }))
  ]

  await withOverrides(restores, async () => {
    const result = await new CLS_PromoteUserToAdmin({ actor_user_id: 'super-1', target_email: 'admin2@demo.com' }).main()
    assert.equal(result.error, true)
    assert.equal(result.status, 'already_admin')
  })
})

test('CLS_PromoteUserToAdmin promueve usuario existente y registra ADMIN_PROMOTED', async () => {
  const superAdmin = {
    id: 'super-2',
    email: 'super2@demo.com',
    first_name: 'Super',
    last_name: 'Dos',
    password: 'hashed-password',
    role: 'SUPERADMIN' as const,
    provider_type: 'JWT' as const,
    provider_id: null,
    email_verified: true,
    email_verified_at: new Date('2026-01-01T00:00:00.000Z'),
    profile_picture: null,
    country_id: null,
    locale: null,
    is_active: true,
    last_login_at: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z')
  }

  let auditCalls = 0

  const restores = [
    overrideStaticMethod(UserDB, 'getById', async () => superAdmin),
    overrideStaticMethod(UserDB, 'promoteToAdminByEmail', async () => ({
      status: 'promoted' as const,
      user: {
        id: 'user-7',
        email: 'user7@demo.com',
        first_name: 'User',
        last_name: 'Siete',
        role: 'ADMIN' as const
      }
    })),
    overrideStaticMethod(MarketplaceAuditEventDB, 'create', async (input) => {
      auditCalls += 1
      return {
        id: 'audit-promote-1',
        actor_user_id: input.actor_user_id,
        target_user_id: input.target_user_id ?? null,
        app_id: null,
        action: input.action,
        reason: input.reason ?? null,
        metadata: null,
        created_at: new Date('2026-01-01T00:00:00.000Z')
      }
    })
  ]

  await withOverrides(restores, async () => {
    const result = await new CLS_PromoteUserToAdmin({ actor_user_id: 'super-2', target_email: 'user7@demo.com' }).main()
    assert.equal(result.error, false)
    assert.equal(result.status, 'completed')
    assert.equal(result.data?.new_role, 'ADMIN')
    assert.equal(auditCalls, 1)
  })
})
