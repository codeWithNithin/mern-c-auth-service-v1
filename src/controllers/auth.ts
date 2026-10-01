import type { Request, Response } from 'express'

class AuthController {
    register(req: Request, res: Response) {
        res.status(201).json({ message: 'ROUTE NOT FOUND!!!' })
    }
}

export default AuthController
