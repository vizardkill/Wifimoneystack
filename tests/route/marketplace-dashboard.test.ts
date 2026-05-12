import assert from 'node:assert/strict'
import test from 'node:test'

import { UserDB } from '@/core/auth/db/user.db'
import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { AppUsageEventDB } from '@/core/marketplace/db/app-usage-event.db'
import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'
import { CLS_GetMarketplaceDashboard } from '@/core/marketplace/services/_get-marketplace-dashboard.service'

import { overrideStaticMethod, withOverrides } from '../helpers/mock-static'

test('CLS_GetMarketplaceDashboard devuelve KPI actuales y variación de 7 días', async () => {
  const restores = [
    overrideStaticMethod(AccessRequestDB, 'countByStatus', async () => ({ PENDING: 4, APPROVED: 8, REJECTED: 2, REVOKED: 1 })),
    overrideStaticMethod(MarketplaceAppDB, 'countByStatus', async () => ({ DRAFT: 3, ACTIVE: 5, INACTIVE: 2 })),
    overrideStaticMethod(AppUsageEventDB, 'getTopAppsSummary', async () => [
      {
        app_id: 'app-1',
        app_name: 'App Uno',
        detail_views: 10,
        web_opens: 5,
        downloads: 2,
        installs: 1,
        total_events: 18
      }
    ]),
    overrideStaticMethod(MarketplaceAppDB, 'listWithNoRecentActivity', async () => [
      {
        id: 'app-2',
        slug: 'app-2',
        name: 'App Dos',
        summary: 'Sin actividad',
        description: 'Sin actividad',
        instructions: 'Sin actividad',
        access_mode: 'WEB_LINK',
        status: 'ACTIVE',
        web_url: null,
        published_at: new Date('2026-01-01T00:00:00.000Z'),
        created_by_user_id: 'admin-1',
        updated_by_user_id: null,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-01T00:00:00.000Z')
      }
    ]),
    overrideStaticMethod(UserDB, 'countCreatedSince', async () => 6),
    overrideStaticMethod(AccessRequestDB, 'countDecisionsSince', async () => 7),
    overrideStaticMethod(MarketplaceAuditEventDB, 'countByActionsSince', async (params) => (params.actions[0] === 'APP_PUBLISHED' ? 3 : 1))
  ]

  await withOverrides(restores, async () => {
    const result = await new CLS_GetMarketplaceDashboard({ days: 30 }).main()

    assert.equal(result.error, undefined)
    assert.ok(result.data)

    assert.equal(result.data.kpis.pending_requests, 4)
    assert.equal(result.data.kpis.approved_users, 8)
    assert.equal(result.data.kpis.total_apps, 10)
    assert.equal(result.data.kpis_variation_7d.new_users_7d, 6)
    assert.equal(result.data.kpis_variation_7d.access_decisions_7d, 7)
    assert.equal(result.data.kpis_variation_7d.apps_activated_7d, 3)
    assert.equal(result.data.kpis_variation_7d.apps_deactivated_7d, 1)
    assert.equal(result.data.top_apps.length, 1)
    assert.equal(result.data.no_activity_apps.length, 1)
  })
})

test('CLS_GetMarketplaceDashboard respeta el parámetro days para top apps y no-activity', async () => {
  let topAppsDays = 0
  let noActivityDays = 0

  const restores = [
    overrideStaticMethod(AccessRequestDB, 'countByStatus', async () => ({ PENDING: 0, APPROVED: 0, REJECTED: 0, REVOKED: 0 })),
    overrideStaticMethod(MarketplaceAppDB, 'countByStatus', async () => ({ DRAFT: 0, ACTIVE: 0, INACTIVE: 0 })),
    overrideStaticMethod(AppUsageEventDB, 'getTopAppsSummary', async (params) => {
      topAppsDays = params.days
      return []
    }),
    overrideStaticMethod(MarketplaceAppDB, 'listWithNoRecentActivity', async (days) => {
      noActivityDays = days
      return []
    }),
    overrideStaticMethod(UserDB, 'countCreatedSince', async () => 0),
    overrideStaticMethod(AccessRequestDB, 'countDecisionsSince', async () => 0),
    overrideStaticMethod(MarketplaceAuditEventDB, 'countByActionsSince', async () => 0)
  ]

  await withOverrides(restores, async () => {
    await new CLS_GetMarketplaceDashboard({ days: 7 }).main()
    assert.equal(topAppsDays, 7)
    assert.equal(noActivityDays, 7)
  })
})
