import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { DevTools } from '@vitejs/devtools'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  build: {
    chunkSizeWarningLimit: 2000,
    // Sourcemaps ocultos para no exponer código pero permitir debugging con Sentry
    sourcemap: 'hidden',
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignorar warnings de mixed imports - en Remix es intencional para separar código cliente/servidor
        if (warning.code === 'MIXED_DYNAMIC_AND_STATIC_IMPORTS') {
          return
        }
        // Ignorar warnings de sourcemaps que no afectan la app
        if (warning.message.includes('sourcemap') && warning.message.includes("Can't resolve original location")) {
          return
        }
        // Ignorar empty chunks de rutas API-only (no tienen componente React)
        if (warning.code === 'EMPTY_BUNDLE') {
          return
        }
        warn(warning)
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks(id) {
          // Separar vendor chunks para mejor caching
          if (id.includes('node_modules')) {
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'vendor-radix'
            }
            // React ecosystem
            if (id.includes('react-dom') || id.includes('react-hook-form') || id.includes('react-router')) {
              return 'vendor-react'
            }
            // Lucide icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            // Date utilities
            if (id.includes('date-fns') || id.includes('react-day-picker')) {
              return 'vendor-dates'
            }
            // Tanstack table
            if (id.includes('@tanstack')) {
              return 'vendor-table'
            }
          }
        }
      }
    },
    copyPublicDir: true
  },
  publicDir: 'public',
  assetsInclude: ['**/*.html'],
  plugins: [
    DevTools(),
    tailwindcss(),
    reactRouter(),
    // Plugin de Sentry para upload de sourcemaps (solo si hay auth token configurado)
    process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          // Solo subir sourcemaps en builds de producción
          disable: process.env.NODE_ENV !== 'production',
          telemetry: false,
          // Configuración adicional
          sourcemaps: {
            filesToDeleteAfterUpload: ['**/*.map']
          }
        })
      : undefined
  ].filter(Boolean),
  server: {
    host: true,
    allowedHosts: true,
    cors: true
  },
  ssr: {
    external: [
      '@prisma/client',
      '@prisma/adapter-pg',
      '@prisma/client-runtime-utils',
      '.prisma/client',
      '.prisma/client/runtime',
      '.prisma/client/default',
      'prisma',
      'pg',
      'pg-pool',
      '@server/db'
    ],
    noExternal: []
  }
})
