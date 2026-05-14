import type { JSX } from 'react'

import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { useActionData, useLoaderData, useNavigation } from 'react-router'

import { MarketplaceAdminAppsShell } from '@modules/marketplace/admin/apps/list'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_ListAdminMarketplaceApps } = await import('@/core/marketplace/marketplace.server')

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

  const result = await new CLS_ListAdminMarketplaceApps({
    actor_user_id: user.id,
    page: 1,
    per_page: 500
  }).main()

  return data({
    apps: result.data?.apps ?? [],
    actor_id: user.id,
    loader_error: result.error ? (result.message ?? 'No se pudo cargar el catálogo de apps.') : null
  })
}

export async function action({ request }: ActionFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_UpdateMarketplaceAppPublication } = await import('@/core/marketplace/marketplace.server')

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
  const intent = formData.get('intent') as string
  const app_id = formData.get('app_id') as string

  if (intent === 'publish' || intent === 'unpublish') {
    const result = await new CLS_UpdateMarketplaceAppPublication({
      app_id,
      actor_user_id: user.id,
      publish: intent === 'publish'
    }).main()

    if (result.error) {
      return data({ error: true, message: result.message ?? 'No se pudo actualizar el estado de la app.' }, { status: 400 })
    }
  }

  return redirect('/dashboard/marketplace/apps')
}

export default function AdminAppsPage(): JSX.Element {
  const actionData = useActionData<typeof action>()
  const { apps, loader_error } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const actionError = actionData?.error ? actionData.message : null

  return <MarketplaceAdminAppsShell apps={apps} isSubmitting={isSubmitting} loaderError={loader_error} actionError={actionError} />
}
