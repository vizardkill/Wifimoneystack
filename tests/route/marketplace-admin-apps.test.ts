import assert from 'node:assert/strict'
import test from 'node:test'

import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'
import { CLS_UpdateMarketplaceAppPublication } from '@/core/marketplace/services/_update-app-publication.service'
import { CLS_UpsertMarketplaceApp } from '@/core/marketplace/services/_upsert-marketplace-app.service'

import { overrideStaticMethod, withOverrides } from '../helpers/mock-static'

test('CLS_UpsertMarketplaceApp exige name y summary para ficha básica', async () => {
  const result = await new CLS_UpsertMarketplaceApp({
    actor_user_id: 'admin-1',
    name: 'App Demo',
    summary: '',
    description: '',
    instructions: '',
    access_mode: 'WEB_LINK'
  }).main()

  assert.equal(result.error, true)
  assert.equal(result.status, 'validation')
  assert.equal(result.field_errors?.summary, 'El resumen es requerido.')
})

test('CLS_UpdateMarketplaceAppPublication falla con validation_failed cuando no cumple requisitos', async () => {
  const baseApp = {
    id: 'app-1',
    slug: 'app-1',
    name: 'App Uno',
    summary: 'Resumen',
    description: 'Descripción',
    instructions: 'Instrucciones',
    access_mode: 'WEB_LINK' as const,
    status: 'DRAFT' as const,
    web_url: null,
    published_at: null,
    created_by_user_id: 'admin-1',
    updated_by_user_id: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z')
  }

  const restores = [
    overrideStaticMethod(MarketplaceAppDB, 'findById', async () => baseApp),
    overrideStaticMethod(MarketplaceAppDB, 'validatePublicationRequirements', async () => ({ valid: false, reasons: ['Falta resumen'] }))
  ]

  await withOverrides(restores, async () => {
    const result = await new CLS_UpdateMarketplaceAppPublication({
      app_id: baseApp.id,
      actor_user_id: 'admin-1',
      publish: true
    }).main()

    assert.equal(result.error, true)
    assert.equal(result.status, 'validation_failed')
  })
})

test('CLS_UpdateMarketplaceAppPublication publica correctamente y registra auditoría', async () => {
  const baseApp = {
    id: 'app-2',
    slug: 'app-2',
    name: 'App Dos',
    summary: 'Resumen',
    description: 'Descripción',
    instructions: 'Instrucciones',
    access_mode: 'WEB_LINK' as const,
    status: 'DRAFT' as const,
    web_url: null,
    published_at: null,
    created_by_user_id: 'admin-1',
    updated_by_user_id: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z')
  }

  let auditCalls = 0
  let updatedStatus = ''

  const restores = [
    overrideStaticMethod(MarketplaceAppDB, 'findById', async () => baseApp),
    overrideStaticMethod(MarketplaceAppDB, 'validatePublicationRequirements', async () => ({ valid: true, reasons: [] })),
    overrideStaticMethod(MarketplaceAppDB, 'updateStatus', async (_id, status) => {
      updatedStatus = status
      return { ...baseApp, status }
    }),
    overrideStaticMethod(MarketplaceAuditEventDB, 'create', async (input) => {
      auditCalls += 1
      return {
        id: 'audit-1',
        actor_user_id: input.actor_user_id,
        target_user_id: null,
        app_id: input.app_id ?? null,
        action: input.action,
        reason: input.reason ?? null,
        metadata: null,
        created_at: new Date('2026-01-01T00:00:00.000Z')
      }
    })
  ]

  await withOverrides(restores, async () => {
    const result = await new CLS_UpdateMarketplaceAppPublication({
      app_id: baseApp.id,
      actor_user_id: 'admin-1',
      publish: true
    }).main()

    assert.equal(result.error, undefined)
    assert.equal(result.status, 'completed')
    assert.equal(result.data?.new_status, 'ACTIVE')
    assert.equal(updatedStatus, 'ACTIVE')
    assert.equal(auditCalls, 1)
  })
})
