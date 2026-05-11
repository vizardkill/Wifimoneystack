import eslintConfigPrettier from 'eslint-config-prettier'
import importX from 'eslint-plugin-import-x'
import n from 'eslint-plugin-n'
import prettier from 'eslint-plugin-prettier'
import promise from 'eslint-plugin-promise'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactPerf from 'eslint-plugin-react-perf'
import sonarjs from 'eslint-plugin-sonarjs'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // ============================================
  // IGNORES GLOBALES
  // ============================================
  {
    ignores: [
      '.graphqlrc.ts',
      'eslint.config.mjs',
      'instrument.server.mjs',
      'app/core/config/templates/**/*.js',
      'build/**',
      'node_modules/**',
      'postcss.config.js',
      'scripts/**/*.js',
      'cmd/**/*.js',
      'prettier.config.cjs',
      'commitlint.config.cjs',
      '.cache/**',
      '.shadowenv.d/**',
      '.vscode/**',
      'public/**',
      '.github/**',
      'tmp/**',
      '*.yml',
      '.shopify/**',
      '.react-router/**',
      'prisma/**'
    ]
  },

  // ============================================
  // BASE: ESLint recommended + TypeScript
  // ============================================
  ...tseslint.configs.recommendedTypeChecked,

  // ============================================
  // REACT
  // ============================================
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  // ============================================
  // REACT HOOKS (manual registration - v7 recommended includes React Compiler rules)
  // ============================================
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  },

  // ============================================
  // IMPORT-X (replaces eslint-plugin-import)
  // ============================================
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,

  // ============================================
  // PROMISE
  // ============================================
  promise.configs['flat/recommended'],

  // ============================================
  // PRETTIER (must be last to override formatting rules)
  // Disable conflicting formatting rules, then enable prettier rule
  // ============================================
  eslintConfigPrettier,

  // ============================================
  // CONFIGURACIÓN GLOBAL PARA TODOS LOS ARCHIVOS TS/TSX
  // ============================================
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        shopify: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    settings: {
      react: { version: 'detect' }
    },
    plugins: {
      n,
      prettier,
      'react-perf': reactPerf,
      sonarjs
    },
    rules: {
      // ============================================
      // REGLAS DE REACT
      // ============================================
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-key': 'error',
      'react/no-array-index-key': 'warn',
      'react/self-closing-comp': 'error',
      'react/no-unknown-property': ['error', { ignore: ['cmdk-input-wrapper'] }],

      // ============================================
      // REGLAS DE REACT HOOKS
      // ============================================
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ============================================
      // REGLAS DE PERFORMANCE REACT
      // ============================================
      'react-perf/jsx-no-new-object-as-prop': 'warn',
      'react-perf/jsx-no-new-array-as-prop': 'warn',
      'react-perf/jsx-no-new-function-as-prop': 'warn',
      'react-perf/jsx-no-jsx-as-prop': 'warn',

      // ============================================
      // REGLAS DE TYPESCRIPT ESTRICTAS
      // ============================================
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-namespace': 'off',

      // Reglas de type-checking
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: true,
          allowNumber: true,
          allowNullableObject: true,
          allowNullableBoolean: true,
          allowNullableString: true,
          allowNullableNumber: true,
          allowAny: false
        }
      ],
      '@typescript-eslint/prefer-nullish-coalescing': ['warn', { ignorePrimitives: true }],
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/consistent-type-exports': 'warn',

      // ============================================
      // REGLAS DE IMPORTS (import-x)
      // ============================================
      'import-x/no-duplicates': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-unresolved': 'off',
      'import-x/named': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/no-cycle': 'warn',
      'import-x/no-self-import': 'error',
      'import-x/no-extraneous-dependencies': [
        'warn',
        {
          devDependencies: [
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/vite.config.ts',
            '**/scripts/**',
            '**/*.config.ts',
            '**/prisma.config.ts'
          ],
          optionalDependencies: false,
          peerDependencies: false
        }
      ],

      // ============================================
      // REGLAS DE ESTILO DE CÓDIGO
      // ============================================
      curly: 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-nested-ternary': 'off',
      'no-unneeded-ternary': 'error',
      'array-callback-return': ['error', { allowImplicit: true }],
      'no-return-await': 'warn',
      'require-atomic-updates': 'warn',

      // ============================================
      // PRETTIER (delegar formateo a prettier.config.cjs)
      // ============================================
      'prettier/prettier': 'error'
    }
  },

  // ============================================
  // OVERRIDES
  // ============================================

  // Config/scripts - permitir require()
  {
    files: ['*.config.js', '*.config.cjs', '*.config.ts', 'scripts/**'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },

  // Servicios del core - patrón command.call(this)
  {
    files: ['app/core/**/services/*.ts', 'app/core/**/*.service.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },

  // Componentes de tracking/pixels - SDKs externos sin tipos
  {
    files: ['app/components/marketing/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'warn'
    }
  },

  // Archivos de tipos - pueden necesitar any para compatibilidad
  {
    files: ['app/lib/types/**/*.ts', 'types.d.ts', 'env.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },

  // Providers - APIs externas pueden requerir any y command pattern
  {
    files: ['app/core/**/providers/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/require-await': 'off'
    }
  },

  // Server/API - Express middleware + Vite dynamic imports
  {
    files: ['server/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn', // Vite dev server APIs son dinámicas
      '@typescript-eslint/no-unsafe-call': 'warn', // Vite ssrLoadModule es dynamic import
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/require-await': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'require-atomic-updates': 'off'
    }
  },

  // Database files - Prisma patterns con require() dinámico
  {
    files: ['app/db.server.ts', 'app/core/**/db/**/*.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/require-await': 'off',
      'no-var': 'off'
    }
  },

  // Helper files - Activity logs y utilidades que interactúan con Prisma
  {
    files: ['app/lib/helpers/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/require-await': 'off'
    }
  },

  // Routes/Loaders - React Router patterns
  {
    files: ['app/routes/**/*.ts', 'app/routes/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/require-await': 'off',
      // React Router 7: throw redirect() / throw data() son el patrón idiomático
      '@typescript-eslint/only-throw-error': 'off',
      // Los tipos de loader/action son inferidos por React Router
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  },

  // Auth UI - priorizar legibilidad sobre micro-optimizaciones
  {
    files: [
      'app/routes/auth/**/*.tsx',
      'app/components/auth/**/*.tsx',
      'app/components/signup/**/*.tsx',
      'app/routes/dashboard/**/*.tsx',
      'app/modules/**/*.tsx'
    ],
    rules: {
      'react-perf/jsx-no-new-function-as-prop': 'off',
      'react-perf/jsx-no-new-object-as-prop': 'off',
      'react-perf/jsx-no-new-array-as-prop': 'off',
      'react-perf/jsx-no-jsx-as-prop': 'off'
    }
  },

  // Lib services - templates y utilidades
  {
    files: ['app/lib/services/**/*.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off'
    }
  },

  // Checkout - Archivo crítico de pagos con estructura compleja
  {
    files: ['app/routes/checkout.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'warn'
    }
  }
)
