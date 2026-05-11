import React from 'react'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface NotFoundProps {
  title?: string
  description?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  showRefreshButton?: boolean
  isDashboard?: boolean
  customActions?: React.ReactNode
}

export function NotFound({
  title = 'Página no encontrada',
  description = 'Lo sentimos, la página que buscas no existe o ha sido movida.',
  showBackButton = true,
  showHomeButton = true,
  showRefreshButton = true,
  isDashboard = false,
  customActions
}: NotFoundProps): React.JSX.Element {
  const handleGoBack = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }, [])

  const handleRefresh = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }, [])

  return (
    <div className={`min-h-screen ${isDashboard ? 'bg-gray-50/50' : 'bg-background'} flex items-center justify-center p-4`}>
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center space-y-8">
            {/* Animación Lottie */}
            <div className="flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80">
                <DotLottieReact src="https://lottie.host/f03b7a87-ab7c-4ea7-b745-9e26715b19b0/Hd8Zq9DvbV.lottie" loop autoplay className="w-full h-full" />
              </div>
            </div>

            {/* Contenido */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700">{title}</h2>
              </div>

              <p className="text-gray-600 text-base md:text-lg max-w-md mx-auto leading-relaxed">{description}</p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {showHomeButton && (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to={isDashboard ? '/dashboard' : '/'}>
                    <Home className="mr-2 h-4 w-4" />
                    {isDashboard ? 'Ir al Dashboard' : 'Ir al Inicio'}
                  </Link>
                </Button>
              )}

              {showBackButton && (
                <Button variant="outline" size="lg" onClick={handleGoBack} className="w-full sm:w-auto">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver Atrás
                </Button>
              )}

              {showRefreshButton && (
                <Button variant="ghost" size="lg" onClick={handleRefresh} className="w-full sm:w-auto">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recargar
                </Button>
              )}
            </div>

            {/* Acciones personalizadas */}
            {customActions != null && customActions !== false && <div className="pt-4 border-t">{customActions}</div>}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            ¿Necesitas ayuda?{' '}
            <a href="mailto:soporte@tuapp.com" className="text-blue-600 hover:text-blue-700 font-medium underline">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
