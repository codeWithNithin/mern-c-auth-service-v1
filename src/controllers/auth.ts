import type { Request, Response } from 'express'
import { validationResult } from 'express-validator'

class AuthController {
    register(req: Request, res: Response) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }

        res.status(201).json({ message: 'ROUTE NOT FOUND!!!' })
    }
}

export default AuthController
