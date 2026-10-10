import express, { type Request, type Response } from 'express'
import type { HttpError } from 'http-errors'
import logger from './config/logger.js'
import authRouter from './routes/auth.route.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/auth', authRouter)

app.use((err: HttpError, req: Request, res: Response) => {
    logger.error('error in global err handler', err.message)
    const statusCode = err.statusCode || 500

    res.status(statusCode).json({
        errors: [
            {
                message: err.message,
                type: err.name,
                path: '',
                location: '',
            },
        ],
    })
})

export default app
