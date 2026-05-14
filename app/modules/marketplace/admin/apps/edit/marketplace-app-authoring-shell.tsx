import type { JSX } from 'react'

import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { Form, Link } from 'react-router'

import { MediaGalleryManager, StorefrontAuthoringForm, StorefrontPreview, StorefrontReadinessPanel } from './components'
import { AUTHORING_STEP_LABELS, AUTHORING_STEPS, useAuthoringStepWizard } from './hooks/use-authoring-step-wizard'
import { useMarketplaceBasicAppForm } from './hooks/use-marketplace-basic-app-form'

interface AuthoringData {
  app: {
    id: string
    slug: string
    name: string
    summary: string
    status: string
    access_mode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
    web_url: string | null
    has_active_artifact: boolean
  }
  draft_storefront: {
    readiness_status: 'INCOMPLETE' | 'READY'
    summary: string
    description: string
    instructions: string
    developer_name: string
    developer_website: string
    support_email: string | null
    support_url: string | null
    language_codes: string[]
    missing_requirements: string[]
    updated_at: Date | string | null
  }
  published_storefront: {
    published_at: Date | string | null
  } | null
  draft_media: Array<{
    id: string
    type: string
    public_url: string | null
    alt_text: string | null
    sort_order: number
  }>
  language_catalog: Array<{
    code: string
    label: string
    sort_order: number
    is_active: boolean
  }>
}

interface MarketplaceAppAuthoringShellProps {
  authoring: AuthoringData
  isSubmitting: boolean
  actionError: string | null
  actionSuccess: string | null
}

export function MarketplaceAppAuthoringShell({ authoring, isSubmitting, actionError, actionSuccess }: MarketplaceAppAuthoringShellProps): JSX.Element {
  const {
    activeStep,
    activeStepIndex,
    totalSteps,
    isBaseStep,
    isStorefrontStep,
    isMediaStep,
    isVitrinaStep,
    isPreviewStep,
    handleStepChange,
    handlePreviousStep,
    handleNextStep,
    getStepStatusLabel,
    isStepCompleted
  } = useAuthoringStepWizard(authoring)

  const { form: basicForm, handleValidatedSubmit: handleBasicFormSubmit } = useMarketplaceBasicAppForm({
    defaultValues: {
      name: authoring.app.name,
      summary: authoring.app.summary,
      slug: authoring.app.slug,
      access_mode: authoring.app.access_mode,
      web_url: authoring.app.web_url ?? ''
    }
  })

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <Link to="/dashboard/marketplace/apps" className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold text-slate-900">Authoring de vitrina: {authoring.app.name}</h1>
          <p className="text-sm text-slate-600">Edita datos base y define la ficha comercial enriquecida para storefront público.</p>
        </div>

        {actionError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{actionError}</div>}
        {actionSuccess && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{actionSuccess}</div>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 space-y-1">
          <h2 className="font-heading text-xl font-bold text-slate-900">Wizard completo de authoring</h2>
          <p className="text-sm text-slate-600">Ahora todo el flujo está dividido por pasos: datos base, contenido comercial, media, modo vitrina y preview.</p>
        </div>

        <ol className="grid grid-cols-2 gap-2 xl:grid-cols-5">
          {AUTHORING_STEPS.map((step, index) => {
            const isCurrentStep = step === activeStep
            const isCompletedStep = isStepCompleted(step)

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
                        ? isCompletedStep
                          ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700'
                          : 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-900'
                        : isCompletedStep
                          ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700'
                          : 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700'
                    }
                  >
                    {isCompletedStep ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{AUTHORING_STEP_LABELS[step]}</span>
                    <span className={isCurrentStep ? 'block text-[11px] text-slate-200' : 'block text-[11px] text-slate-500'}>{getStepStatusLabel(step)}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
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
            {activeStepIndex === totalSteps - 2 ? 'Ir a preview' : 'Siguiente'}
          </button>
        </div>
      </section>

      {isBaseStep && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 space-y-1">
            <h2 className="font-heading text-xl font-bold text-slate-900">Datos base de la app</h2>
            <p className="text-sm text-slate-600">Estos datos mantienen la identidad general de la app y sus requisitos operativos de activación.</p>
          </div>

          <Form method="post" className="space-y-4" noValidate onSubmit={handleBasicFormSubmit}>
            <input type="hidden" name="intent" value="save_basic" />
            <input type="hidden" {...basicForm.register('access_mode')} value={authoring.app.access_mode} readOnly />
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-700">Modo de acceso</p>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                  {authoring.app.access_mode === 'WEB_LINK' ? 'Enlace web' : 'Descarga de paquete'}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                  Nombre
                </label>
                <input
                  id="name"
                  {...basicForm.register('name')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
                {basicForm.formState.errors.name?.message && <p className="text-xs text-red-600">{basicForm.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="summary" className="text-sm font-semibold text-slate-700">
                  Resumen de catálogo
                </label>
                <input
                  id="summary"
                  {...basicForm.register('summary')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
                {basicForm.formState.errors.summary?.message && <p className="text-xs text-red-600">{basicForm.formState.errors.summary.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="slug" className="text-sm font-semibold text-slate-700">
                  Slug (opcional)
                </label>
                <input
                  id="slug"
                  {...basicForm.register('slug')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                />
                {basicForm.formState.errors.slug?.message && <p className="text-xs text-red-600">{basicForm.formState.errors.slug.message}</p>}
              </div>

              {authoring.app.access_mode === 'WEB_LINK' ? (
                <div className="space-y-1.5">
                  <label htmlFor="web_url" className="text-sm font-semibold text-slate-700">
                    URL web de la app
                  </label>
                  <input
                    id="web_url"
                    type="url"
                    placeholder="https://..."
                    {...basicForm.register('web_url')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  />
                  <p className="text-xs text-slate-500">La activación de apps WEB_LINK requiere una URL HTTPS válida.</p>
                  {basicForm.formState.errors.web_url?.message && <p className="text-xs text-red-600">{basicForm.formState.errors.web_url.message}</p>}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  Las apps PACKAGE_DOWNLOAD requieren un artefacto activo para poder activarse desde el catálogo.
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar datos base
            </button>
          </Form>
        </section>
      )}

      {isStorefrontStep && (
        <StorefrontAuthoringForm
          appId={authoring.app.id}
          defaultValues={authoring.draft_storefront}
          languageCatalog={authoring.language_catalog}
          isSubmitting={isSubmitting}
        />
      )}

      {isMediaStep && <MediaGalleryManager draftMedia={authoring.draft_media} appId={authoring.app.id} isSubmitting={isSubmitting} />}

      {isVitrinaStep && (
        <StorefrontReadinessPanel
          readinessStatus={authoring.draft_storefront.readiness_status}
          missingRequirements={authoring.draft_storefront.missing_requirements}
          draftUpdatedAt={authoring.draft_storefront.updated_at}
          publishedUpdatedAt={authoring.published_storefront?.published_at ?? null}
          currentAppStatus={authoring.app.status}
          accessMode={authoring.app.access_mode}
          webUrl={authoring.app.web_url}
          hasActiveArtifact={authoring.app.has_active_artifact}
          appId={authoring.app.id}
          canPublish={authoring.draft_storefront.readiness_status === 'READY'}
          isPublishing={isSubmitting}
          hasPublishedVersion={Boolean(authoring.published_storefront)}
        />
      )}

      {isPreviewStep && (
        <StorefrontPreview
          appName={authoring.app.name}
          accessMode={authoring.app.access_mode}
          draftStorefront={authoring.draft_storefront}
          draftMedia={authoring.draft_media}
        />
      )}
    </div>
  )
}
