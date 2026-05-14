import type { JSX } from 'react'

import { Form } from 'react-router'

import { useMarketplaceAdminPromotionForm } from './hooks/use-marketplace-admin-promotion-form'

interface AdminAccount {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'SUPERADMIN'
}

interface MarketplaceAdminAdminsShellProps {
  admins: AdminAccount[]
  isSubmitting: boolean
  actionMessage?: string
  actionError?: boolean
}

export function MarketplaceAdminAdminsShell({ admins, isSubmitting, actionMessage, actionError }: MarketplaceAdminAdminsShellProps): JSX.Element {
  const { form, handleValidatedSubmit } = useMarketplaceAdminPromotionForm({ actionMessage, actionError })

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Administradores</h1>
        <p className="mt-1 text-sm text-slate-600">Solo superadmins pueden promover cuentas existentes a rol administrativo.</p>

        <Form method="post" className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" noValidate onSubmit={handleValidatedSubmit}>
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-900">
              Email de la cuenta a promover
            </label>
            <input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="usuario@empresa.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
            />
            {form.formState.errors.email?.message && <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>}
            {form.formState.errors.root?.message && <p className="text-xs text-red-600">{form.formState.errors.root.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Promoviendo...' : 'Promover a admin'}
          </button>
        </Form>
      </section>

      {actionMessage && !actionError && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{actionMessage}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Cuentas administrativas</h2>
        </div>

        {admins.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No hay cuentas administrativas registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{admin.name ?? 'Sin nombre'}</td>
                    <td className="px-4 py-3 text-slate-600">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          admin.role === 'SUPERADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {admin.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
