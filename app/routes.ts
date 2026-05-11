import { index, layout, prefix, route, type RouteConfig } from '@react-router/dev/routes'

export default [
  index('./routes/_index.tsx'),

  route('*', './routes/not-found.tsx'),

  // ── API: Auth (sesiones + OAuth Google) ────────────────────────────────────
  ...prefix('api/v1/auth', [
    route('sessions', './routes/api/v1/auth/sessions.ts'),
    route('sessions/verify', './routes/api/v1/auth/sessions.verify.ts'),
    route('sessions/resend', './routes/api/v1/auth/sessions.resend.ts'),
    route('oauth/google', './routes/api/v1/auth/oauth.google.ts'),
    route('oauth/google/callback', './routes/api/v1/auth/oauth.google.callback.ts'),
    route('oauth/google/register', './routes/api/v1/auth/oauth.google.register.ts')
  ]),

  // ── Auth (login, signup, forgot/reset password, verificación) ─────────────
  layout('./routes/auth/_layout.tsx', [
    route('login', './routes/auth/login.tsx'),
    route('signup', './routes/auth/signup.tsx'),
    route('forgot-password', './routes/auth/forgot-password.tsx'),
    route('reset-password', './routes/auth/reset-password.tsx'),
    route('verification-status', './routes/auth/verification-status.tsx'),
    route('access-status', './routes/auth/access-status.tsx')
  ]),

  // ── Marketplace (catálogo de apps para usuarios aprobados) ─────────────────
  layout('./routes/marketplace/_layout.tsx', [
    route('marketplace', './routes/marketplace/_index.tsx'),
    route('marketplace/apps/:appId', './routes/marketplace/apps/$appId.tsx'),
    route('marketplace/apps/:appId/use', './routes/marketplace/apps/$appId.use.ts'),
    route('marketplace/apps/:appId/download', './routes/marketplace/apps/$appId.download.ts')
  ]),

  // ── Dashboard admin marketplace ────────────────────────────────────────────
  route('dashboard', './routes/dashboard/_layout.tsx', [
    index('./routes/dashboard/_index.tsx'),
    route('marketplace', './routes/dashboard/marketplace/_index.tsx'),
    route('marketplace/users', './routes/dashboard/marketplace/users.tsx'),
    route('marketplace/apps', './routes/dashboard/marketplace/apps.tsx'),
    route('marketplace/apps/new', './routes/dashboard/marketplace/apps/new.tsx'),
    route('marketplace/apps/:appId/edit', './routes/dashboard/marketplace/apps/$appId.edit.tsx')
  ])
] satisfies RouteConfig
