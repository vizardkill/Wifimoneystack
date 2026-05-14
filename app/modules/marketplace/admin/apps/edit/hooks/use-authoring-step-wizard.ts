import { useCallback, useMemo, useState } from 'react'

export type AuthoringStep = 'BASE' | 'STOREFRONT' | 'MEDIA' | 'VITRINA' | 'PREVIEW'

export const AUTHORING_STEPS: AuthoringStep[] = ['BASE', 'STOREFRONT', 'MEDIA', 'VITRINA', 'PREVIEW']

export const AUTHORING_STEP_LABELS: Record<AuthoringStep, string> = {
  BASE: 'Datos base',
  STOREFRONT: 'Contenido comercial',
  MEDIA: 'Media de vitrina',
  VITRINA: 'Modo vitrina',
  PREVIEW: 'Preview final'
}

interface WizardInput {
  app: {
    name: string
    summary: string
    access_mode: 'WEB_LINK' | 'PACKAGE_DOWNLOAD'
    web_url: string | null
  }
  draft_storefront: {
    readiness_status: 'INCOMPLETE' | 'READY'
    missing_requirements: string[]
  }
}

interface AuthoringStepWizard {
  activeStep: AuthoringStep
  activeStepIndex: number
  totalSteps: number
  isBaseStep: boolean
  isStorefrontStep: boolean
  isMediaStep: boolean
  isVitrinaStep: boolean
  isPreviewStep: boolean
  handleStepChange: (step: AuthoringStep) => void
  handlePreviousStep: () => void
  handleNextStep: () => void
  getStepStatusLabel: (step: AuthoringStep) => string
  isStepCompleted: (step: AuthoringStep) => boolean
}

export function useAuthoringStepWizard(input: WizardInput): AuthoringStepWizard {
  const [activeStep, setActiveStep] = useState<AuthoringStep>('BASE')

  const activeStepIndex = AUTHORING_STEPS.indexOf(activeStep)
  const totalSteps = AUTHORING_STEPS.length

  const missingRequirements = useMemo(() => new Set(input.draft_storefront.missing_requirements), [input.draft_storefront.missing_requirements])
  const missingWebUrl = input.app.access_mode === 'WEB_LINK' && (input.app.web_url ?? '').trim().length === 0

  const baseStepReady = input.app.name.trim().length > 0 && input.app.summary.trim().length > 0 && !missingWebUrl
  const storefrontStepReady =
    !missingRequirements.has('Resumen') &&
    !missingRequirements.has('Descripción') &&
    !missingRequirements.has('Instrucciones') &&
    !missingRequirements.has('Nombre del desarrollador') &&
    !missingRequirements.has('Sitio web del desarrollador') &&
    !missingRequirements.has('Al menos un idioma')
  const mediaStepReady = !missingRequirements.has('Un ícono seleccionado') && !missingRequirements.has('Al menos una captura de pantalla')
  const vitrinaStepReady = input.draft_storefront.readiness_status === 'READY'

  const handleStepChange = useCallback((step: AuthoringStep): void => {
    setActiveStep(step)
  }, [])

  const handlePreviousStep = useCallback((): void => {
    setActiveStep((currentStep) => {
      const currentIndex = AUTHORING_STEPS.indexOf(currentStep)
      if (currentIndex <= 0) {
        return currentStep
      }

      return AUTHORING_STEPS[currentIndex - 1]
    })
  }, [])

  const handleNextStep = useCallback((): void => {
    setActiveStep((currentStep) => {
      const currentIndex = AUTHORING_STEPS.indexOf(currentStep)
      if (currentIndex >= AUTHORING_STEPS.length - 1) {
        return currentStep
      }

      return AUTHORING_STEPS[currentIndex + 1]
    })
  }, [])

  const getStepStatusLabel = useCallback(
    (step: AuthoringStep): string => {
      if (step === 'BASE') {
        if (baseStepReady) {
          return 'Listo'
        }

        return missingWebUrl ? 'Falta URL web' : 'Pendiente'
      }

      if (step === 'STOREFRONT') {
        return storefrontStepReady ? 'Listo' : 'Pendiente'
      }

      if (step === 'MEDIA') {
        return mediaStepReady ? 'Listo' : 'Pendiente'
      }

      if (step === 'VITRINA') {
        return vitrinaStepReady ? 'Lista para publicar' : 'Faltan requeridos'
      }

      return vitrinaStepReady ? 'Lista para revisar' : 'En preparación'
    },
    [baseStepReady, mediaStepReady, missingWebUrl, storefrontStepReady, vitrinaStepReady]
  )

  const isStepCompleted = useCallback(
    (step: AuthoringStep): boolean => {
      if (step === 'BASE') {
        return baseStepReady
      }

      if (step === 'STOREFRONT') {
        return storefrontStepReady
      }

      if (step === 'MEDIA') {
        return mediaStepReady
      }

      if (step === 'VITRINA') {
        return vitrinaStepReady
      }

      return vitrinaStepReady
    },
    [baseStepReady, storefrontStepReady, mediaStepReady, vitrinaStepReady]
  )

  return {
    activeStep,
    activeStepIndex,
    totalSteps,
    isBaseStep: activeStep === 'BASE',
    isStorefrontStep: activeStep === 'STOREFRONT',
    isMediaStep: activeStep === 'MEDIA',
    isVitrinaStep: activeStep === 'VITRINA',
    isPreviewStep: activeStep === 'PREVIEW',
    handleStepChange,
    handlePreviousStep,
    handleNextStep,
    getStepStatusLabel,
    isStepCompleted
  }
}
