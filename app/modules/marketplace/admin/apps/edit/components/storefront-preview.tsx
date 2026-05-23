import type { JSX } from 'react'

import { Download, Globe, ImageIcon, Play } from 'lucide-react'

interface StorefrontDraftValues {
  summary: string
  description: string
  instructions: string
  developer_name: string
  developer_website: string
  support_email: string | null
  support_url: string | null
  language_codes: string[]
}

interface DraftMediaItem {
  id: string
  type: string
  public_url: string | null
  alt_text: string | null
  sort_order: number
}

interface StorefrontPreviewProps {
  appName: string
  accessMode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
  draftStorefront: StorefrontDraftValues
  draftMedia: DraftMediaItem[]
}

const toListItems = (text: string): string[] => {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, 5)
}

const toLanguageLabel = (code: string): string => {
  const normalized = code.trim().toLowerCase()

  if (normalized === 'es') {
    return 'Español'
  }

  if (normalized === 'en') {
    return 'Inglés'
  }

  return normalized.toUpperCase()
}

const buildUsageSteps = (text: string | null | undefined, accessMode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'): string[] => {
  if (!text) {
    return accessMode === 'PACKAGE_DOWNLOAD'
      ? [
          'Descarga el ZIP firmado desde el botón principal.',
          'Descomprime el archivo en tu equipo.',
          'Abre chrome://extensions y activa Modo desarrollador.',
          'Haz clic en Cargar descomprimida y selecciona la carpeta extraída.'
        ]
      : [
          'Abre la app con el botón principal.',
          'Completa la configuración inicial que te solicite la herramienta.',
          'Ejecuta tu primer flujo y revisa el resultado en pantalla.'
        ]
  }

  const lineBased = text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/^[-*•]\s*/, '')
        .replace(/^\d+[\).:-]?\s*/, '')
        .trim()
    )
    .filter((line) => line.length > 0)

  const sentenceBased =
    lineBased.length <= 1
      ? text
          .split(/(?<=[.!?])\s+/)
          .map((sentence) =>
            sentence
              .replace(/^[-*•]\s*/, '')
              .replace(/^\d+[\).:-]?\s*/, '')
              .trim()
          )
          .map((sentence) => sentence.replace(/[.!?]+$/, '').trim())
          .filter((sentence) => sentence.length > 0)
      : []

  const normalized = (lineBased.length > 1 ? lineBased : sentenceBased).slice(0, 4)

  if (normalized.length >= 2) {
    return normalized
  }

  return accessMode === 'PACKAGE_DOWNLOAD'
    ? [
        'Descarga el ZIP firmado desde el botón principal.',
        'Descomprime el archivo en tu equipo.',
        'Abre chrome://extensions y activa Modo desarrollador.',
        'Haz clic en Cargar descomprimida y selecciona la carpeta extraída.'
      ]
    : [
        'Abre la app con el botón principal.',
        'Completa la configuración inicial que te solicite la herramienta.',
        'Ejecuta tu primer flujo y revisa el resultado en pantalla.'
      ]
}

