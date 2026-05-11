import { z } from 'zod'

// ── Access Request Schema ──────────────────────────────────────────────────────

export const RequestMarketplaceAccessSchema = z.object({
  company_name: z.string().max(120).trim().optional(),
  business_url: z.preprocess((v) => (v === '' ? undefined : v), z.string().url('La URL del negocio no es válida').trim().optional()),
  business_type: z.string().max(80).trim().optional(),
  request_notes: z.string().max(500).trim().optional()
})

export type RequestMarketplaceAccessInput = z.infer<typeof RequestMarketplaceAccessSchema>

// ── Access Decision Schema (admin) ────────────────────────────────────────────

export const DecideAccessRequestSchema = z.object({
  request_id: z.string().uuid('ID de solicitud inválido'),
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().max(500).trim().optional()
})

export type DecideAccessRequestInput = z.infer<typeof DecideAccessRequestSchema>

// ── Revoke Access Schema (admin) ──────────────────────────────────────────────

export const RevokeAccessSchema = z.object({
  request_id: z.string().uuid('ID de solicitud inválido'),
  reason: z.string().max(500).trim().optional()
})

export type RevokeAccessInput = z.infer<typeof RevokeAccessSchema>

// ── Upsert App Schema (admin) ─────────────────────────────────────────────────

export const UpsertMarketplaceAppSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido').max(120, 'El nombre no puede superar 120 caracteres').trim(),
    summary: z.string().min(1, 'El resumen es requerido').max(300).trim(),
    description: z.string().min(1, 'La descripción es requerida').trim(),
    instructions: z.string().min(1, 'Las instrucciones son requeridas').trim(),
    access_mode: z.enum(['WEB_LINK', 'PACKAGE_DOWNLOAD']),
    web_url: z.preprocess(
      (v) => (v === '' ? undefined : v),
      z.string().url('La URL de la app no es válida').startsWith('https://', 'La URL debe ser HTTPS').trim().optional()
    )
  })
  .superRefine((data, ctx) => {
    if (data.access_mode === 'WEB_LINK' && !data.web_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La URL de la app es requerida para apps de tipo WEB_LINK',
        path: ['web_url']
      })
    }
  })

export type UpsertMarketplaceAppInput = z.infer<typeof UpsertMarketplaceAppSchema>

// ── Publication Schema (admin) ────────────────────────────────────────────────

export const UpdateAppPublicationSchema = z.object({
  app_id: z.string().uuid('ID de app inválido'),
  publish: z.boolean()
})

export type UpdateAppPublicationInput = z.infer<typeof UpdateAppPublicationSchema>

// ── List/Filter Schemas ────────────────────────────────────────────────────────

export const ListAppsFilterSchema = z.object({
  search: z.string().trim().optional(),
  access_mode: z.enum(['WEB_LINK', 'PACKAGE_DOWNLOAD']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(20)
})

export type ListAppsFilterInput = z.infer<typeof ListAppsFilterSchema>

export const ListAccessRequestsFilterSchema = z.object({
  status_filter: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REVOKED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(20)
})

export type ListAccessRequestsFilterInput = z.infer<typeof ListAccessRequestsFilterSchema>
