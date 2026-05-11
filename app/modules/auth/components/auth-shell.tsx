import type { CSSProperties, JSX, ReactNode } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify'

type AuthShellProps = {
  mode: AuthMode
  title: string
  subtitle: string
  children: ReactNode
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const HERO_CONTENT: Record<AuthMode, { headline: string; subline: string; badge: string }> = {
  login: {
    headline: '21 APPS.\nCORRIENDO.',
    subline: 'Accedé al stack operativo completo de una empresa de e-commerce que procesa entre 10.000 y 20.000 órdenes mensuales.',
    badge: '● SISTEMA · ACTIVO'
  },
  signup: {
    headline: 'INSTALÁ\nEL CÓDIGO.',
    subline: 'Creá tu cuenta para acceder al ecosistema de aplicaciones ecommerce. Sujeto a aprobación del equipo WMC.',
    badge: '● ACCESO · PENDIENTE'
  },
  forgot: {
    headline: 'RECUPERÁ\nTU ACCESO.',
    subline: 'El sistema sigue operando. Restablecé tu contraseña y volvé al stack en segundos.',
    badge: '● AUTH · RESET'
  },
  reset: {
    headline: 'NUEVA\nCONTRASEÑA.',
    subline: 'Definí tu nueva contraseña y volvé a operar el stack sin interrupciones.',
    badge: '● AUTH · SECURE'
  },
  verify: {
    headline: 'VERIFICÁ\nTU CORREO.',
    subline: 'Confirmá tu dirección de email para activar tu cuenta y quedar en cola de aprobación.',
    badge: '● VERIFICACIÓN · PENDIENTE'
  }
}

/** Dot-grid scan-line pattern for the brand panel */
const DOT_PATTERN_STYLE: CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.08) 1px, transparent 1px)',
  backgroundSize: '28px 28px'
}

/** Terminal-green glow from top */
const GLOW_STYLE: CSSProperties = {
  background: 'radial-gradient(ellipse at top, rgba(34,197,94,0.06) 0%, transparent 65%)'
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AuthShell({ mode, title, subtitle, children }: AuthShellProps): JSX.Element {
  const hero = HERO_CONTENT[mode]

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* ── Brand Panel (desktop only) ─────────────────────────────── */}
      <section
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#020617] p-10 lg:p-14 md:flex lg:w-[45%]"
        aria-label="Brand showcase"
      >
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0" style={DOT_PATTERN_STYLE} />
        <div className="pointer-events-none absolute inset-0" style={GLOW_STYLE} />

        {/* Top: wordmark + badge */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-1">
            <p className="font-mono text-xs tracking-[0.25em] text-[#22c55e]">WMC · MARKETPLACE</p>
            <p className="font-mono text-xs tracking-[0.2em] text-[#94a3b8]">V04.26 · COL · MEX · CHL · ECU · PER</p>
          </div>
          <div className="max-w-xs space-y-4">
            <h1 className="font-mono text-3xl font-bold leading-tight tracking-tight whitespace-pre-line text-white lg:text-4xl">{hero.headline}</h1>
            <p className="text-sm leading-relaxed text-[#94a3b8]">{hero.subline}</p>
          </div>
        </div>

        {/* Center: stat block */}
        <div className="relative z-10 space-y-3 py-8">
          {[
            { label: 'APPS ACTIVAS', value: '21' },
            { label: 'ÓRDENES / MES', value: '15.000' },
            { label: 'OPERADORES LATAM', value: '800+' }
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline justify-between border-b border-[#1e293b] pb-2">
              <span className="font-mono text-xs tracking-widest text-[#94a3b8]">{stat.label}</span>
              <span className="font-mono text-sm font-semibold text-white">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Bottom: live badge */}
        <p className="relative z-10 font-mono text-xs tracking-[0.2em] text-[#22c55e]">{hero.badge}</p>
      </section>

      {/* ── Mobile Header ──────────────────────────────────────────── */}
      <div className="flex w-full items-center justify-between bg-[#020617] px-6 py-4 md:hidden">
        <div className="space-y-0.5">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-white">WMC · MARKETPLACE</p>
          <p className="font-mono text-[10px] tracking-widest text-[#22c55e]">● SISTEMA · ACTIVO</p>
        </div>
        <p className="font-mono text-[10px] tracking-widest text-[#94a3b8]">V04.26</p>
      </div>

      {/* ── Form Panel ─────────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-10 md:px-12 md:py-16" aria-label="Authentication form">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <h2 className="font-mono text-2xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