export function StorefrontPreview({ appName, accessMode, draftStorefront, draftMedia }: StorefrontPreviewProps): JSX.Element {
  const icon = draftMedia.find((item) => item.type === 'ICON' && typeof item.public_url === 'string' && item.public_url.length > 0)
  const screenshots = draftMedia
    .filter((item) => item.type === 'SCREENSHOT' && typeof item.public_url === 'string' && item.public_url.length > 0)
    .sort((a, b) => a.sort_order - b.sort_order)
  const video = draftMedia.find((item) => item.type === 'VIDEO' && typeof item.public_url === 'string' && item.public_url.length > 0)

  const summaryText = draftStorefront.summary.trim() || 'Resumen pendiente'
  const descriptionText = draftStorefront.description.trim() || 'Descripción pendiente'
  const instructionsText = draftStorefront.instructions.trim()

  const instructionItems = toListItems(instructionsText)
  const usageSteps = buildUsageSteps(instructionsText, accessMode)

  const pricingLabel = accessMode === 'WEB_LINK' ? 'Uso incluido' : 'Descarga incluida'
  const compatibilityLabel = accessMode === 'WEB_LINK' ? 'Acceso inmediato desde navegador' : 'Instalación manual mediante paquete o ZIP'
  const primaryActionLabel = accessMode === 'WEB_LINK' ? 'Abrir app' : 'Descargar ZIP'
  const secondaryActionLabel = accessMode === 'WEB_LINK' ? 'Abrir en una nueva pestaña' : 'Ver descarga disponible'
  const primaryActionHelperText =
    accessMode === 'WEB_LINK'
      ? 'Se abre en una nueva pestaña y el uso queda registrado automáticamente dentro del marketplace.'
      : 'Descarga el paquete e instala la extensión en Chrome. La primera configuración toma entre 2 y 4 minutos.'
  const onboardingHint = accessMode === 'WEB_LINK' ? 'Empiezas en menos de 2 minutos.' : 'Tu primera instalación toma entre 2 y 4 minutos.'

  const developerName = draftStorefront.developer_name.trim() || 'Marketplace Ecommerce Team'
  const supportedLanguagesText =
    draftStorefront.language_codes.length > 0 ? draftStorefront.language_codes.map((code) => toLanguageLabel(code)).join(' / ') : 'Español / Inglés'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 space-y-1">
        <h2 className="font-heading text-xl font-bold text-slate-900">Preview de vitrina</h2>
        <p className="text-sm text-slate-600">Vista previa editorial del borrador antes de publicarlo.</p>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white p-4">
          {icon ? (
            <img src={icon.public_url ?? ''} alt={icon.alt_text ?? `${appName} icon`} className="h-12 w-12 rounded-xl border border-slate-200 object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
              <ImageIcon className="h-6 w-6" />
            </div>
          )}

          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900">{appName}</h3>
            <p className="text-sm text-slate-600">{accessMode === 'WEB_LINK' ? 'Aplicación web' : 'Aplicación descargable'}</p>
          </div>
        </header>

        <div className="space-y-5 p-4">
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-slate-900">{draftStorefront.summary || 'Resumen pendiente'}</h4>
            <p className="whitespace-pre-wrap text-sm text-slate-700">{draftStorefront.description || 'Descripción pendiente'}</p>
          </div>

          {screenshots.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {screenshots.map((item) => (
                <img
                  key={item.id}
                  src={item.public_url ?? ''}
                  alt={item.alt_text ?? 'Screenshot'}
                  className="h-32 w-full rounded-lg border border-slate-200 object-cover"
                />
              ))}
            </div>
          )}

          {video && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Play className="h-4 w-4" />
                Video destacado
              </p>
              <a href={video.public_url ?? '#'} target="_blank" rel="noreferrer" className="text-sm text-emerald-700 underline underline-offset-2">
                {video.public_url}
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Precios</p>
              <p className="text-sm font-medium text-slate-900">{pricingLabel}</p>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Formato de acceso</p>
              <p className="text-sm font-medium text-slate-900">✓ {compatibilityLabel}</p>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calificación</p>
              <p className="text-sm font-medium text-slate-900">Sin calificaciones públicas aun</p>
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Desarrollador</p>
              <p className="text-sm font-medium text-slate-900">{developerName}</p>
              {draftStorefront.developer_website ? (
                <a href={draftStorefront.developer_website} target="_blank" rel="noreferrer" className="text-sm text-emerald-700 underline underline-offset-2">
                  {draftStorefront.developer_website}
                </a>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-semibold text-slate-900">{summaryText}</h4>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{descriptionText}</p>
          </div>

          {instructionItems.length > 0 && (
            <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <h4 className="text-base font-semibold text-slate-900">Beneficios principales</h4>
              <ul className="space-y-1 text-sm text-slate-700">
                {instructionItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            <h4 className="text-base font-semibold text-slate-900">Primeros pasos</h4>
            <p className="text-sm text-slate-600">{onboardingHint}</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {usageSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          {instructionsText && (
            <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <h4 className="text-base font-semibold text-slate-900">Cómo funciona</h4>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{instructionsText}</p>
            </section>
          )}

          <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            <h4 className="text-base font-semibold text-slate-900">Información adicional</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Idiomas</p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-700">
                  <Globe className="h-3.5 w-3.5" />
                  {supportedLanguagesText}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compatibilidad</p>
                <p className="mt-1 text-sm text-slate-700">{compatibilityLabel}</p>
              </div>
            </div>
          </section>

          <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {accessMode === 'WEB_LINK' ? <Globe className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              {primaryActionLabel}
            </button>
            <p className="text-sm text-slate-600">{primaryActionHelperText}</p>
            <p className="text-sm font-medium text-slate-800 underline underline-offset-2">{secondaryActionLabel}</p>
          </section>
        </div>
      </article>
    </section>
  )
}
