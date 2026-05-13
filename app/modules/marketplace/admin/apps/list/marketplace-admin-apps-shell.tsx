import type { JSX } from 'react'

import { Edit, Eye, EyeOff, Package, Plus } from 'lucide-react'
import { Form, Link } from 'react-router'

interface AdminAppItem {
  id: string
  slug: string
  name: string
  status: string
  icon_url: string | null
}

interface MarketplaceAdminAppsShellProps {
  apps: AdminAppItem[]
  isSubmitting: boolean
  loaderError: string | null
  actionError: string | null
}

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'text-green-700 bg-green-50 border-green-200',
  DRAFT: 'text-slate-700 bg-slate-50 border-slate-200',
  INACTIVE: 'text-orange-700 bg-orange-50 border-orange-200'
}

export function MarketplaceAdminAppsShell({ apps, isSubmitting, loaderError, actionError }: MarketplaceAdminAppsShellProps): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Catálogo de aplicaciones</h1>
            <p className="mt-1 text-sm text-slate-600">Gestiona publicación, edición y estado operativo de cada app del marketplace.</p>
          </div>

          <Link
            to="/dashboard/marketplace/apps/new"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nueva app
          </Link>
        </div>
      </section>

      {actionError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{actionError}</div>}

      {loaderError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loaderError}</div>}

      {apps.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-slate-300" />
          <h2 className="mt-3 text-lg font-semibold text-slate-800">Sin aplicaciones</h2>
          <p className="mt-1 text-sm text-slate-600">Crea la primera aplicación del catálogo para iniciar la operación.</p>
          <Link
            to="/dashboard/marketplace/apps/new"
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900"
          >
            <Plus className="h-4 w-4" />
            Crear app
          </Link>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
            <p>Aplicación</p>
            <p>Estado y acciones</p>
          </div>

          <div className="divide-y divide-slate-100">
            {apps.map((app) => {
              const iconUrl = app.icon_url
              const statusColor = STATUS_COLOR[app.status] ?? STATUS_COLOR.DRAFT

              return (
                <article key={app.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {iconUrl ? (
                      <img src={iconUrl} alt={`Icono de ${app.name}`} className="h-11 w-11 rounded-lg border border-slate-200 object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                        <Package className="h-5 w-5 text-slate-400" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{app.name}</p>
                      <p className="truncate text-xs text-slate-500">{app.slug}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                      {app.status === 'ACTIVE' ? 'Activa' : app.status === 'DRAFT' ? 'Borrador' : 'Inactiva'}
                    </span>

                    <Link
                      to={`/dashboard/marketplace/apps/${app.id}/edit`}
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
                      aria-label={`Editar ${app.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    <Form method="post" className="inline">
                      <input type="hidden" name="app_id" value={app.id} />
                      <input type="hidden" name="intent" value={app.status === 'ACTIVE' ? 'unpublish' : 'publish'} />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                        aria-label={app.status === 'ACTIVE' ? `Desactivar ${app.name}` : `Activar ${app.name}`}
                      >
                        {app.status === 'ACTIVE' ? <EyeOff className="h-4 w-4 text-orange-600" /> : <Eye className="h-4 w-4 text-green-600" />}
                      </button>
                    </Form>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
