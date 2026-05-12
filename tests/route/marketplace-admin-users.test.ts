import assert from 'node:assert/strict'
import test from 'node:test'

import { AccessRequestDB } from '@/core/marketplace/db/access-request.db'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'
import { CLS_DecideMarketplaceAccessRequest } from '@/core/marketplace/services/_decide-access-request.service'
import { CLS_RevokeMarketplaceAccess } from '@/core/marketplace/services/_revoke-access.service'

import { overrideStaticMethod, withOverrides } from '../helpers/mock-static'

const baseRequest = {
  id: 'req-1',
  user_id: 'user-1',
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

test('CLS_DecideMarketplaceAccessRequest retorna conflicto si la solicitud cambió (first-write-wins)', async () => {
  const restores = [
    overrideStaticMethod(AccessRequestDB, 'findById', async () => baseRequest),
    overrideStaticMethod(AccessRequestDB, 'updateDecisionIfCurrent', async () => ({ updated: false, record: null }))
  ]

  await withOverrides(restores, async () => {
    const result = await new CLS_DecideMarketplaceAccessRequest({
      request_id: 'req-1',
      actor_user_id: 'admin-1',
      decision: 'APPROVED',
      expected_updated_at: baseRequest.updated_at
    }).main()

    assert.equal(result.error, true)
    assert.equal(result.status, 'conflict')
  })
})

test('CLS_DecideMarketplaceAccessRequest completa transición válida y registra auditoría', async () => {
  let auditCalls = 0

  const restores = [
    overrideStaticMethod(AccessRequestDB, 'findById', async () => baseRequest),
    overrideStaticMethod(AccessRequestDB, 'updateDecisionIfCurrent', async () => ({
      updated: true,
      record: { ...baseRequest, status: 'APPROVED' as const }
    })),
    overrideStaticMethod(MarketplaceAuditEventDB, 'create', async (input) => {
      auditCalls += 1
      return {
        id: 'audit-1',
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
    const result = await new CLS_DecideMarketplaceAccessRequest({
      request_id: 'req-1',
      actor_user_id: 'admin-1',
      decision: 'APPROVED'
    }).main()

    assert.equal(result.error, undefined)
    assert.equal(result.status, 'completed')
    assert.equal(result.data?.new_status, 'APPROVED')
    assert.equal(auditCalls, 1)
  })
})

test('CLS_RevokeMarketplaceAccess retorna conflicto cuando un estado APPROVED ya fue modificado', async () => {
  const approvedRequest = { ...baseRequest, status: 'APPROVED' as const }

  const restores = [
    overrideStaticMethod(AccessRequestDB, 'findById', async () => approvedRequest),
    overrideStaticMethod(AccessRequestDB, 'updateDecisionIfCurrent', async () => ({ updated: false, record: null }))
  ]

  await withOverrides(restores, async () => {
    const result = await new CLS_RevokeMarketplaceAccess({
      request_id: approvedRequest.id,
      actor_user_id: 'admin-2',
      expected_updated_at: approvedRequest.updated_at
    }).main()

    assert.equal(result.error, true)
    assert.equal(result.status, 'conflict')
  })
})
