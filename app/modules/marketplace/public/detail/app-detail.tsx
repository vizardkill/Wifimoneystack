import { type JSX, useEffect, useMemo, useState } from 'react'

import { ArrowLeft, Download, Globe, ImageIcon, Play } from 'lucide-react'
import { Link } from 'react-router'

interface AppMedia {
  id: string
  type: string
  public_url: string | null
  alt_text?: string | null
  sort_order: number
}

interface StorefrontLanguage {
  code: string
  label: string
  sort_order: number
}

interface StorefrontData {
  summary: string
  description: string
  instructions: string
  developer_name: string
  developer_website: string
  support_email: string | null
  support_url: string | null
  languages: StorefrontLanguage[]
  media: AppMedia[]
  video_url: string | null
}

interface MarketplaceAppDetail {
  id: string
  slug: string
  name: string
  summary?: string | null
  description?: string | null
  instructions?: string | null
  access_mode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
  web_url?: string | null
  presentation_mode?: 'LEGACY' | 'STOREFRONT'
  media: AppMedia[]
  storefront?: StorefrontData | null
  has_active_artifact: boolean
}

interface AppDetailProps {
  app: MarketplaceAppDetail
}

interface GalleryMedia {
  id: string
  type: 'SCREENSHOT' | 'VIDEO'
  url: string
  alt: string
}

function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '') || null
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.searchParams.get('v')) {
        return parsed.searchParams.get('v')
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.replace('/embed/', '') || null
      }
    }

    return null
  } catch {
    return null
  }
}

function toYoutubeEmbedUrl(url: string): string | null {
  const videoId = extractYoutubeId(url)
  if (!videoId) {
    return null
  }
  return `https://www.youtube.com/embed/${videoId}`
}

function toListItems(text: string | null | undefined): string[] {
  if (!text) {
    return []
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, 4)
}

function buildUsageSteps(text: string | null | undefined, accessMode: MarketplaceAppDetail['access_mode']): string[] {
  if (!text) {
    return accessMode === 'PACKAGE_DOWNLOAD'
      ? [
          'Descarga el ZIP firmado desde el boton principal.',
          'Descomprime el archivo en tu equipo.',
          'Abre chrome://extensions y activa Modo desarrollador.',
          'Haz clic en Cargar descomprimida y selecciona la carpeta extraida.'
        ]
      : [
          'Abre la app con el boton principal.',
          'Completa la configuracion inicial que te solicite la herramienta.',
          'Ejecuta tu primer flujo y revisa el resultado en pantalla.'
        ]
  }

  const lineBased = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•]\s*/, '').replace(/^\d+[\).:-]?\s*/, '').trim())
    .filter((line) => line.length > 0)

  const sentenceBased =
    lineBased.length <= 1
      ? text
          .split(/(?<=[.!?])\s+/)
          .map((sentence) => sentence.replace(/^[-*•]\s*/, '').replace(/^\d+[\).:-]?\s*/, '').trim())
          .map((sentence) => sentence.replace(/[.!?]+$/, '').trim())
          .filter((sentence) => sentence.length > 0)
      : []

  const normalized = (lineBased.length > 1 ? lineBased : sentenceBased).slice(0, 4)

  if (normalized.length >= 2) {
    return normalized
  }

  return accessMode === 'PACKAGE_DOWNLOAD'
    ? [
        'Descarga el ZIP firmado desde el boton principal.',
        'Descomprime el archivo en tu equipo.',
        'Abre chrome://extensions y activa Modo desarrollador.',
        'Haz clic en Cargar descomprimida y selecciona la carpeta extraida.'
      ]
    : [
        'Abre la app con el boton principal.',
        'Completa la configuracion inicial que te solicite la herramienta.',
        'Ejecuta tu primer flujo y revisa el resultado en pantalla.'
      ]
}

