import type { JSX } from 'react'

import { Loader2 } from 'lucide-react'
import { Form } from 'react-router'

interface StorefrontReadinessPanelProps {
  readinessStatus: 'INCOMPLETE' | 'READY'
  missingRequirements: string[]
  draftUpdatedAt?: Date | string | null
  publishedUpdatedAt?: Date | string | null
  currentAppStatus?: string
  accessMode?: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
  webUrl?: string | null
  hasActiveArtifact?: boolean
  appId?: string
  canPublish?: boolean
  isPublishing?: boolean
  hasPublishedVersion?: boolean
}

const OPERATIONAL_STATUS_META: Record<'DRAFT' | 'ACTIVE' | 'INACTIVE', { label: string; classes: string }> = {
  ACTIVE: {
    label: 'Activa',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  },
  DRAFT: {
    label: 'Borrador',
    classes: 'border-slate-200 bg-slate-50 text-slate-700'
  },
  INACTIVE: {
    label: 'Inactiva',
    classes: 'border-amber-200 bg-amber-50 text-amber-700'
  }
}

const isOperationalStatus = (value: string): value is keyof typeof OPERATIONAL_STATUS_META => {
  return value === 'DRAFT' || value === 'ACTIVE' || value === 'INACTIVE'
}

const toReadableDate = (value: Date | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return 'Sin fecha'
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export function StorefrontReadinessPanel({
  readinessStatus,
  missingRequirements,
  draftUpdatedAt,
  publishedUpdatedAt,
  currentAppStatus = 'DRAFT',
  accessMode,
  webUrl,
  hasActiveArtifact = false,
  appId,
  canPublish = false,
  isPublishing = false,
  hasPublishedVersion = false
}: StorefrontReadinessPanelProps): JSX.Element {
  const isReady = readinessStatus === 'READY'
  const operationalStatusKey = isOperationalStatus(currentAppStatus) ? currentAppStatus : 'DRAFT'
  const operationalStatus = OPERATIONAL_STATUS_META[operationalStatusKey]
  const operationalMissingRequirements: string[] = []

  if (accessMode === 'WEB_LINK' && (webUrl ?? '').trim().length === 0) {
    operationalMissingRequirements.push('Falta la URL web para activar esta app WEB_LINK.')
  }

  if (accessMode === 'PACKAGE_DOWNLOAD' && !hasActiveArtifact) {
    operationalMissingRequirements.push('Falta un artefacto activo para activar esta app PACKAGE_DOWNLOAD.')
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-slate-900">Readiness de vitrina</h2>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
            isReady ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {isReady ? 'READY' : 'INCOMPLETE'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Última edición del borrador</p>
          <p className="mt-1 font-medium text-slate-800">{toReadableDate(draftUpdatedAt)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Última versión publicada</p>
          <p className="mt-1 font-medium text-slate-800">{toReadableDate(publishedUpdatedAt)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estado operativo actual</p>
          <span className={`mt-1 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${operationalStatus.classes}`}>
            {operationalStatus.label}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700">Requisitos faltantes</p>
        {missingRequirements.length === 0 ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            El borrador cumple los mínimos obligatorios para publicarse.
          </p>
        ) : (
          <ul className="space-y-2">
            {missingRequirements.map((item) => (
              <li key={item} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-sm font-semibold text-slate-700">Requisitos para activar la app</p>
        {operationalMissingRequirements.length === 0 ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            La app cumple los requisitos operativos para activarse desde el catálogo.
          </p>
        ) : (
          <ul className="space-y-2">
            {operationalMissingRequirements.map((item) => (
              <li key={item} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
        <p className="text-sm font-medium text-slate-700">
          {hasPublishedVersion
            ? 'Hay una versión pública vigente. Publicar reemplazará únicamente la vitrina pública; no cambia el estado operativo de la app.'
            : 'Al publicar, esta vitrina será la versión visible para usuarios aprobados; el estado operativo de la app se activa aparte desde el catálogo.'}
        </p>

        {appId ? (
          <Form method="post">
            <input type="hidden" name="intent" value="publish_storefront" />
            <input type="hidden" name="app_id" value={appId} />
            <button
              type="submit"
              disabled={!canPublish || isPublishing}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
              Publicar storefront
            </button>
          </Form>
        ) : null}
      </div>
    </section>
  )
}
