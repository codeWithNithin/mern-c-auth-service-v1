import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { Config } from '../config/env.js'

const { Pool } = pg

const pool = new Pool({
    connectionString: Config.DATABASE_URL,
})

export const db = drizzle({ client: pool })

export async function connectDB() {
    const client = await pool.connect()

    try {
        await client.query('SELECT 1')
        console.log('PostgreSQL connected')
    } finally {
        client.release()
    }
}
