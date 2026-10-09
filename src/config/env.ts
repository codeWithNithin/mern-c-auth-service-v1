import dotenv from 'dotenv'

dotenv.config({ path: `./.env.${process.env.NODE_ENV || 'dev'}` })

const { NODE_ENV, PORT, DATABASE_URL } = process.env

export const Config = {
    port: PORT || 3000,
    NODE_ENV: NODE_ENV || 'dev',
    DATABASE_URL,
}
