import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { Config } from '../config/env.js'
import logger from '../config/logger.js'

const { Pool } = pg

const pool = new Pool({
    connectionString: Config.DATABASE_URL,
})

export const db = drizzle({ client: pool })

export async function connectDB() {
    let client

    try {
        client = await pool.connect()
        logger.info('Database connected successfully')
    } catch (error) {
        logger.error('Database connection failed', { error })
        throw error
    } finally {
        client?.release()
    }
}
