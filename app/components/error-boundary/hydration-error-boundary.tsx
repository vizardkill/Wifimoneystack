/**
 * @file HydrationErrorBoundary.tsx
 * @description Error Boundary que suprime errores de hidratación en producción
 * y los maneja de forma silenciosa sin revelar información del stack tecnológico
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary personalizado para manejar errores de hidratación
 * En producción: Suprime los errores silenciosamente
 * En desarrollo: Muestra los errores para debugging
 */
export class HydrationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const isHydrationError =
      error.message.includes('Minified React error #418') ||
      error.message.includes('Minified React error #423') ||
      error.message.includes('Minified React error #425') ||
      error.message.includes('Hydration') ||
      errorInfo.componentStack?.includes('Hydration')

    if (isHydrationError) {
      this.logToMonitoringService({
        type: 'hydration_error',
        message: 'Client/Server mismatch detected',
        timestamp: new Date().toISOString()
      })

      setTimeout(() => {
        this.setState({ hasError: false, error: null })
      }, 0)
    }
  }

  /**
   * Método para enviar errores a un servicio de monitoreo
   */
  private logToMonitoringService(error: { type: string; message: string; timestamp: string }): void {
    // TODO: Integrar con tu servicio de monitoreo
    void error
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // if (process.env.NODE_ENV === 'development') {
      //   return (
      //     <div
      //       style={{
      //         padding: '20px',
      //         background: '#fff3cd',
      //         border: '1px solid #ffc107',
      //         borderRadius: '4px',
      //         margin: '10px'
      //       }}
      //     >
      //       <h3>⚠️ Hydration Error Detected</h3>
      //       <p>El HTML del servidor no coincide con el cliente.</p>
      //       <details>
      //         <summary>Ver detalles técnicos</summary>
      //         <pre style={{ fontSize: '12px', overflow: 'auto' }}>{this.state.error?.message}</pre>
      //       </details>
      //     </div>
      //   )
      // }

      return this.props.fallback ?? null
    }

    return this.props.children
  }
}
