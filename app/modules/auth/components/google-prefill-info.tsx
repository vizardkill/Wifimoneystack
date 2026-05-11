import type { JSX } from 'react'

import { Info } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'

interface GooglePrefillInfoProps {
  isVisible: boolean
  className?: string
}

export function GooglePrefillInfo({ isVisible, className = '' }: GooglePrefillInfoProps): JSX.Element | null {
  if (!isVisible) {
    return null
  }

  return (
    <Alert className={`bg-blue-50 border-blue-200 ${className}`}>
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        Hemos pre-llenado algunos campos con tu información de Google. Solo necesitas agregar tu país y crear una contraseña.
      </AlertDescription>
    </Alert>
  )
}
