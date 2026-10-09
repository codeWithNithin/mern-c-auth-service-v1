import { defineConfig } from 'drizzle-kit'
import { Config } from './src/config/env.js'

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: Config.DATABASE_URL!,
    },
})
