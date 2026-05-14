import type { JSX } from 'react'

import { Globe, ImageIcon, Play } from 'lucide-react'

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

export function StorefrontPreview({ appName, accessMode, draftStorefront, draftMedia }: StorefrontPreviewProps): JSX.Element {
  const icon = draftMedia.find((item) => item.type === 'ICON' && typeof item.public_url === 'string' && item.public_url.length > 0)
  const screenshots = draftMedia
    .filter((item) => item.type === 'SCREENSHOT' && typeof item.public_url === 'string' && item.public_url.length > 0)
    .sort((a, b) => a.sort_order - b.sort_order)
  const video = draftMedia.find((item) => item.type === 'VIDEO' && typeof item.public_url === 'string' && item.public_url.length > 0)

  const instructionItems = toListItems(draftStorefront.instructions)

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Desarrollado por</p>
              <p className="text-sm font-medium text-slate-900">{draftStorefront.developer_name || 'Pendiente'}</p>
              {draftStorefront.developer_website ? (
                <a href={draftStorefront.developer_website} target="_blank" rel="noreferrer" className="text-sm text-emerald-700 underline underline-offset-2">
                  {draftStorefront.developer_website}
                </a>
              ) : (
                <p className="text-sm text-slate-500">Sitio web pendiente</p>
              )}
            </div>

            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Idiomas soportados</p>
              {draftStorefront.language_codes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {draftStorefront.language_codes.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      <Globe className="mr-1 h-3 w-3" />
                      {code}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Idiomas pendientes</p>
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Instrucciones</p>
            {instructionItems.length > 0 ? (
              <ul className="space-y-1 text-sm text-slate-700">
                {instructionItems.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Instrucciones pendientes</p>
            )}
          </div>
        </div>
      </article>
    </section>
  )
}
