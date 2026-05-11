import type { JSX } from 'react'

import { Image, Plus, Trash2 } from 'lucide-react'

interface AppMedia {
  id: string
  type: 'ICON' | 'SCREENSHOT' | 'VIDEO'
  public_url: string
  alt_text?: string | null
  sort_order: number
}

interface MediaGalleryManagerProps {
  media: AppMedia[]
  appId: string
}

export function MediaGalleryManager({ media, appId }: MediaGalleryManagerProps): JSX.Element {
  const icons = media.filter((m) => m.type === 'ICON')
  const screenshots = media.filter((m) => m.type === 'SCREENSHOT')
  const videos = media.filter((m) => m.type === 'VIDEO')

  return (
    <div className="space-y-6">
      {/* Icon */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
          <Image className="h-4 w-4" />
          Ícono de la aplicación
        </h3>
        <div className="flex items-center gap-4">
          {icons.length > 0 ? (
            <div className="relative group">
              <img src={icons[0].public_url} alt="App icon" className="h-20 w-20 rounded-xl object-cover border border-gray-200" />
              <button
                type="button"
                className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white shadow"
                aria-label="Eliminar ícono"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
              <Image className="h-8 w-8" />
            </div>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Formato recomendado: PNG 512×512px</p>
            <p>La carga de media se gestiona vía API de storage</p>
            <p className="text-[10px] text-gray-400">App ID: {appId}</p>
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
          <Image className="h-4 w-4" />
          Capturas de pantalla
          <span className="text-xs text-muted-foreground font-normal">({screenshots.length} de 5)</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          {screenshots.map((s) => (
            <div key={s.id} className="relative group">
              <img src={s.public_url} alt={s.alt_text ?? 'Screenshot'} className="h-24 w-auto rounded-lg object-cover border border-gray-200" />
              <button
                type="button"
                className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white shadow"
                aria-label="Eliminar screenshot"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </div>
          ))}
          {screenshots.length < 5 && (
            <button
              type="button"
              className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 hover:border-gray-400 transition-colors"
              aria-label="Agregar screenshot"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}
        </div>
      </section>

      {/* Videos */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-mp-charcoal)]">
          Videos
          <span className="ml-2 text-xs text-muted-foreground font-normal">(opcional)</span>
        </h3>
        <div className="space-y-2">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray-700 truncate flex-1">{v.alt_text ?? v.public_url}</p>
              <button type="button" className="ml-3 text-red-500 hover:text-red-700" aria-label="Eliminar video">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30"
            />
            <button type="button" className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
