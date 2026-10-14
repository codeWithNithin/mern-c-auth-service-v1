import express, { type Request, type Response } from 'express'
import type { HttpError } from 'http-errors'
import logger from './config/logger.js'
import authRouter from './routes/auth.route.js'
import cookieParser from 'cookie-parser'
import tenantRouter from './routes/tenant.route.js'
import userRouter from './routes/user.route.js'
import cors from 'cors'
import { Config } from './config/env.js'

const app = express()

app.use(
    cors({
        origin: [Config.ADMIN_UI!],
        credentials: true,
    }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public', { dotfiles: 'allow' }))

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)
app.use('/users', userRouter)

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
