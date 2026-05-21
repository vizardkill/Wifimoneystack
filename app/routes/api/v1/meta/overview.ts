import { data, type LoaderFunctionArgs } from 'react-router'

import { getMarketplaceAuthorizedRequestUser } from '@/core/auth/authenticated-user.server'

import { extractFieldErrors, formatZodError } from '@lib/helpers/_parse-request.helper'
import { MetaOverviewQuerySchema } from '@lib/schemas'

const toIsoDate = (value: Date): string => value.toISOString().slice(0, 10)

export async function loader({ request }: LoaderFunctionArgs) {
  const auth = await getMarketplaceAuthorizedRequestUser(request)
  if (!auth.ok) {
    return data({ error: true, message: auth.message }, { status: auth.status })
  }

  const url = new URL(request.url)
  const now = new Date()
  const untilDefault = toIsoDate(now)
  const sinceDefaultDate = new Date(now)
  sinceDefaultDate.setDate(sinceDefaultDate.getDate() - 29)
  const sinceDefault = toIsoDate(sinceDefaultDate)

  const parsed = MetaOverviewQuerySchema.safeParse({
    since: url.searchParams.get('since') ?? sinceDefault,
    until: url.searchParams.get('until') ?? untilDefault
  })

  if (!parsed.success) {
    return data(
      {
        error: true,
        message: formatZodError(parsed.error),
        fieldErrors: extractFieldErrors(parsed.error)
      },
      { status: 422 }
    )
  }

  const { CLS_GetMetaAccountOverview } = await import('@/core/meta/meta.server')
  const result = await new CLS_GetMetaAccountOverview({
    user_id: auth.user.id,
    since: parsed.data.since,
    until: parsed.data.until
  }).main()

  return data(result, { status: result.error ? 400 : 200 })
}
