import { defineConfig } from 'drizzle-kit'
import { Config } from './src/config/env.js'

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle/migrations/',
    dialect: 'postgresql',
    dbCredentials: {
        // url: 'postgresql://root:root@localhost:5433/mern-auth-service-v1-test',
        url: Config.DATABASE_URL!,
    },
})
