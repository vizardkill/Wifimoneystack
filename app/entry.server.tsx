import * as Sentry from '@sentry/react-router'
import { createReadableStreamFromReadable } from '@react-router/node'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import type { AppLoadContext, EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'
import { PassThrough } from 'stream'

import { trackError } from '@lib/functions/_track_error.function'

const ABORT_DELAY = 5_000

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
): Promise<unknown> {
  return isbot(request.headers.get('user-agent') || '')
    ? handleBotRequest(request, responseStatusCode, responseHeaders, routerContext)
    : handleBrowserRequest(request, responseStatusCode, responseHeaders, routerContext)
}

function handleBotRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, routerContext: EntryContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { pipe, abort } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} />, {
      onAllReady() {
        shellRendered = true
        const body = new PassThrough()
        const stream = createReadableStreamFromReadable(body)

        responseHeaders.set('Content-Type', 'text/html')

        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode
          })
        )

        pipe(body)
      },
      onShellError(error: unknown) {
        reject(error instanceof Error ? error : new Error(String(error)))
      },
      onError(error: unknown) {
        responseStatusCode = 500
        if (shellRendered) {
          const parsedError = error instanceof Error ? error : new Error(String(error))
          trackError({
            error: parsedError,
            module: 'ssr-render',
            controller: 'entry-server',
            method: 'handleBotRequest.onError',
            level: 'error',
            title: 'SSR bot render error',
            description: 'Fallo durante el render server-side para user-agent bot',
            tags: {
              runtime: 'server',
              target: 'bot'
            },
            additionalContext: {
              requestUrl: request.url,
              responseStatusCode
            }
          })
        }
      }
    })

    setTimeout(abort, ABORT_DELAY)
  })
}

function handleBrowserRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, routerContext: EntryContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { pipe, abort } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} />, {
      onShellReady() {
        shellRendered = true
        const body = new PassThrough()
        const stream = createReadableStreamFromReadable(body)

        responseHeaders.set('Content-Type', 'text/html')

        resolve(
          new Response(stream, {
            headers: responseHeaders,
            status: responseStatusCode
          })
        )

        pipe(body)
      },
      onShellError(error: unknown) {
        reject(error instanceof Error ? error : new Error(String(error)))
      },
      onError(error: unknown) {
        responseStatusCode = 500
        if (shellRendered) {
          const parsedError = error instanceof Error ? error : new Error(String(error))
          trackError({
            error: parsedError,
            module: 'ssr-render',
            controller: 'entry-server',
            method: 'handleBrowserRequest.onError',
            level: 'error',
            title: 'SSR browser render error',
            description: 'Fallo durante el render server-side para navegador',
            tags: {
              runtime: 'server',
              target: 'browser'
            },
            additionalContext: {
              requestUrl: request.url,
              responseStatusCode
            }
          })
        }
      }
    })

    setTimeout(abort, ABORT_DELAY)
  })
}

/**
 * Manejo de errores del servidor con Sentry
 * Este handler captura automáticamente todos los errores no capturados
 */
export const handleError = Sentry.createSentryHandleError({ logErrors: true })
