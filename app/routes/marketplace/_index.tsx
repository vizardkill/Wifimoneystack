import type { JSX } from 'react'

import { Download, Globe, Package, Search } from 'lucide-react'
import { data, type LoaderFunctionArgs } from 'react-router'
import { Form, Link, useLoaderData } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_ListPublishedMarketplaceApps } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    const { redirect } = await import('react-router')
    throw redirect('/login')
  }

  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? undefined
  const page = Number(url.searchParams.get('page') ?? '1')

  const result = await new CLS_ListPublishedMarketplaceApps({
    user_id: user.id,
    search,
    page,
    per_page: 20
  }).main()

  return data({
    apps: result.data?.apps ?? [],
    total: result.data?.total ?? 0,
    page: result.data?.page ?? 1,
    per_page: result.data?.per_page ?? 20,
    search: search ?? '',
    error: result.error ? result.message : null
  })
}

export default function MarketplaceIndexPage(): JSX.Element {
  const { apps, total, page, per_page, search, error } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-bold text-[var(--color-mp-charcoal)]">Aplicaciones disponibles</h1>
        <p className="text-muted-foreground">{total} aplicaciones en el catálogo</p>
      </div>

      {/* Search */}
      <Form method="get" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar aplicaciones..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30 focus:border-[var(--color-mp-neon)]"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[var(--color-mp-charcoal)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Buscar
        </button>
      </Form>

      {/* Error */}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {/* Apps grid */}
      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <Package className="h-12 w-12 text-gray-300" />
          <h3 className="font-semibold text-gray-700">Sin aplicaciones</h3>
          <p className="text-sm text-muted-foreground">
            {search ? `No hay resultados para "${search}"` : 'Aún no hay aplicaciones publicadas en el catálogo.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <Link
              key={app.id}
              to={`/marketplace/apps/${app.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-[var(--color-mp-neon)] hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                {app.icon_url ? (
                  <img src={app.icon_url} alt={`${app.name} icon`} className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--color-mp-charcoal)] group-hover:text-[var(--color-mp-neon)] transition-colors truncate">
                    {app.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    {app.access_mode === 'WEB_LINK' ? (
                      <>
                        <Globe className="h-3 w-3" /> Web
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" /> Descarga
                      </>
                    )}
                  </p>
                </div>
              </div>
              {app.summary && <p className="mt-3 text-sm text-gray-600 line-clamp-2">{app.summary}</p>}
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > per_page && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Link
              to={`?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Anterior
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            Página {page} de {Math.ceil(total / per_page)}
          </span>
          {page * per_page < total && (
            <Link
              to={`?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
