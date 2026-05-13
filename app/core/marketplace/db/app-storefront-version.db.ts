import type { MarketplaceStorefrontReadinessStatus, MarketplaceStorefrontVersionKind, Prisma } from '@prisma/client'

import { db } from '@/db.server'

import type { IMarketplaceAppStorefrontVersion } from '@lib/interfaces'

type StorefrontVersionWithRelations = Prisma.MarketplaceAppStorefrontVersionGetPayload<{
  include: {
    languages: { include: { language: true } }
    media: { include: { media: true } }
  }
}>

export class AppStorefrontVersionDB {
  static async findById(id: string): Promise<IMarketplaceAppStorefrontVersion | null> {
    return db.marketplaceAppStorefrontVersion.findUnique({ where: { id } })
  }

  static async findByAppAndKind(app_id: string, kind: MarketplaceStorefrontVersionKind): Promise<IMarketplaceAppStorefrontVersion | null> {
    return db.marketplaceAppStorefrontVersion.findUnique({
      where: {
        app_id_kind: {
          app_id,
          kind
        }
      }
    })
  }

  static async findByAppAndKindWithRelations(app_id: string, kind: MarketplaceStorefrontVersionKind): Promise<StorefrontVersionWithRelations | null> {
    return db.marketplaceAppStorefrontVersion.findUnique({
      where: {
        app_id_kind: {
          app_id,
          kind
        }
      },
      include: {
        languages: {
          include: { language: true },
          orderBy: { sort_order: 'asc' }
        },
        media: {
          include: { media: true },
          orderBy: { sort_order: 'asc' }
        }
      }
    })
  }

  static async ensureDraft(app_id: string, actor_user_id: string): Promise<IMarketplaceAppStorefrontVersion> {
    return db.marketplaceAppStorefrontVersion.upsert({
      where: {
        app_id_kind: {
          app_id,
          kind: 'DRAFT'
        }
      },
      create: {
        app_id,
        kind: 'DRAFT',
        readiness_status: 'INCOMPLETE',
        created_by_user_id: actor_user_id,
        updated_by_user_id: actor_user_id
      },
      update: {
        updated_by_user_id: actor_user_id
      }
    })
  }

  static async upsertByAppKind(input: {
    app_id: string
    kind: MarketplaceStorefrontVersionKind
    actor_user_id: string
    readiness_status?: MarketplaceStorefrontReadinessStatus
    summary?: string
    description?: string
    instructions?: string
    developer_name?: string
    developer_website?: string
    support_email?: string | null
    support_url?: string | null
    published_at?: Date | null
  }): Promise<IMarketplaceAppStorefrontVersion> {
    const createData = {
      app_id: input.app_id,
      kind: input.kind,
      readiness_status: input.readiness_status ?? 'INCOMPLETE',
      summary: input.summary ?? '',
      description: input.description ?? '',
      instructions: input.instructions ?? '',
      developer_name: input.developer_name ?? '',
      developer_website: input.developer_website ?? '',
      support_email: input.support_email ?? null,
      support_url: input.support_url ?? null,
      published_at: input.published_at ?? null,
      created_by_user_id: input.actor_user_id,
      updated_by_user_id: input.actor_user_id
    }

    return db.marketplaceAppStorefrontVersion.upsert({
      where: {
        app_id_kind: {
          app_id: input.app_id,
          kind: input.kind
        }
      },
      create: createData,
      update: {
        readiness_status: input.readiness_status,
        summary: input.summary,
        description: input.description,
        instructions: input.instructions,
        developer_name: input.developer_name,
        developer_website: input.developer_website,
        support_email: input.support_email,
        support_url: input.support_url,
        published_at: input.published_at,
        updated_by_user_id: input.actor_user_id
      }
    })
  }

  static async updateReadiness(id: string, readiness_status: MarketplaceStorefrontReadinessStatus): Promise<IMarketplaceAppStorefrontVersion> {
    return db.marketplaceAppStorefrontVersion.update({
      where: { id },
      data: { readiness_status }
    })
  }

  static async replacePublishedFromDraft(params: { app_id: string; actor_user_id: string; published_at?: Date }): Promise<IMarketplaceAppStorefrontVersion> {
    return db.$transaction(async (tx) => {
      const draft = await tx.marketplaceAppStorefrontVersion.findUnique({
        where: {
          app_id_kind: {
            app_id: params.app_id,
            kind: 'DRAFT'
          }
        },
        include: {
          languages: { orderBy: { sort_order: 'asc' } },
          media: { orderBy: { sort_order: 'asc' } }
        }
      })

      if (!draft) {
        throw new Error('No existe storefront draft para publicar')
      }

      const published = await tx.marketplaceAppStorefrontVersion.upsert({
        where: {
          app_id_kind: {
            app_id: params.app_id,
            kind: 'PUBLISHED'
          }
        },
        create: {
          app_id: params.app_id,
          kind: 'PUBLISHED',
          readiness_status: draft.readiness_status,
          summary: draft.summary,
          description: draft.description,
          instructions: draft.instructions,
          developer_name: draft.developer_name,
          developer_website: draft.developer_website,
          support_email: draft.support_email,
          support_url: draft.support_url,
          created_by_user_id: params.actor_user_id,
          updated_by_user_id: params.actor_user_id,
          published_at: params.published_at ?? new Date()
        },
        update: {
          readiness_status: draft.readiness_status,
          summary: draft.summary,
          description: draft.description,
          instructions: draft.instructions,
          developer_name: draft.developer_name,
          developer_website: draft.developer_website,
          support_email: draft.support_email,
          support_url: draft.support_url,
          updated_by_user_id: params.actor_user_id,
          published_at: params.published_at ?? new Date()
        }
      })

      await tx.marketplaceAppStorefrontVersionLanguage.deleteMany({
        where: { storefront_version_id: published.id }
      })

      if (draft.languages.length > 0) {
        await tx.marketplaceAppStorefrontVersionLanguage.createMany({
          data: draft.languages.map((item) => ({
            storefront_version_id: published.id,
            language_code: item.language_code,
            sort_order: item.sort_order
          }))
        })
      }

      await tx.marketplaceAppStorefrontVersionMedia.deleteMany({
        where: { storefront_version_id: published.id }
      })

      if (draft.media.length > 0) {
        await tx.marketplaceAppStorefrontVersionMedia.createMany({
          data: draft.media.map((item) => ({
            storefront_version_id: published.id,
            media_id: item.media_id,
            sort_order: item.sort_order
          }))
        })
      }

      return published
    })
  }
}
