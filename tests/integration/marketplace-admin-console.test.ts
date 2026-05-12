import assert from 'node:assert/strict'
import test from 'node:test'

import { UserDB } from '@/core/auth/db/user.db'
import { CLS_ListAdminAccounts, CLS_PromoteUserToAdmin } from '@/core/auth/services/_promote-admin-user.service'
import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { AppUsageEventDB } from '@/core/marketplace/db/app-usage-event.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'
import { CLS_GetMarketplaceDashboard } from '@/core/marketplace/services/_get-marketplace-dashboard.service'

import { overrideStaticMethod, withOverrides } from '../helpers/mock-static'

test('integración: superadmin lista admins, promueve usuario y dashboard responde variación 7d', async () => {
  const superAdmin = {
    id: 'super-int-1',
    email: 'super-int-1@demo.com',
    first_name: 'Super',
    last_name: 'Console',
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
    overrideStaticMethod(UserDB, 'promoteToAdminByEmail', async () => ({
      status: 'promoted' as const,
      user: {
        id: 'user-promoted-1',
        email: 'user.promoted@demo.com',
        first_name: 'User',
        last_name: 'Promoted',
        role: 'ADMIN' as const
      }
    })),
    overrideStaticMethod(MarketplaceAuditEventDB, 'create', async (input) => ({
      id: 'audit-int-1',
      actor_user_id: input.actor_user_id,
      target_user_id: input.target_user_id ?? null,
      app_id: input.app_id ?? null,
      action: input.action,
      reason: input.reason ?? null,
      metadata: null,
      created_at: new Date('2026-01-01T00:00:00.000Z')
    })),
    overrideStaticMethod(AccessRequestDB, 'countByStatus', async () => ({ PENDING: 1, APPROVED: 5, REJECTED: 1, REVOKED: 0 })),
    overrideStaticMethod(MarketplaceAppDB, 'countByStatus', async () => ({ DRAFT: 1, ACTIVE: 4, INACTIVE: 2 })),
    overrideStaticMethod(AppUsageEventDB, 'getTopAppsSummary', async () => []),
    overrideStaticMethod(MarketplaceAppDB, 'listWithNoRecentActivity', async () => []),
    overrideStaticMethod(UserDB, 'countCreatedSince', async () => 3),
    overrideStaticMethod(AccessRequestDB, 'countDecisionsSince', async () => 2),
    overrideStaticMethod(MarketplaceAuditEventDB, 'countByActionsSince', async (params) => (params.actions[0] === 'APP_PUBLISHED' ? 2 : 1))
  ]

  await withOverrides(restores, async () => {
    const adminList = await new CLS_ListAdminAccounts({ actor_user_id: superAdmin.id }).main()
    assert.equal(adminList.error, false)
    assert.equal(adminList.data?.admins.length, 1)

    const promote = await new CLS_PromoteUserToAdmin({
      actor_user_id: superAdmin.id,
      target_email: 'user.promoted@demo.com'
    }).main()

    assert.equal(promote.error, false)
    assert.equal(promote.data?.new_role, 'ADMIN')

    const dashboard = await new CLS_GetMarketplaceDashboard({ days: 30 }).main()
    assert.equal(dashboard.error, undefined)
    assert.equal(dashboard.data?.kpis.approved_users, 5)
    assert.equal(dashboard.data?.kpis_variation_7d.apps_activated_7d, 2)
  })
})

test('integración: actor sin rol superadmin no puede listar ni promover administradores', async () => {
  const admin = {
    id: 'admin-int-2',
    email: 'admin-int-2@demo.com',
    first_name: 'Admin',
    last_name: 'Regular',
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
  }

  const restores = [overrideStaticMethod(UserDB, 'getById', async () => admin)]

  await withOverrides(restores, async () => {
    const list = await new CLS_ListAdminAccounts({ actor_user_id: admin.id }).main()
    assert.equal(list.error, true)
    assert.equal(list.status, 'forbidden')

    const promote = await new CLS_PromoteUserToAdmin({ actor_user_id: admin.id, target_email: 'x@demo.com' }).main()
    assert.equal(promote.error, true)
    assert.equal(promote.status, 'forbidden')
  })
})