export function AppDetail({ app }: AppDetailProps): JSX.Element {
  const storefront = app.presentation_mode === 'STOREFRONT' ? (app.storefront ?? null) : null

  const latestIconMedia = app.media
    .filter((media) => media.type === 'ICON' && typeof media.public_url === 'string' && media.public_url.length > 0)
    .sort((a, b) => b.sort_order - a.sort_order)

  const orderedScreenshots = useMemo(() => {
    return app.media
      .filter((media) => media.type === 'SCREENSHOT' && typeof media.public_url === 'string' && media.public_url.length > 0)
      .sort((a, b) => a.sort_order - b.sort_order)
  }, [app.media])

  const orderedVisualMedia = useMemo(() => {
    return app.media
      .filter((media) => (media.type === 'SCREENSHOT' || media.type === 'VIDEO') && typeof media.public_url === 'string' && media.public_url.length > 0)
      .sort((a, b) => {
        const orderDiff = a.sort_order - b.sort_order
        if (orderDiff !== 0) {
          return orderDiff
        }

        if (a.type === b.type) {
          return 0
        }

        return a.type === 'SCREENSHOT' ? -1 : 1
      })
  }, [app.media])

  const iconUrl = latestIconMedia[0]?.public_url ?? orderedScreenshots[0]?.public_url ?? null

  const galleryItems: GalleryMedia[] = useMemo(() => {
    return orderedVisualMedia
      .map((media) => ({
        id: media.id,
        type: media.type as 'SCREENSHOT' | 'VIDEO',
        url: media.public_url!,
        alt: media.alt_text ?? (media.type === 'VIDEO' ? `Video de ${app.name}` : `Captura de ${app.name}`)
      }))
  }, [app.name, orderedVisualMedia])

  const primaryScreenshotId = orderedScreenshots.at(0)?.id
  const firstGalleryMediaId = galleryItems.at(0)?.id ?? ''
  const defaultActiveMediaId = primaryScreenshotId ?? firstGalleryMediaId

  const supportedLanguages = storefront?.languages.map((language) => language.label).filter((label) => label.length > 0) ?? []
  const supportedLanguagesText = supportedLanguages.length > 0 ? supportedLanguages.join(' / ') : 'Español / Inglés'

  const [activeMediaId, setActiveMediaId] = useState<string>(defaultActiveMediaId)

  useEffect(() => {
    if (galleryItems.length === 0) {
      setActiveMediaId('')
      return
    }

    if (!galleryItems.some((media) => media.id === activeMediaId)) {
      setActiveMediaId(defaultActiveMediaId)
    }
  }, [activeMediaId, defaultActiveMediaId, galleryItems])

  const activeMedia: GalleryMedia | null = galleryItems.length > 0 ? (galleryItems.find((media) => media.id === activeMediaId) ?? galleryItems[0]) : null

  const activeVideoEmbed = activeMedia !== null && activeMedia.type === 'VIDEO' ? toYoutubeEmbedUrl(activeMedia.url) : null

  const primaryActionHref = app.access_mode === 'WEB_LINK' ? `/marketplace/apps/${app.id}/use` : `/marketplace/apps/${app.id}/download`
  const primaryActionLabel = app.access_mode === 'WEB_LINK' ? 'Abrir app' : 'Descargar ZIP'
  const canRunPrimaryAction = app.access_mode === 'WEB_LINK' ? Boolean(app.web_url) : app.has_active_artifact
  const primaryActionClass =
    app.access_mode === 'WEB_LINK'
      ? 'bg-mp-home-accent text-[#042118] hover:bg-mp-home-accent-strong'
      : 'bg-mp-home-surface-strong text-mp-home-text hover:bg-mp-home-surface'
  const accessModeLabel = app.access_mode === 'WEB_LINK' ? 'Aplicación web' : 'Extensión descargable'
  const pricingLabel = app.access_mode === 'WEB_LINK' ? 'Uso incluido' : 'Descarga incluida'
  const compatibilityLabel = app.access_mode === 'WEB_LINK' ? 'Acceso inmediato desde navegador' : 'Instalación manual mediante paquete o ZIP'
  const secondaryActionLabel = app.access_mode === 'WEB_LINK' ? 'Abrir en una nueva pestaña' : 'Ver descarga disponible'
  const primaryActionHelperText =
    app.access_mode === 'WEB_LINK'
      ? 'Se abre en una nueva pestaña y el uso queda registrado automaticamente dentro del marketplace.'
      : 'Descarga el paquete e instala la extension en Chrome. La primera configuracion toma entre 2 y 4 minutos.'
  const onboardingHint = app.access_mode === 'WEB_LINK' ? 'Empiezas en menos de 2 minutos.' : 'Tu primera instalacion toma entre 2 y 4 minutos.'

  const highlightItems = toListItems(app.instructions)
  const usageSteps = useMemo(() => buildUsageSteps(app.instructions, app.access_mode), [app.access_mode, app.instructions])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-mp-home-muted transition-colors hover:text-mp-home-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-mp-home-border bg-mp-home-surface p-6 shadow-[0_20px_40px_rgba(3,9,20,0.38)] xl:sticky xl:top-20">
          <div className="flex items-center gap-3">
            {iconUrl ? (
              <img src={iconUrl} alt={`${app.name} icon`} className="block h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-mp-home-surface-strong">
                <Globe className="h-7 w-7 text-mp-home-muted" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-[1.15rem] font-semibold leading-tight text-mp-home-text md:text-xl">{app.name}</h1>
              <p className="text-sm text-mp-home-muted">{accessModeLabel}</p>
            </div>
          </div>

          <div className="mt-6 space-y-5 border-t border-mp-home-border pt-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-mp-home-muted">Precios</p>
              <p className="text-sm font-medium text-mp-home-text">{pricingLabel}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-mp-home-muted">Formato de acceso</p>
              <p className="text-sm leading-6 text-mp-home-text">✓ {compatibilityLabel}</p>
            </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-mp-home-muted">Calificacion</p>
                <p className="text-sm font-medium text-mp-home-text">Sin calificaciones publicas aun</p>
              </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-mp-home-muted">Desarrollador</p>
              <p className="text-sm font-medium text-mp-home-text">{storefront?.developer_name ?? 'Marketplace Ecommerce Team'}</p>
              {storefront?.developer_website ? (
                <a
                  href={storefront.developer_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-mp-home-accent underline underline-offset-2"
                >
                  {storefront.developer_website}
                </a>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {canRunPrimaryAction ? (
              <Link
                to={primaryActionHref}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${primaryActionClass}`}
              >
                {app.access_mode === 'WEB_LINK' ? <Globe className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {primaryActionLabel}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-mp-home-border bg-mp-home-surface-strong px-5 py-3 text-sm font-semibold text-mp-home-muted"
              >
                Disponible próximamente
              </button>
            )}

            <p className="text-xs leading-relaxed text-mp-home-muted">{primaryActionHelperText}</p>

            {app.access_mode === 'WEB_LINK' ? (
              <Link
                to={`/marketplace/apps/${app.id}/use`}
                className="block text-center text-sm font-medium text-mp-home-text underline underline-offset-2 transition-colors hover:text-mp-home-accent"
              >
                {secondaryActionLabel}
              </Link>
            ) : (
              <Link
                to={`/marketplace/apps/${app.id}/download`}
                className="block text-center text-sm font-medium text-mp-home-text underline underline-offset-2 transition-colors hover:text-mp-home-accent"
              >
                {secondaryActionLabel}
              </Link>
            )}
          </div>

        </aside>

        <section className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_168px]">
            <div className="relative overflow-hidden rounded-2xl border border-mp-home-border bg-mp-home-surface shadow-[0_20px_36px_rgba(3,9,20,0.4)]">
              <div className="aspect-16/10 w-full sm:aspect-video">
                {activeMedia ? (
                  activeMedia.type === 'VIDEO' && activeVideoEmbed ? (
                    <iframe
                      src={activeVideoEmbed}
                      title={activeMedia.alt}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : activeMedia.type === 'VIDEO' ? (
                    <a
                      href={activeMedia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-full w-full items-center justify-center bg-mp-home-surface"
                    >
                      <span className="inline-flex items-center gap-2 rounded-full bg-mp-home-text px-4 py-2 font-heading text-sm font-semibold text-mp-home-bg transition-transform group-hover:scale-105">
                        <Play className="h-4 w-4" />
                        Ver video
                      </span>
                    </a>
                  ) : (
                    <img src={activeMedia.url} alt={activeMedia.alt} className="block h-full w-full object-cover object-top" />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-mp-home-surface-strong text-mp-home-muted">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
              </div>

              {activeMedia !== null && activeMedia.type === 'VIDEO' && (
                <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-mp-home-surface-strong px-3 py-1 font-heading text-xs font-semibold text-mp-home-text">
                  <Play className="h-3.5 w-3.5" />
                  Video destacado
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 xl:grid-cols-1">
              {galleryItems.map((media) => {
                const isActive = activeMedia !== null && media.id === activeMedia.id
                const youtubeId = media.type === 'VIDEO' ? extractYoutubeId(media.url) : null

                return (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => setActiveMediaId(media.id)}
                    className={`relative overflow-hidden rounded-xl border transition-all ${
                      isActive
                        ? 'border-mp-home-accent ring-2 ring-mp-home-accent/25'
                        : 'border-mp-home-border hover:border-mp-home-accent'
                    }`}
                    aria-label={`Vista previa ${media.type === 'VIDEO' ? 'de video' : 'de captura'}`}
                  >
                    {media.type === 'VIDEO' ? (
                      youtubeId ? (
                        <img src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`} alt={media.alt} className="aspect-video w-full object-cover" />
                      ) : (
                        <div className="flex aspect-video w-full items-center justify-center bg-mp-home-surface text-mp-home-text">
                          <Play className="h-5 w-5" />
                        </div>
                      )
                    ) : (
                      <img src={media.url} alt={media.alt} className="block aspect-4/3 w-full object-cover object-top xl:aspect-video" />
                    )}

                    {media.type === 'VIDEO' && (
                      <span className="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-mp-home-surface text-mp-home-text">
                        <Play className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            {app.summary && <h2 className="max-w-4xl text-2xl font-semibold leading-tight tracking-tight text-mp-home-text md:text-[2rem]">{app.summary}</h2>}

            {app.description && <p className="max-w-4xl whitespace-pre-wrap text-base leading-8 text-mp-home-muted md:text-[17px]">{app.description}</p>}
          </div>

          {highlightItems.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-mp-home-text md:text-xl">Beneficios principales</h3>
              <ul className="space-y-2 pl-6 text-mp-home-muted">
                {highlightItems.map((item) => (
                  <li key={item} className="list-disc text-base leading-7 md:text-[17px]">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-mp-home-border bg-mp-home-surface p-5">
            <h3 className="text-lg font-semibold text-mp-home-text md:text-xl">Primeros pasos</h3>
            <p className="mt-2 text-sm text-mp-home-muted md:text-[15px]">{onboardingHint}</p>
            <ol className="mt-3 list-decimal space-y-2 pl-6 text-mp-home-muted">
              {usageSteps.map((step) => (
                <li key={step} className="text-sm leading-7 md:text-[15px]">
                  {step}
                </li>
              ))}
            </ol>
          </section>

          {app.instructions && (
            <section className="rounded-2xl border border-mp-home-border bg-mp-home-surface p-5">
              <h3 className="text-lg font-semibold text-mp-home-text md:text-xl">Cómo funciona</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-mp-home-muted md:text-[15px]">{app.instructions}</p>
            </section>
          )}

          <section className="rounded-2xl border border-mp-home-border bg-mp-home-surface p-5">
            <h3 className="text-lg font-semibold text-mp-home-text">Información adicional</h3>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-mp-home-muted">Idiomas</dt>
                <dd className="mt-1 text-sm leading-6 text-mp-home-text md:text-[15px]">{supportedLanguagesText}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-mp-home-muted">Compatibilidad</dt>
                <dd className="mt-1 text-sm leading-6 text-mp-home-text md:text-[15px]">{compatibilityLabel}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-mp-home-muted">Entrega</dt>
                <dd className="mt-1 text-sm leading-6 text-mp-home-text md:text-[15px]">
                  {app.access_mode === 'WEB_LINK' ? 'Acceso en navegador' : 'Paquete descargable para instalación manual'}
                </dd>
              </div>
              {storefront && (storefront.support_email || storefront.support_url) ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-mp-home-muted">Soporte</dt>
                  <dd className="mt-1 space-y-1 text-sm text-mp-home-text md:text-[15px]">
                    {storefront.support_email ? <p>{storefront.support_email}</p> : null}
                    {storefront.support_url ? (
                      <a
                        href={storefront.support_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-mp-home-accent underline underline-offset-2"
                      >
                        {storefront.support_url}
                      </a>
                    ) : null}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </section>
      </div>
    </div>
  )
}
