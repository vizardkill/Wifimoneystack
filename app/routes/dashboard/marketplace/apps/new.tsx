import type { JSX } from 'react'

import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { useActionData, useLoaderData, useNavigation } from 'react-router'

import { MarketplaceNewAppShell } from '@modules/marketplace/admin/apps/new'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_UpsertMarketplaceApp } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    throw redirect('/dashboard')
  }

  const url = new URL(request.url)
  const manualMode = url.searchParams.get('manual') === '1'

  if (!manualMode) {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const result = await new CLS_UpsertMarketplaceApp({
      actor_user_id: user.id,
      name: `Nueva app ${uniqueSuffix}`,
      slug: `nueva-app-${uniqueSuffix}`,
      summary: 'Pendiente de completar storefront.',
      description: '',
      instructions: '',
      access_mode: 'WEB_LINK',
      web_url: undefined
    }).main()

    if (!result.error && result.data?.app_id) {
      throw redirect(`/dashboard/marketplace/apps/${result.data.app_id}/edit`)
    }

    return data({
      autoCreateError: result.message ?? 'No se pudo crear automáticamente la app para abrir el workspace completo.'
    })
  }

  return data({ autoCreateError: null as string | null })
}

export async function action({ request }: ActionFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_UpsertMarketplaceApp } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  const hasMarketplaceAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  if (!hasMarketplaceAdminAccess) {
    return data({ error: true, message: 'Sin permisos.' }, { status: 403 })
  }

  const formData = await request.formData()
  const nameRaw = formData.get('name')
  const slugFormValue = formData.get('slug')
  const summaryRaw = formData.get('summary')

  const name = typeof nameRaw === 'string' ? nameRaw.trim() : ''
  const slugRaw = typeof slugFormValue === 'string' ? slugFormValue.trim() : ''
  const summary = typeof summaryRaw === 'string' ? summaryRaw.trim() : ''

  if (!name || !summary) {
    return data({ error: true, message: 'Nombre y resumen son requeridos.' })
  }

  const result = await new CLS_UpsertMarketplaceApp({
    actor_user_id: user.id,
    name,
    slug: slugRaw || undefined,
    summary,
    description: '',
    instructions: '',
    access_mode: 'WEB_LINK',
    web_url: undefined
  }).main()

  if (result.error) {
    return data({ error: true, message: result.message })
  }

  throw redirect(`/dashboard/marketplace/apps/${result.data!.app_id}/edit`)
}

export default function NewAppPage(): JSX.Element {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <MarketplaceNewAppShell
      autoCreateError={loaderData.autoCreateError}
      actionError={actionData?.error ? (actionData.message ?? 'No se pudo crear la aplicación.') : null}
      isSubmitting={isSubmitting}
    />
  )
}
