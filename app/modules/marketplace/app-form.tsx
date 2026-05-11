import type { JSX } from 'react'

import { Loader2 } from 'lucide-react'
import { Form } from 'react-router'

interface AppFormValues {
  name?: string
  slug?: string
  summary?: string | null
  description?: string | null
  instructions?: string | null
  access_mode?: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
  web_url?: string | null
}

interface AppFormProps {
  defaultValues?: AppFormValues
  isSubmitting?: boolean
  error?: string | null
  successMessage?: string | null
}

export function AppForm({ defaultValues, isSubmitting = false, error, successMessage }: AppFormProps): JSX.Element {
  return (
    <Form method="post" className="space-y-4">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {successMessage && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{successMessage}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={defaultValues?.name ?? ''}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30 focus:border-[var(--color-mp-neon)]"
          />
        </div>

        <div className="col-span-2 space-y-1">
          <label htmlFor="slug" className="text-sm font-medium">
            Slug <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-muted-foreground font-normal">(identificador único, e.g. mi-app)</span>
          </label>
          <input
            id="slug"
            name="slug"
            required
            placeholder="mi-app"
            defaultValue={defaultValues?.slug ?? ''}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30 focus:border-[var(--color-mp-neon)]"
          />
        </div>

        <div className="col-span-2 space-y-1">
          <label htmlFor="summary" className="text-sm font-medium">
            Resumen corto
          </label>
          <input
            id="summary"
            name="summary"
            maxLength={160}
            defaultValue={defaultValues?.summary ?? ''}
            placeholder="Una línea que describe la app..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30 focus:border-[var(--color-mp-neon)]"
          />
        </div>

        <div className="col-span-2 space-y-1">
          <label htmlFor="description" className="text-sm font-medium">
            Descripción completa
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={defaultValues?.description ?? ''}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30 focus:border-[var(--color-mp-neon)]"
          />
        </div>

        <div className="col-span-2 space-y-1">
          <label htmlFor="instructions" className="text-sm font-medium">
            Instrucciones de uso
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={3}
            defaultValue={defaultValues?.instructions ?? ''}
            placeholder="Cómo usar la aplicación..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30 focus:border-[var(--color-mp-neon)]"
          />
        </div>

        <div className="col-span-2 space-y-1">
          <label htmlFor="access_mode" className="text-sm font-medium">
            Modo de acceso <span className="text-red-500">*</span>
          </label>
          <select
            id="access_mode"
            name="access_mode"
            required
            defaultValue={defaultValues?.access_mode ?? 'WEB_LINK'}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30 focus:border-[var(--color-mp-neon)]"
          >
            <option value="WEB_LINK">Enlace web (abre en navegador)</option>
            <option value="PACKAGE_DOWNLOAD">Descarga de paquete (ZIP/EXE)</option>
          </select>
        </div>

        <div className="col-span-2 space-y-1">
          <label htmlFor="web_url" className="text-sm font-medium">
            URL de la aplicación
            <span className="ml-2 text-xs text-muted-foreground font-normal">(requerido para modo Enlace web)</span>
          </label>
          <input
            id="web_url"
            name="web_url"
            type="url"
            defaultValue={defaultValues?.web_url ?? ''}
            placeholder="https://..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-mp-neon)]/30 focus:border-[var(--color-mp-neon)]"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-mp-charcoal)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Guardar
        </button>
      </div>
    </Form>
  )
}
