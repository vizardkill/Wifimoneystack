import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { defineConfig, env } from 'prisma/config'

const envFile = dotenv.config()
dotenvExpand.expand(envFile)

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts'
  },
  datasource: {
    url: env('DB_URL')
  }
})
