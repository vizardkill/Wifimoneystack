import assert from 'node:assert/strict'
import test from 'node:test'

import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'
import { CLS_DecideMarketplaceAccessRequest } from '@/core/marketplace/services/_decide-access-request.service'

import { overrideStaticMethod, withOverrides } from '../helpers/mock-static'

test('integración first-write-wins: la primera decisión se persiste y la segunda entra en conflicto', async () => {
  const request = {
    id: 'req-int-1',
    user_id: 'user-int-1',
    status: 'PENDING' as const,
    company_name: null,
    business_url: null,
    business_type: null,
    request_notes: null,
    decision_reason: null,
    decided_by_user_id: null,
    decided_at: null,
    revoked_at: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z')
  }

  let wasDecided = false
  let auditWrites = 0

  const restores = [
    overrideStaticMethod(AccessRequestDB, 'findById', async () => request),
    overrideStaticMethod(AccessRequestDB, 'updateDecisionIfCurrent', async () => {
      if (!wasDecided) {
        wasDecided = true
        return { updated: true, record: { ...request, status: 'APPROVED' as const } }
      }
      return { updated: false, record: null }
    }),
    overrideStaticMethod(MarketplaceAuditEventDB, 'create', async (input) => {
      auditWrites += 1
      return {
        id: `audit-${auditWrites}`,
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
    const firstAdminResult = await new CLS_DecideMarketplaceAccessRequest({
      request_id: request.id,
      actor_user_id: 'admin-A',
      decision: 'APPROVED',
      expected_updated_at: request.updated_at
    }).main()

    const secondAdminResult = await new CLS_DecideMarketplaceAccessRequest({
      request_id: request.id,
      actor_user_id: 'admin-B',
      decision: 'APPROVED',
      expected_updated_at: request.updated_at
    }).main()

    assert.equal(firstAdminResult.status, 'completed')
    assert.equal(secondAdminResult.status, 'conflict')
    assert.equal(auditWrites, 1)
  })
})
