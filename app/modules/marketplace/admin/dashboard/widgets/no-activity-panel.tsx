import type { JSX } from 'react'

import { AlertCircle, Edit } from 'lucide-react'
import { Link } from 'react-router'

interface NoActivityApp {
  id: string
  name: string
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE'
}

interface NoActivityPanelProps {
  apps: NoActivityApp[]
  days?: number
}

export function NoActivityPanel({ apps, days = 30 }: NoActivityPanelProps): JSX.Element {
  if (apps.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <h3 className="font-semibold text-green-800">Sin apps inactivas</h3>
        <p className="text-xs text-green-700 mt-1">Todas las apps activas registraron actividad en los últimos {days} días.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
      <h3 className="font-semibold text-amber-800 flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        Apps sin actividad ({days} días)
        <span className="ml-auto text-xs font-normal text-amber-600">{apps.length} apps</span>
      </h3>
      <p className="text-xs text-amber-700">
        Estas aplicaciones están publicadas pero no han registrado actividad en los últimos {days} días. Considera revisarlas o desactivarlas.
      </p>
      <div className="space-y-2">
        {apps.map((app) => (
          <div key={app.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-4 py-2.5">
            <div>
              <span className="text-sm font-medium text-slate-900">{app.name}</span>
              <span className="ml-2 text-xs text-slate-500">({app.status === 'ACTIVE' ? 'Activa' : app.status === 'DRAFT' ? 'Borrador' : 'Inactiva'})</span>
            </div>
            <Link
              to={`/dashboard/marketplace/apps/${app.id}/edit`}
              className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 transition-colors"
              aria-label={`Editar ${app.name}`}
            >
              <Edit className="h-3.5 w-3.5 text-gray-600" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
