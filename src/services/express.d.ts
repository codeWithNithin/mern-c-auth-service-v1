import 'express'

declare global {
    namespace Express {
        interface Request {
            auth?: {
                sub: string
                id?: string
                role: string
            }
        }
    }
}
