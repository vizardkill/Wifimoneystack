import { type ChangeEvent, type FormEvent, type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, UploadCloud, Video } from 'lucide-react'
import { Form, useFetcher } from 'react-router'

interface AppMedia {
  id: string
  type: string
  public_url: string | null
  alt_text: string | null
  sort_order: number
}

interface MediaGalleryManagerProps {
  draftMedia: AppMedia[]
  appId: string
  isSubmitting?: boolean
}

type PrepareUploadActionResponse = {
  error?: boolean
  message?: string
  details?: {
    signed_url?: string
    public_url?: string
    storage_key?: string
  }
}

type RegisterMediaActionResponse = {
  error?: boolean
  success?: boolean
  message?: string
}

type ImageUploadPhase = 'idle' | 'preparing' | 'uploading' | 'registering'

type ImageMediaType = 'ICON' | 'SCREENSHOT'

type MediaWizardStep = 'ICON' | 'SCREENSHOT' | 'VIDEO' | 'MANAGE'

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024

const MEDIA_WIZARD_STEPS: MediaWizardStep[] = ['ICON', 'SCREENSHOT', 'VIDEO', 'MANAGE']

const MEDIA_WIZARD_LABELS: Record<MediaWizardStep, string> = {
  ICON: 'Icono',
  SCREENSHOT: 'Capturas',
  VIDEO: 'Video',
  MANAGE: 'Revision'
}

const buildReorderedMediaIds = (orderedIds: string[], fromIndex: number, toIndex: number): string[] => {
  if (fromIndex < 0 || fromIndex >= orderedIds.length) {
    return orderedIds
  }

  if (toIndex < 0 || toIndex >= orderedIds.length) {
    return orderedIds
  }

  const cloned = [...orderedIds]
  const [moved] = cloned.splice(fromIndex, 1)
  cloned.splice(toIndex, 0, moved)
  return cloned
}

const sanitizeStorageSegment = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const fileToDataUrl = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('No fue posible convertir el archivo.'))
    }

    reader.onerror = () => {
      reject(new Error('No fue posible leer el archivo seleccionado.'))
    }

    reader.readAsDataURL(file)
  })
}

const buildLocalFallbackStorageKey = (appId: string, mediaType: 'ICON' | 'SCREENSHOT', fileName: string): string => {
  const timestamp = Date.now().toString()
  const typeSegment = mediaType === 'ICON' ? 'icon' : 'screenshot'
  const cleanFileName = sanitizeStorageSegment(fileName)
  return `local-dev/marketplace/storefronts/${appId}/${typeSegment}-${timestamp}-${cleanFileName}`
}

const parseJsonResponse = async <T,>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

const getRegisterFeedback = (value: unknown): RegisterMediaActionResponse | null => {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const recordValue = value as Record<string, unknown>

  return {
    error: recordValue.error === true,
    success: recordValue.success === true,
    message: typeof recordValue.message === 'string' ? recordValue.message : undefined
  }
}

const toUploadPhaseMessage = (phase: ImageUploadPhase): string => {
  if (phase === 'preparing') {
    return 'Preparando carga de imagen...'
  }

  if (phase === 'uploading') {
    return 'Subiendo imagen al storage...'
  }

  if (phase === 'registering') {
    return 'Registrando imagen en el borrador...'
  }

  return ''
}

