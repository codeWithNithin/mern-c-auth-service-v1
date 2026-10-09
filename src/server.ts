import app from './app.js'
import { Config } from './config/env.js'
import logger from './config/logger.js'
import { connectDB } from './db/index.js'

async function startServer() {
    try {
        await connectDB()
        const PORT: number = Number(Config.port)

        app.listen(PORT, () => {
            logger.info('server running at PORT', { port: PORT })
        })
    } catch (err) {
        console.log(err)
        logger.error('err from server', { err: err })
    }
}

startServer()
