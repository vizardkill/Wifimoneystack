import React from 'react'

import 'react-phone-number-input/style.css'
import { data, type LinksFunction, type LoaderFunctionArgs, type MetaFunction } from 'react-router'
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useRouteError } from 'react-router'
import { Toaster } from 'sonner'

import { trackError } from '@lib/functions/_track_error.function'

import { HydrationErrorBoundary } from './components/error-boundary/hydration-error-boundary'
import styles from './tailwind.css?url'

interface LoaderData {
  ENV: {
    SENTRY_DSN: string | undefined
    NODE_ENV: string | undefined
    VAPID_PUBLIC_KEY: string | undefined
  }
}

/**
 * Loader para pasar variables de entorno al cliente
 */
export function loader(_args: LoaderFunctionArgs): ReturnType<typeof data> {
  return data({
    ENV: {
      SENTRY_DSN: process.env.SENTRY_DSN,
      NODE_ENV: process.env.NODE_ENV,
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY
    }
  })
}

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-icon-57x57.png' },
  { rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-icon-60x60.png' },
  { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-icon-72x72.png' },
  { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-icon-76x76.png' },
  { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-icon-114x114.png' },
  { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-icon-120x120.png' },
  { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-icon-144x144.png' },
  { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-icon-152x152.png' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-icon-180x180.png' },
  { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-icon-192x192.png' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
  { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
  { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
  { rel: 'manifest', href: '/manifest.json' },
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&display=swap'
  }
]

export const meta: MetaFunction = () => [
  { name: 'msapplication-TileColor', content: '#020617' },
  { name: 'msapplication-TileImage', content: '/ms-icon-144x144.png' },
  { name: 'theme-color', content: '#020617' }
]

export function Layout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const data = useLoaderData<typeof loader>() as LoaderData | undefined

  const toastOptions = React.useMemo(() => ({ duration: 5000, richColors: true, closeButton: true }), [])
  const envScript = React.useMemo(() => (data?.ENV != null ? { __html: `window.ENV = ${JSON.stringify(data.ENV)}` } : null), [data?.ENV])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {envScript != null && <script dangerouslySetInnerHTML={envScript} />}
      </head>
      <body>
        {children}
        <Toaster position="bottom-right" richColors closeButton toastOptions={toastOptions} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function App(): React.JSX.Element {
  return (
    <HydrationErrorBoundary>
      <Outlet />
    </HydrationErrorBoundary>
  )
}

export default App

/**
 * ErrorBoundary global que captura errores no manejados
 * y los envía a Sentry
 */
export function ErrorBoundary(): React.JSX.Element {
  const error = useRouteError()

  // Capturar el error en Sentry
  if (error instanceof Error) {
    trackError({
      error,
      module: 'ui-routing',
      controller: 'root',
      method: 'ErrorBoundary',
      level: 'error',
      title: 'Unhandled route error',
      description: 'Error capturado por el ErrorBoundary global de React Router',
      tags: {
        runtime: 'client'
      }
    })
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>Error - WMC Marketplace</title>
      </head>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md space-y-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900">Oops!</h1>
            <p className="text-lg text-gray-600">{error instanceof Error ? error.message : 'Ha ocurrido un error inesperado'}</p>
            <a href="/" className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
              Volver al inicio
            </a>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
