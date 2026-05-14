import { z } from 'zod'

const OptionalHttpsUrlSchema = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.string().url('La URL no es válida').startsWith('https://', 'La URL debe ser HTTPS').trim().optional()
)

const DATA_IMAGE_URL_PATTERN = /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=]+$/i

const OptionalPublicMediaUrlSchema = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z
    .string()
    .trim()
    .refine((value) => {
      if (DATA_IMAGE_URL_PATTERN.test(value)) {
        return true
      }

      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    }, 'La URL pública no es válida')
    .optional()
)

const OptionalEmailSchema = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.string().email('El correo de soporte no es válido').trim().optional()
)

const FormBooleanSchema = z.preprocess((v) => {
  if (v === 'true') {
    return true
  }

  if (v === 'false') {
    return false
  }

  return v
}, z.boolean())

const LanguageCodeSchema = z
  .string()
  .trim()
  .min(2, 'Código de idioma inválido')
  .max(12, 'Código de idioma inválido')
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, {
    message: 'Código de idioma inválido'
  })

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

// ── Storefront Draft Authoring Schemas (admin) ───────────────────────────────

export const SaveMarketplaceAppStorefrontDraftSchema = z.object({
  app_id: z.string().uuid('ID de app inválido'),
  summary: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().max(300, 'El resumen no puede superar 300 caracteres').default('')),
  description: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().default('')),
  instructions: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().default('')),
  developer_name: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z.string().max(120, 'El nombre del desarrollador no puede superar 120 caracteres').default('')
  ),
  developer_website: OptionalHttpsUrlSchema,
  support_email: OptionalEmailSchema,
  support_url: OptionalHttpsUrlSchema,
  language_codes: z.array(LanguageCodeSchema).max(12, 'No puedes seleccionar más de 12 idiomas').default([])
})

export type SaveMarketplaceAppStorefrontDraftInput = z.infer<typeof SaveMarketplaceAppStorefrontDraftSchema>

export const PrepareMarketplaceAppMediaUploadSchema = z.object({
  app_id: z.string().uuid('ID de app inválido'),
  media_type: z.enum(['ICON', 'SCREENSHOT']),
  file_name: z.string().min(1, 'El nombre del archivo es requerido').max(200, 'El nombre del archivo es demasiado largo').trim(),
  content_type: z.string().min(1, 'El tipo de archivo es requerido').max(120, 'El tipo de archivo es inválido').trim(),
  size_bytes: z.coerce
    .number()
    .int()
    .positive('El tamaño debe ser mayor que 0')
    .max(10 * 1024 * 1024, 'El archivo supera el máximo permitido de 10MB')
})

export type PrepareMarketplaceAppMediaUploadInput = z.infer<typeof PrepareMarketplaceAppMediaUploadSchema>

export const RegisterMarketplaceAppMediaSchema = z
  .object({
    app_id: z.string().uuid('ID de app inválido'),
    media_type: z.enum(['ICON', 'SCREENSHOT', 'VIDEO']),
    storage_key: z.preprocess((v) => (v === '' ? undefined : v), z.string().max(500, 'La llave de storage es demasiado larga').trim().optional()),
    public_url: OptionalPublicMediaUrlSchema,
    external_video_url: OptionalHttpsUrlSchema,
    alt_text: z.preprocess((v) => (v === '' ? undefined : v), z.string().max(160, 'El texto alternativo no puede superar 160 caracteres').trim().optional()),
    attach_to_draft: FormBooleanSchema.optional().default(true)
  })
  .superRefine((data, ctx) => {
    if (data.media_type === 'VIDEO') {
      if (!data.external_video_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La URL externa es requerida para videos',
          path: ['external_video_url']
        })
      }
      return
    }

    if (!data.storage_key) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La llave de storage es requerida para iconos y screenshots',
        path: ['storage_key']
      })
    }
  })

export type RegisterMarketplaceAppMediaInput = z.infer<typeof RegisterMarketplaceAppMediaSchema>

export const RemoveMarketplaceAppMediaSchema = z.object({
  app_id: z.string().uuid('ID de app inválido'),
  media_id: z.string().uuid('ID de media inválido'),
  detach_from_draft: FormBooleanSchema.optional().default(true),
  remove_from_library: FormBooleanSchema.optional().default(false)
})

export type RemoveMarketplaceAppMediaInput = z.infer<typeof RemoveMarketplaceAppMediaSchema>

export const ReorderMarketplaceAppStorefrontMediaSchema = z.object({
  app_id: z.string().uuid('ID de app inválido'),
  ordered_media_ids: z.array(z.string().uuid('ID de media inválido')).min(1, 'Debes enviar al menos un media').max(40, 'Demasiados elementos para reordenar')
})

export type ReorderMarketplaceAppStorefrontMediaInput = z.infer<typeof ReorderMarketplaceAppStorefrontMediaSchema>

export const PublishMarketplaceAppStorefrontSchema = z.object({
  app_id: z.string().uuid('ID de app inválido')
})

export type PublishMarketplaceAppStorefrontInput = z.infer<typeof PublishMarketplaceAppStorefrontSchema>

export const ListMarketplaceLanguageCatalogSchema = z.object({
  only_active: FormBooleanSchema.optional().default(true)
})

export type ListMarketplaceLanguageCatalogInput = z.infer<typeof ListMarketplaceLanguageCatalogSchema>

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
