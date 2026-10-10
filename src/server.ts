import app from './app.js'
import { Config } from './config/env.js'
import logger from './config/logger.js'
import { connectDB } from './db/index.js'
import TokenService from './services/token.service.js'

async function startServer() {
    try {
        await connectDB()

        const PORT: number = Number(Config.port)

        const tokenService = new TokenService()
        tokenService.initialize()

        app.listen(PORT, () => {
            logger.info('server running at PORT', { port: PORT })
        })
    } catch (err) {
        logger.error('err from server', { err })
    }
}

startServer()
