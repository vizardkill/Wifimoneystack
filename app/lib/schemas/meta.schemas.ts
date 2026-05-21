import { z } from 'zod'

const META_ID_PATTERN = /^\d{5,32}$/
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const EmptyToUndefinedSchema = (value: unknown): unknown => {
  if (typeof value === 'string' && value.trim().length === 0) {
    return undefined
  }

  return value
}

const MetaAdAccountIdField = z
  .string()
  .min(1, 'El ad account id es requerido')
  .trim()
  .transform((value) => value.replace(/^act_/i, ''))
  .refine((value) => META_ID_PATTERN.test(value), 'El ad account id no es válido')

const OptionalMetaBusinessIdField = z.preprocess(
  EmptyToUndefinedSchema,
  z
    .string()
    .trim()
    .refine((value) => META_ID_PATTERN.test(value), 'El business id no es válido')
    .optional()
)

const OptionalMetaTokenLabelField = z.preprocess(EmptyToUndefinedSchema, z.string().trim().max(80, 'La etiqueta no puede superar 80 caracteres').optional())

const IsoDateField = z.string().trim().regex(ISO_DATE_PATTERN, 'La fecha debe tener formato YYYY-MM-DD')

const validateDateRange = (since: string, until: string, ctx: z.RefinementCtx): void => {
  const sinceDate = new Date(`${since}T00:00:00.000Z`)
  const untilDate = new Date(`${until}T00:00:00.000Z`)

  if (Number.isNaN(sinceDate.getTime()) || Number.isNaN(untilDate.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Las fechas no son válidas',
      path: ['since']
    })
    return
  }

  if (sinceDate.getTime() > untilDate.getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha inicial no puede ser mayor que la fecha final',
      path: ['since']
    })
  }

  const rangeInDays = Math.floor((untilDate.getTime() - sinceDate.getTime()) / 86400000)
  if (rangeInDays > 93) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El rango máximo soportado es de 93 días por consulta',
      path: ['until']
    })
  }
}

export const META_PRESET_IDS = [
  'spend_report',
  'top_creatives',
  'budget_leakage',
  'performance_by_product_or_account',
  'pause_today',
  'creative_fatigue',
  'opportunities_breakdown',
  'campaign_structure_recommendation'
] as const

export const MetaPresetIdSchema = z.enum(META_PRESET_IDS)

export const UpsertMetaConnectionSchema = z.object({
  access_token: z.string().min(20, 'El access token es requerido').trim(),
  ad_account_id: MetaAdAccountIdField,
  business_id: OptionalMetaBusinessIdField,
  token_label: OptionalMetaTokenLabelField
})

export const MetaOverviewQuerySchema = z
  .object({
    since: IsoDateField,
    until: IsoDateField
  })
  .superRefine((data, ctx) => validateDateRange(data.since, data.until, ctx))

export const MetaPresetQuerySchema = z
  .object({
    preset_id: MetaPresetIdSchema,
    since: IsoDateField,
    until: IsoDateField
  })
  .superRefine((data, ctx) => validateDateRange(data.since, data.until, ctx))

export type UpsertMetaConnectionInput = z.infer<typeof UpsertMetaConnectionSchema>
export type MetaOverviewQueryInput = z.infer<typeof MetaOverviewQuerySchema>
export type MetaPresetQueryInput = z.infer<typeof MetaPresetQuerySchema>
