import type { JSX } from 'react'

import { Sparkles } from 'lucide-react'
import { data, type LoaderFunctionArgs } from 'react-router'
import { useLoaderData } from 'react-router'

import { AppGrid } from '@modules/marketplace'

export async function loader({ request }: LoaderFunctionArgs) {
  const { getSession } = await import('@/core/auth/cookie.server')
  const { verifyUserToken } = await import('@/core/auth/verify_token.server')
  const { CLS_ListPublishedMarketplaceApps } = await import('@/core/marketplace/marketplace.server')

  const session = await getSession(request.headers.get('Cookie'))
  const token = typeof session.get('token') === 'string' ? (session.get('token') as string) : ''
  const user = token ? verifyUserToken(token) : null

  if (!user) {
    const { redirect } = await import('react-router')
    throw redirect('/login')
  }

  const url = new URL(request.url)
  const search = url.searchParams.get('q')?.trim() || undefined

  const result = await new CLS_ListPublishedMarketplaceApps({
    user_id: user.id,
    category: 'CLAUDE_SKILL',
    search,
    page: 1,
    per_page: 240
  }).main()

  return data({
    apps: result.data?.apps ?? [],
    search: search ?? '',
    error: result.error ? (result.message ?? 'No pudimos cargar los skills.') : null
  })
}

export default function MarketplaceSkillsPage(): JSX.Element {
  const { apps, search, error } = useLoaderData<typeof loader>()

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-mp-home-accent/30 bg-mp-home-accent/10 px-3 py-1 text-xs font-semibold text-mp-home-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Skills para Claude
        </span>
        <h1 className="font-heading text-3xl font-bold text-mp-home-text">Descarga skills para Claude</h1>
        <p className="max-w-2xl text-sm text-mp-home-muted">
          Paquetes listos para instalar en Claude Code. Cada skill incluye su <code className="rounded bg-mp-home-surface px-1">SKILL.md</code>. Descomprime el
          .zip dentro de <code className="rounded bg-mp-home-surface px-1">~/.claude/skills/</code> y reinicia Claude para activarlo.
        </p>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
      ) : (
        <AppGrid apps={apps} emptySearch={search || undefined} emptyMessage="Aún no hay skills publicados." />
      )}
    </div>
  )
}
