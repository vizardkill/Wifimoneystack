import type { JSX } from 'react'

import { Download, FileArchive, Globe, Upload } from 'lucide-react'

interface AppArtifact {
  id: string
  file_name: string
  version: string
  download_url: string
  created_at: string
}

interface ArtifactPanelProps {
  appId: string
  accessMode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
  webUrl?: string | null
  artifacts: AppArtifact[]
}

export function ArtifactPanel({ appId, accessMode, webUrl, artifacts }: ArtifactPanelProps): JSX.Element {
  if (accessMode === 'WEB_LINK') {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Enlace web
        </h3>
        {webUrl ? (
          <a
            href={webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-blue-600 hover:underline break-all"
          >
            {webUrl}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">No hay URL configurada. Edita la aplicación para agregar una.</p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--color-mp-charcoal)] flex items-center gap-2">
        <FileArchive className="h-4 w-4" />
        Artefactos de descarga
      </h3>

      {/* Upload hint */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center space-y-2">
        <Upload className="h-6 w-6 text-gray-400 mx-auto" />
        <p className="text-xs text-muted-foreground">Los artefactos se cargan vía API de storage</p>
        <p className="text-[10px] text-gray-400">App ID: {appId}</p>
      </div>

      {/* Artifacts list */}
      {artifacts.length > 0 ? (
        <div className="space-y-2">
          {artifacts.map((artifact, index) => (
            <div key={artifact.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileArchive className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-mp-charcoal)] truncate">{artifact.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    v{artifact.version} · {new Date(artifact.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {index === 0 && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Activo</span>}
                <a
                  href={artifact.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50 transition-colors"
                  aria-label="Descargar artefacto"
                >
                  <Download className="h-3.5 w-3.5 text-gray-600" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">Sin artefactos cargados aún.</p>
      )}
    </div>
  )
}
