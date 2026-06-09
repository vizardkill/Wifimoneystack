import type { JSX } from 'react'

import { FileArchive, Loader2, Upload, Wrench } from 'lucide-react'
import { Form } from 'react-router'

interface ActiveSkill {
  name: string
  description: string
  version: string | null
  allowed_tools: string[]
}

interface SkillUploadPanelProps {
  hasActiveArtifact: boolean
  activeSkill: ActiveSkill | null
  isSubmitting: boolean
}

/**
 * Panel admin para subir el paquete .zip de un skill de Claude. Al subirlo se
 * parsea el SKILL.md, se registra el artefacto y la app queda marcada como
 * skill descargable.
 */
export function SkillUploadPanel({ hasActiveArtifact, activeSkill, isSubmitting }: SkillUploadPanelProps): JSX.Element {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="space-y-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <FileArchive className="h-4 w-4" />
          Paquete del skill de Claude
        </h3>
        <p className="text-xs text-slate-600">
          Sube un .zip que contenga el archivo <code className="rounded bg-slate-200 px-1">SKILL.md</code>. Se leerá su frontmatter (name, description,
          allowed-tools) automáticamente.
        </p>
      </div>

      {activeSkill ? (
        <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-emerald-900">{activeSkill.name}</p>
            {activeSkill.version ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">v{activeSkill.version}</span>
            ) : null}
          </div>
          <p className="text-xs text-emerald-800">{activeSkill.description}</p>
          {activeSkill.allowed_tools.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Wrench className="h-3.5 w-3.5 text-emerald-700" />
              {activeSkill.allowed_tools.map((tool) => (
                <span key={tool} className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                  {tool}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : hasActiveArtifact ? (
        <p className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">Hay un artefacto activo sin metadata de skill parseada.</p>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">Aún no se ha subido ningún paquete de skill.</p>
      )}

      <Form method="post" encType="multipart/form-data" className="space-y-3">
        <input type="hidden" name="intent" value="upload_skill_artifact" />

        <div className="space-y-1.5">
          <label htmlFor="skill_package" className="text-xs font-semibold text-slate-700">
            Archivo .zip del skill
          </label>
          <input
            id="skill_package"
            name="skill_package"
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            required
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="version_label" className="text-xs font-semibold text-slate-700">
            Versión (opcional)
          </label>
          <input
            id="version_label"
            name="version_label"
            type="text"
            placeholder="Ej: 1.0.0 (si se omite, se usa la del SKILL.md)"
            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {hasActiveArtifact ? 'Subir nueva versión del skill' : 'Subir paquete del skill'}
        </button>
      </Form>
    </div>
  )
}
