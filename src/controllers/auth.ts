import type { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import type UserService from '../services/user.js'
import type { Logger } from 'winston'

class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }

        const { firstName, lastName, email, password } = req.body

        this.logger.info('new user register request', {
            firstName,
            lastName,
            email,
            password: '******',
        })

        try {
            const user = await this.userService.createUser({
                firstName,
                lastName,
                email,
                password,
            })

            this.logger.info('user created successfully', { id: user?.id })

            res.status(201).json({ id: user?.id })
        } catch (err) {
            next(err)
        }
    }
}

export default AuthController
