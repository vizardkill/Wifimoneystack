import type { MarketplaceApp } from '@prisma/client'
import assert from 'node:assert/strict'
import test from 'node:test'

import { MarketplaceAppDB } from '@/core/marketplace/db/marketplace-app.db'
import { MarketplaceAuditEventDB } from '@/core/marketplace/db/marketplace-audit-event.db'
import { CLS_UpdateMarketplaceAppPublication } from '@/core/marketplace/services/_update-app-publication.service'
import { CLS_UpsertMarketplaceApp } from '@/core/marketplace/services/_upsert-marketplace-app.service'

import { overrideStaticMethod, withOverrides } from '../helpers/mock-static'

test('integración apps console: crear, editar y publicar app en flujo básico', async () => {
  const actorId = 'admin-apps-1'
  const appId = 'app-int-1'

  let persistedApp: MarketplaceApp = {
    id: appId,
    slug: 'app-int-1',
    name: 'App Inicial',
    summary: 'Resumen inicial',
    description: 'Resumen inicial',
    instructions: 'Sin instrucciones adicionales.',
    access_mode: 'WEB_LINK' as const,
    status: 'DRAFT' as const,
    web_url: null,
    published_at: null,
    created_by_user_id: actorId,
    updated_by_user_id: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z')
  }

  let auditWrites = 0

  const restores = [
    overrideStaticMethod(MarketplaceAppDB, 'upsert', async (input) => {
      persistedApp = {
        ...persistedApp,
        id: input.id ?? appId,
        slug: input.slug ?? persistedApp.slug,
        name: input.name,
        summary: input.summary,
        description: input.description || input.summary,
        instructions: input.instructions || 'Sin instrucciones adicionales.',
        access_mode: input.access_mode,
        web_url: input.web_url ?? null,
        updated_by_user_id: input.actor_user_id,
        updated_at: new Date('2026-01-02T00:00:00.000Z')
      }
      return persistedApp
    }),
    overrideStaticMethod(MarketplaceAppDB, 'findById', async () => persistedApp),
    overrideStaticMethod(MarketplaceAppDB, 'validatePublicationRequirements', async () => ({ valid: true, reasons: [] })),
    overrideStaticMethod(MarketplaceAppDB, 'updateStatus', async (_id, status, publishedAt) => {
      persistedApp = {
        ...persistedApp,
        status,
        published_at: publishedAt ?? null
      }
      return persistedApp
    }),
    overrideStaticMethod(MarketplaceAuditEventDB, 'create', async (input) => {
      auditWrites += 1
      return {
        id: `audit-app-${auditWrites}`,
        actor_user_id: input.actor_user_id,
        target_user_id: null,
        app_id: input.app_id ?? appId,
        action: input.action,
        reason: input.reason ?? null,
        metadata: null,
        created_at: new Date('2026-01-01T00:00:00.000Z')
      }
    })
  ]

  await withOverrides(restores, async () => {
    const createResult = await new CLS_UpsertMarketplaceApp({
      actor_user_id: actorId,
      name: 'App Inicial',
      summary: 'Resumen inicial',
      description: '',
      instructions: '',
      access_mode: 'WEB_LINK'
    }).main()

    assert.equal(createResult.status, 'completed')
    assert.equal(createResult.data?.app_id, appId)

    const editResult = await new CLS_UpsertMarketplaceApp({
      id: appId,
      actor_user_id: actorId,
      name: 'App Editada',
      summary: 'Resumen actualizado',
      description: '',
      instructions: '',
      access_mode: 'WEB_LINK'
    }).main()

    assert.equal(editResult.status, 'completed')
    assert.equal(persistedApp.name, 'App Editada')

    const publishResult = await new CLS_UpdateMarketplaceAppPublication({
      app_id: appId,
      actor_user_id: actorId,
      publish: true
    }).main()

    assert.equal(publishResult.status, 'completed')
    assert.equal(persistedApp.status, 'ACTIVE')
    assert.equal(auditWrites, 3)
  })
})
