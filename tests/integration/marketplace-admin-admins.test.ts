import assert from 'node:assert/strict'
import test from 'node:test'

import { UserDB } from '@/core/auth/db/user.db'
import { CLS_ListAdminAccounts, CLS_PromoteUserToAdmin } from '@/core/auth/services/_promote-admin-user.service'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'

import { overrideStaticMethod, withOverrides } from '../helpers/mock-static'

test('integración admins: superadmin promueve usuario y bloquea duplicado en segundo intento', async () => {
  const superAdmin = {
    id: 'super-int-admins-1',
    email: 'super@admins.com',
    first_name: 'Super',
    last_name: 'Admins',
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

  let promotedAlready = false
  let auditWrites = 0

  const restores = [
    overrideStaticMethod(UserDB, 'getById', async () => superAdmin),
    overrideStaticMethod(UserDB, 'listAdminAccounts', async () => ({
      admins: [
        {
          id: superAdmin.id,
          email: superAdmin.email,
          first_name: superAdmin.first_name,
          last_name: superAdmin.last_name,
          role: 'SUPERADMIN' as const,
          created_at: superAdmin.created_at
        }
      ],
      total: 1
    })),
    overrideStaticMethod(UserDB, 'promoteToAdminByEmail', async () => {
      if (promotedAlready) {
        return {
          status: 'already_admin' as const,
          user: {
            id: 'user-int-admins-1',
            email: 'candidate@admins.com',
            first_name: 'Candidate',
            last_name: 'Admin',
            role: 'ADMIN' as const
          }
        }
      }

      promotedAlready = true
      return {
        status: 'promoted' as const,
        user: {
          id: 'user-int-admins-1',
          email: 'candidate@admins.com',
          first_name: 'Candidate',
          last_name: 'Admin',
          role: 'ADMIN' as const
        }
      }
    }),
    overrideStaticMethod(MarketplaceAuditEventDB, 'create', async (input) => {
      auditWrites += 1
      return {
        id: `audit-admins-${auditWrites}`,
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
    const list = await new CLS_ListAdminAccounts({ actor_user_id: superAdmin.id }).main()
    assert.equal(list.error, false)
    assert.equal(list.data?.admins.length, 1)

    const firstPromotion = await new CLS_PromoteUserToAdmin({
      actor_user_id: superAdmin.id,
      target_email: 'candidate@admins.com'
    }).main()

    assert.equal(firstPromotion.status, 'completed')
    assert.equal(auditWrites, 1)

    const duplicatePromotion = await new CLS_PromoteUserToAdmin({
      actor_user_id: superAdmin.id,
      target_email: 'candidate@admins.com'
    }).main()

    assert.equal(duplicatePromotion.status, 'already_admin')
    assert.equal(auditWrites, 1)
  })
})
