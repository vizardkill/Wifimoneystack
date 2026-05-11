import type { JSX } from 'react'

import { Edit, Eye, EyeOff, Package, Plus } from 'lucide-react'
import { type ActionFunctionArgs, data, type LoaderFunctionArgs, redirect } from 'react-router'
import { Form, Link, useLoaderData, useNavigation } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    throw redirect('/login')
  }
  if (user.role !== 'ADMIN') {
    throw redirect('/dashboard')
  }

  const { db } = await import('@/db.server')
  const apps = await db.marketplaceApp.findMany({
    orderBy: { created_at: 'desc' },
    include: { media: { where: { type: 'ICON' }, take: 1 } }
  })

  return data({ apps, actor_id: user.id })
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
  if (user.role !== 'ADMIN') {
    return data({ error: true, message: 'Sin permisos.' }, { status: 403 })
  }

  const formData = await request.formData()
  const intent = formData.get('intent') as string
  const app_id = formData.get('app_id') as string

  if (intent === 'publish' || intent === 'unpublish') {
    await new CLS_UpdateMarketplaceAppPublication({
      app_id,
      actor_user_id: user.id,
      publish: intent === 'publish'
    }).main()
  }

  return redirect('/dashboard/marketplace/apps')
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'text-green-700 bg-green-50 border-green-200',
  DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
  INACTIVE: 'text-orange-700 bg-orange-50 border-orange-200'
}

export default function AdminAppsPage(): JSX.Element {
  const { apps } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-[var(--color-mp-charcoal)]">Catálogo de aplicaciones</h1>
        <Link
          to="/dashboard/marketplace/apps/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-mp-charcoal)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Nueva app
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <Package className="h-12 w-12 text-gray-300" />
          <h3 className="font-semibold text-gray-700">Sin aplicaciones</h3>
          <p className="text-sm text-muted-foreground">Crea la primera aplicación del catálogo.</p>
          <Link
            to="/dashboard/marketplace/apps/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-mp-neon)] px-4 py-2 text-sm font-semibold text-[var(--color-mp-charcoal)]"
          >
            <Plus className="h-4 w-4" /> Crear app
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const iconUrl = app.media[0]?.public_url ?? null
            const statusColor = STATUS_COLOR[app.status] ?? STATUS_COLOR.DRAFT
            return (
              <div key={app.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {iconUrl ? (
                    <img src={iconUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-mp-charcoal)] truncate">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{app.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                    {app.status === 'ACTIVE' ? 'Activa' : app.status === 'DRAFT' ? 'Borrador' : 'Inactiva'}
                  </span>
                  <Link
                    to={`/dashboard/marketplace/apps/${app.id}/edit`}
                    className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-3.5 w-3.5 text-gray-600" />
                  </Link>
                  <Form method="post" className="inline">
                    <input type="hidden" name="app_id" value={app.id} />
                    <input type="hidden" name="intent" value={app.status === 'ACTIVE' ? 'unpublish' : 'publish'} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {app.status === 'ACTIVE' ? <EyeOff className="h-3.5 w-3.5 text-orange-600" /> : <Eye className="h-3.5 w-3.5 text-green-600" />}
                    </button>
                  </Form>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