export function MediaGalleryManager({ draftMedia, appId, isSubmitting = false }: MediaGalleryManagerProps): JSX.Element {
  const registerMediaFetcher = useFetcher<RegisterMediaActionResponse>()
  const imageFileInputRef = useRef<HTMLInputElement | null>(null)
  const videoUrlInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedImagePreviewUrl, setSelectedImagePreviewUrl] = useState<string | null>(null)
  const [selectedImageName, setSelectedImageName] = useState<string>('')
  const [uploadPhase, setUploadPhase] = useState<ImageUploadPhase>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadHint, setUploadHint] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<MediaWizardStep>('ICON')

  const icons = useMemo(() => draftMedia.filter((media) => media.type === 'ICON'), [draftMedia])
  const screenshots = useMemo(() => {
    return draftMedia.filter((media) => media.type === 'SCREENSHOT').sort((a, b) => a.sort_order - b.sort_order)
  }, [draftMedia])
  const videos = useMemo(() => draftMedia.filter((media) => media.type === 'VIDEO'), [draftMedia])

  const screenshotIds = screenshots.map((screenshot) => screenshot.id)

  const registerFeedback = getRegisterFeedback(registerMediaFetcher.data)

  const isImageUploadBusy = uploadPhase !== 'idle'
  const isBusy = isSubmitting || isImageUploadBusy || registerMediaFetcher.state !== 'idle'

  const iconCount = icons.length
  const screenshotCount = screenshots.length
  const videoCount = videos.length

  const activeStepIndex = MEDIA_WIZARD_STEPS.indexOf(activeStep)
  const totalSteps = MEDIA_WIZARD_STEPS.length

  const isIconStep = activeStep === 'ICON'
  const isScreenshotStep = activeStep === 'SCREENSHOT'
  const isVideoStep = activeStep === 'VIDEO'
  const isManageStep = activeStep === 'MANAGE'

  const currentImageMediaType: ImageMediaType = isIconStep ? 'ICON' : 'SCREENSHOT'

  const iconStepCompleted = iconCount > 0
  const screenshotStepCompleted = screenshotCount > 0
  const videoStepCompleted = videoCount > 0

  useEffect(() => {
    if (registerMediaFetcher.state === 'idle' && uploadPhase === 'registering') {
      setUploadPhase('idle')
    }
  }, [registerMediaFetcher.state, uploadPhase])

  useEffect(() => {
    return () => {
      if (typeof selectedImagePreviewUrl === 'string' && selectedImagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(selectedImagePreviewUrl)
      }
    }
  }, [selectedImagePreviewUrl])

  const handleImageFileChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]

    setUploadError(null)
    setUploadHint(null)

    setSelectedImagePreviewUrl((previousPreview) => {
      if (typeof previousPreview === 'string' && previousPreview.startsWith('blob:')) {
        URL.revokeObjectURL(previousPreview)
      }

      if (!file) {
        return null
      }

      return URL.createObjectURL(file)
    })

    setSelectedImageName(file?.name ?? '')
  }, [])

  const handleImageUploadSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()

      const htmlForm = event.currentTarget
      const formData = new FormData(htmlForm)

      const mediaTypeRaw = formData.get('media_type')
      const mediaType = mediaTypeRaw === 'ICON' ? 'ICON' : 'SCREENSHOT'
      const altTextRaw = formData.get('alt_text')
      const altText = typeof altTextRaw === 'string' ? altTextRaw.trim() : ''

      const fileEntry = formData.get('image_file')
      if (!(fileEntry instanceof File) || fileEntry.size <= 0) {
        setUploadError('Selecciona un archivo de imagen antes de continuar.')
        return
      }

      if (!ALLOWED_IMAGE_TYPES.has(fileEntry.type)) {
        setUploadError('Formato no soportado. Usa PNG, JPG o WEBP.')
        return
      }

      if (fileEntry.size > MAX_IMAGE_SIZE_BYTES) {
        setUploadError('La imagen supera el máximo de 10MB.')
        return
      }

      setUploadError(null)
      setUploadHint(null)
      setUploadPhase('preparing')

      let resolvedStorageKey = ''
      let resolvedPublicUrl = ''
      let usedLocalFallback = false

      try {
        const prepareBody = new FormData()
        prepareBody.set('intent', 'prepare_media_upload')
        prepareBody.set('app_id', appId)
        prepareBody.set('media_type', mediaType)
        prepareBody.set('file_name', fileEntry.name)
        prepareBody.set('content_type', fileEntry.type)
        prepareBody.set('size_bytes', String(fileEntry.size))

        const prepareResponse = await fetch(window.location.pathname, {
          method: 'POST',
          body: prepareBody,
          headers: {
            Accept: 'application/json'
          }
        })

        const preparePayload = await parseJsonResponse<PrepareUploadActionResponse>(prepareResponse)

        const signedUrl = preparePayload?.details?.signed_url
        const publicUrl = preparePayload?.details?.public_url
        const storageKey = preparePayload?.details?.storage_key

        if (!prepareResponse.ok || typeof signedUrl !== 'string' || typeof publicUrl !== 'string' || typeof storageKey !== 'string') {
          throw new Error(preparePayload?.message ?? 'No se pudo preparar la carga en storage.')
        }

        setUploadPhase('uploading')

        const uploadResponse = await fetch(signedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': fileEntry.type
          },
          body: fileEntry
        })

        if (!uploadResponse.ok) {
          throw new Error('No se pudo subir el archivo al bucket firmado.')
        }

        resolvedStorageKey = storageKey
        resolvedPublicUrl = publicUrl
      } catch {
        usedLocalFallback = true

        try {
          const dataUrl = await fileToDataUrl(fileEntry)
          resolvedPublicUrl = dataUrl
          resolvedStorageKey = buildLocalFallbackStorageKey(appId, mediaType, fileEntry.name)
        } catch {
          setUploadError('No fue posible procesar la imagen para registro local.')
          setUploadPhase('idle')
          return
        }
      }

      const registerBody = new FormData()
      registerBody.set('intent', 'register_media')
      registerBody.set('app_id', appId)
      registerBody.set('media_type', mediaType)
      registerBody.set('storage_key', resolvedStorageKey)
      registerBody.set('public_url', resolvedPublicUrl)
      registerBody.set('alt_text', altText)
      registerBody.set('attach_to_draft', 'true')

      setUploadPhase('registering')

      if (usedLocalFallback) {
        setUploadHint('Bucket no disponible: se registró la imagen en modo local temporal para continuar el flujo.')
      }

      void registerMediaFetcher.submit(registerBody, { method: 'post' })

      htmlForm.reset()
      setSelectedImageName('')
      setSelectedImagePreviewUrl((previousPreview) => {
        if (typeof previousPreview === 'string' && previousPreview.startsWith('blob:')) {
          URL.revokeObjectURL(previousPreview)
        }
        return null
      })
    },
    [appId, registerMediaFetcher]
  )

  const handleImageUploadFormSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>): void => {
      void handleImageUploadSubmit(event)
    },
    [handleImageUploadSubmit]
  )

  const focusFileInput = useCallback((): void => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        imageFileInputRef.current?.focus()
        imageFileInputRef.current?.click()
      })
    })
  }, [])

  const focusVideoInput = useCallback((): void => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        videoUrlInputRef.current?.focus()
      })
    })
  }, [])

  const handleStepChange = useCallback((nextStep: MediaWizardStep): void => {
    setActiveStep(nextStep)
  }, [])

  const handlePreviousStep = useCallback((): void => {
    setActiveStep((currentStep) => {
      const currentIndex = MEDIA_WIZARD_STEPS.indexOf(currentStep)

      if (currentIndex <= 0) {
        return currentStep
      }

      return MEDIA_WIZARD_STEPS[currentIndex - 1]
    })
  }, [])

  const handleNextStep = useCallback((): void => {
    setActiveStep((currentStep) => {
      const currentIndex = MEDIA_WIZARD_STEPS.indexOf(currentStep)

      if (currentIndex >= MEDIA_WIZARD_STEPS.length - 1) {
        return currentStep
      }

      return MEDIA_WIZARD_STEPS[currentIndex + 1]
    })
  }, [])

  const handleQuickUploadIcon = useCallback((): void => {
    setActiveStep('ICON')
    focusFileInput()
  }, [focusFileInput])

  const handleQuickUploadScreenshot = useCallback((): void => {
    setActiveStep('SCREENSHOT')
    focusFileInput()
  }, [focusFileInput])

  const handleQuickUploadVideo = useCallback((): void => {
    setActiveStep('VIDEO')
    focusVideoInput()
  }, [focusVideoInput])

  const getStepStatusLabel = useCallback(
    (step: MediaWizardStep): string => {
      if (step === 'ICON') {
        return iconStepCompleted ? 'Listo' : 'Pendiente'
      }

      if (step === 'SCREENSHOT') {
        return screenshotStepCompleted ? 'Listo' : 'Pendiente'
      }

      if (step === 'VIDEO') {
        return videoStepCompleted ? 'Listo' : 'Opcional'
      }

      if (iconStepCompleted && screenshotStepCompleted) {
        return 'Listo para revisar'
      }

      return 'Faltan requeridos'
    },
    [iconStepCompleted, screenshotStepCompleted, videoStepCompleted]
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 space-y-1">
        <h2 className="font-heading text-xl font-bold text-slate-900">Media de la vitrina</h2>
        <p className="text-sm text-slate-600">Ahora el flujo es por pasos: avanzas una tarea por pantalla y haces menos scroll.</p>
      </div>

      <ol className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {MEDIA_WIZARD_STEPS.map((step, index) => {
          const isCurrentStep = step === activeStep

          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => handleStepChange(step)}
                className={
                  isCurrentStep
                    ? 'flex w-full items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-3 py-2 text-left text-white'
                    : 'flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }
              >
                <span
                  className={
                    isCurrentStep
                      ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900'
                      : 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700'
                  }
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{MEDIA_WIZARD_LABELS[step]}</span>
                  <span className={isCurrentStep ? 'block text-[11px] text-slate-200' : 'block text-[11px] text-slate-500'}>{getStepStatusLabel(step)}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
        {(isIconStep || isScreenshotStep) && (
          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-800">{isIconStep ? 'Paso 1: sube el icono principal' : 'Paso 2: agrega capturas de pantalla'}</h3>
              <p className="text-xs text-slate-600">
                {isIconStep
                  ? iconStepCompleted
                    ? 'Ya tienes icono cargado. Puedes reemplazarlo si deseas.'
                    : 'El icono es obligatorio para publicar.'
                  : screenshotStepCompleted
                    ? `Ya tienes ${screenshotCount} captura(s). Puedes sumar mas.`
                    : 'Agrega al menos una captura para completar el draft.'}
              </p>
            </div>

            <form onSubmit={handleImageUploadFormSubmit} className="space-y-3 rounded-xl border border-dashed border-slate-300 bg-white p-4">
              <input type="hidden" name="media_type" value={currentImageMediaType} />

              <div className="space-y-1">
                <label htmlFor="alt_text_image" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Texto alternativo
                </label>
                <input
                  id="alt_text_image"
                  name="alt_text"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder={isIconStep ? 'Ej: logo oficial de la app' : 'Ej: vista del dashboard principal'}
                />
              </div>

              <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="image_file" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Archivo (PNG/JPG/WEBP, maximo 10MB)
                </label>
                <input
                  ref={imageFileInputRef}
                  id="image_file"
                  name="image_file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageFileChange}
                  className="block w-full cursor-pointer text-sm text-slate-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
                />

                {selectedImageName.length > 0 && <p className="text-xs text-slate-500">Archivo seleccionado: {selectedImageName}</p>}

                {selectedImagePreviewUrl && (
                  <img
                    src={selectedImagePreviewUrl}
                    alt="Previsualizacion de archivo seleccionado"
                    className="h-24 w-40 rounded-lg border border-slate-200 object-cover"
                  />
                )}
              </div>

              {uploadError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {uploadError}
                </p>
              )}

              {uploadHint && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">{uploadHint}</p>}

              {registerFeedback?.error && registerFeedback.message && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {registerFeedback.message}
                </p>
              )}

              {registerFeedback?.success && registerFeedback.message && (
                <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{registerFeedback.message}</p>
              )}

              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isImageUploadBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {isImageUploadBusy ? toUploadPhaseMessage(uploadPhase) : isIconStep ? 'Subir y registrar icono' : 'Subir y registrar captura'}
              </button>
            </form>

            {isIconStep && iconCount > 0 && icons[0]?.public_url && (
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Icono actual</p>
                <img
                  src={icons[0].public_url}
                  alt={icons[0].alt_text ?? 'Icono de la app'}
                  className="mt-2 h-20 w-20 rounded-xl border border-slate-200 object-cover"
                />
              </div>
            )}

            {isScreenshotStep && screenshotCount > 0 && (
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Capturas cargadas: {screenshotCount}</p>
                <div className="flex flex-wrap gap-2">
                  {screenshots.slice(0, 3).map((screenshot) => (
                    <img
                      key={screenshot.id}
                      src={screenshot.public_url ?? ''}
                      alt={screenshot.alt_text ?? 'Captura de pantalla'}
                      className="h-14 w-24 rounded-md border border-slate-200 object-cover"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleStepChange('MANAGE')}
                  className="text-xs font-semibold text-emerald-700 underline underline-offset-2"
                >
                  Reordenar y limpiar en revision
                </button>
              </div>
            )}
          </section>
        )}

        {isVideoStep && (
          <section className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-800">Paso 3: agrega un video externo (opcional)</h3>
              <p className="text-xs text-slate-600">Puedes dejarlo vacio y continuar. Si agregas uno, quedara visible en la ficha publica.</p>
            </div>

            <Form method="post" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <input type="hidden" name="intent" value="register_media" />
              <input type="hidden" name="app_id" value={appId} />
              <input type="hidden" name="media_type" value="VIDEO" />
              <input type="hidden" name="attach_to_draft" value="true" />

              <div className="space-y-1">
                <label htmlFor="external_video_url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  URL del video
                </label>
                <input
                  ref={videoUrlInputRef}
                  id="external_video_url"
                  name="external_video_url"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="video_alt_text" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Texto alternativo
                </label>
                <input
                  id="video_alt_text"
                  name="alt_text"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  placeholder="Video promocional"
                />
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Video className="h-4 w-4" />
                <Plus className="h-4 w-4" />
                Registrar video externo
              </button>
            </Form>

            {videoCount > 0 && (
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Video(s) agregado(s): {videoCount}</p>
                {videos.map((video) => (
                  <div key={video.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-2">
                    <a href={video.public_url ?? '#'} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 underline underline-offset-2">
                      {video.public_url}
                    </a>
                    <Form method="post">
                      <input type="hidden" name="intent" value="remove_media" />
                      <input type="hidden" name="app_id" value={appId} />
                      <input type="hidden" name="media_id" value={video.id} />
                      <input type="hidden" name="detach_from_draft" value="true" />
                      <input type="hidden" name="remove_from_library" value="true" />
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Quitar
                      </button>
                    </Form>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {isManageStep && (
          <div className="space-y-6">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-sm font-semibold text-emerald-900">Paso 4: revision final</p>
              <p className="mt-1 text-xs text-emerald-800">Aqui ordenas, reemplazas o limpias media antes de publicar.</p>
            </div>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Icono actual</h3>
              {iconCount > 0 ? (
                <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-3">
                  <img
                    src={icons[0].public_url ?? ''}
                    alt={icons[0].alt_text ?? 'Icono de la app'}
                    className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleQuickUploadIcon}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      Reemplazar
                    </button>
                    <Form method="post">
                      <input type="hidden" name="intent" value="remove_media" />
                      <input type="hidden" name="app_id" value={appId} />
                      <input type="hidden" name="media_id" value={icons[0].id} />
                      <input type="hidden" name="detach_from_draft" value="true" />
                      <input type="hidden" name="remove_from_library" value="true" />
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Quitar
                      </button>
                    </Form>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                  <p>Aun no tienes icono cargado.</p>
                  <button type="button" onClick={handleQuickUploadIcon} className="mt-2 text-sm font-semibold text-emerald-700 underline underline-offset-2">
                    Cargar icono ahora
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Capturas actuales</h3>
              {screenshotCount > 0 ? (
                <div className="space-y-3">
                  {screenshots.map((screenshot, index) => (
                    <div key={screenshot.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                      <img
                        src={screenshot.public_url ?? ''}
                        alt={screenshot.alt_text ?? 'Screenshot'}
                        className="h-20 w-36 rounded-lg border border-slate-200 object-cover"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Form method="post">
                          <input type="hidden" name="intent" value="remove_media" />
                          <input type="hidden" name="app_id" value={appId} />
                          <input type="hidden" name="media_id" value={screenshot.id} />
                          <input type="hidden" name="detach_from_draft" value="true" />
                          <input type="hidden" name="remove_from_library" value="true" />
                          <button
                            type="submit"
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Quitar
                          </button>
                        </Form>

                        <Form method="post">
                          <input type="hidden" name="intent" value="reorder_media" />
                          <input type="hidden" name="app_id" value={appId} />
                          <input type="hidden" name="ordered_media_ids" value={buildReorderedMediaIds(screenshotIds, index, index - 1).join(',')} />
                          <button
                            type="submit"
                            disabled={isBusy || index === 0}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                            Subir
                          </button>
                        </Form>

                        <Form method="post">
                          <input type="hidden" name="intent" value="reorder_media" />
                          <input type="hidden" name="app_id" value={appId} />
                          <input type="hidden" name="ordered_media_ids" value={buildReorderedMediaIds(screenshotIds, index, index + 1).join(',')} />
                          <button
                            type="submit"
                            disabled={isBusy || index === screenshots.length - 1}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                            Bajar
                          </button>
                        </Form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                  <p>No hay capturas asignadas.</p>
                  <button
                    type="button"
                    onClick={handleQuickUploadScreenshot}
                    className="mt-2 text-sm font-semibold text-emerald-700 underline underline-offset-2"
                  >
                    Subir primera captura
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Video externo</h3>
              {videoCount > 0 ? (
                <div className="space-y-2">
                  {videos.map((video) => (
                    <div key={video.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                      <a href={video.public_url ?? '#'} target="_blank" rel="noreferrer" className="text-sm text-emerald-700 underline underline-offset-2">
                        {video.public_url}
                      </a>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleQuickUploadVideo}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <UploadCloud className="h-3.5 w-3.5" />
                          Reemplazar
                        </button>
                        <Form method="post">
                          <input type="hidden" name="intent" value="remove_media" />
                          <input type="hidden" name="app_id" value={appId} />
                          <input type="hidden" name="media_id" value={video.id} />
                          <input type="hidden" name="detach_from_draft" value="true" />
                          <input type="hidden" name="remove_from_library" value="true" />
                          <button
                            type="submit"
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Quitar
                          </button>
                        </Form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                  <p>No hay video agregado.</p>
                  <button type="button" onClick={handleQuickUploadVideo} className="mt-2 text-sm font-semibold text-emerald-700 underline underline-offset-2">
                    Agregar video externo
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePreviousStep}
          disabled={activeStepIndex === 0}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>

        <p className="text-xs font-medium text-slate-500">
          Paso {activeStepIndex + 1} de {totalSteps}
        </p>

        <button
          type="button"
          onClick={handleNextStep}
          disabled={activeStepIndex === totalSteps - 1}
          className="inline-flex items-center rounded-lg border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {activeStepIndex === totalSteps - 2 ? 'Ir a revision' : 'Siguiente'}
        </button>
      </div>
    </section>
  )
}
