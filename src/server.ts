import app from './app.js'
import { Config } from './config/env.js'
import logger from './config/logger.js'

function startServer(): void {
    try {
        const PORT: number = Number(Config.port)

        app.listen(PORT, () => {
            logger.info('server running at PORT', { port: PORT })
        })
    } catch (err) {
        logger.error('err from server', { err: err })
    }
}

startServer()
