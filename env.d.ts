declare namespace NodeJS {
  interface ProcessEnv {
    CLUSTER: 'true' | 'false'
    CRON_ENABLED: 'true' | 'false'
    JOBS: 'true' | 'false'
    VITE_DEV_SERVER: 'true' | 'false'
    BUILD: 'production' | 'development' | 'local'
    PORT: string | number
    FRONTEND_PORT: string | number
    OPENAI_API_KEY: string
    GROQ_API_KEY: string
    OPENROUTER_API_KEY: string
    OPENROUTER_MODEL: string | undefined
    OPENROUTER_MODEL_JSON: string | undefined
    OPENROUTER_MODEL_JSON_FALLBACK: string | undefined
    VERTEX_AI_LOCATION: string | undefined
    GOOGLE_API_KEY: string | undefined
    ENCRYPTION_KEY: string | undefined
    APP_URL: string
    HOST_NAME: string
    HOST_PROTOCOL: string
    HOST_PORT: string | number
    DB_HOST: string
    DB_PORT: string | number
    DB_USER: string
    DB_PASSWORD: string
    DB_NAME: string
    DB_URL: string
    DB_SOCKET_PATH: string | undefined
    DB_POOL_SIZE: string | undefined
    DB_POOL_IDLE_TIMEOUT_MS: string | undefined
    DB_POOL_CONNECTION_TIMEOUT_MS: string | undefined
    DB_POOL_MAX_LIFETIME_SECONDS: string | undefined
    DB_APPLICATION_NAME: string | undefined
    SENTRY_DSN: string
    SENTRY_AUTH_TOKEN: string
    SENTRY_ORG: string
    SENTRY_PROJECT: string
    RESEND_API_KEY: string
    NGROK_TOKEN: string
    NGROK_ENABLED: 'true' | 'false'
    EXCHANGERATE_API_KEY: string
    AWS_S3_ACCESS_KEY_ID: string
    AWS_S3_SECRET_ACCESS_KEY: string
    AWS_SES_ACCESS_KEY_ID: string
    AWS_SES_SECRET_ACCESS_KEY: string
    AWS_REGION: string
    AWS_S3_BUCKET: string
    A55_URL_AUTH: string
    A55_BASE_URL: string
    A55_UUID: string
    A55_API_KEY: string
    A55_API_SECRET: string
    A55_ENVIRONMENT: 'sandbox' | 'production'
    A55_TIMEOUT: string
    A55_WEBHOOK_SECRET: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    GOOGLE_REDIRECT_URI: string
    GOOGLE_CALENDAR_REDIRECT_URI: string
    GCS_PROJECT_ID: string
    GCS_BUCKET_NAME: string
    GCS_CLIENT_EMAIL: string | undefined
    GCS_PRIVATE_KEY: string | undefined
    EMAIL_PROVIDER: 'SMTP' | 'RESEND' | 'SES'
    EMAIL_ENABLE_FALLBACK: 'true' | 'false'
    EMAIL_FALLBACK_PROVIDER: 'SMTP' | 'RESEND' | 'SES'
    DEFAULT_FROM_EMAIL: string
    DEFAULT_FROM_NAME: string
    EMAIL_MAX_RETRIES: string | number
    EMAIL_RETRY_DELAY: string | number
    SMTP_HOST: string
    SMTP_PORT: string | number
    SMTP_USER: string
    SMTP_PASS: string
    SMTP_CLIENT_HOSTNAME: string
    SMTP_SECURE: 'true' | 'false'
    SMTP_REQUIRE_TLS: 'true' | 'false'
    SMTP_CONNECTION_TIMEOUT_MS: string | number
    VAPID_PUBLIC_KEY: string
    VAPID_PRIVATE_KEY: string
    VAPID_EMAIL: string
    GOOGLE_CALENDAR_WEBHOOK_URL: string
    SESSION_SECRET: string
    MEDIA_PROXY_SECRET: string
    CLOUD_TASKS_PROJECT_ID: string
    CLOUD_TASKS_LOCATION: string
    CLOUD_TASKS_QUEUE_CALENDAR_SYNC: string
    CLOUD_TASKS_INVOKER_SA: string
    INTERNAL_TASKS_AUDIENCE: string
    COACH_CUSTOMER_PORTAL_URL: string | undefined
    STRIPE_CUSTOMER_PORTAL_URL: string | undefined
    CUSTOMER_PORTAL_URL: string | undefined
  }
}
