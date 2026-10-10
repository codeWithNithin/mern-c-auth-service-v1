import type { CookieOptions, NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import type UserService from '../services/user.service.js'
import type { Logger } from 'winston'

class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    private setCookie(res: Response, label: string, token: string) {
        const ACCESS_TOKEN_MAX_AGE = 1000 * 60 * 60 * 1
        const REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 365

        const cookieOptions: CookieOptions = {
            httpOnly: true,
            sameSite: 'strict',
            maxAge:
                label === 'accessToken'
                    ? ACCESS_TOKEN_MAX_AGE
                    : REFRESH_TOKEN_MAX_AGE,
            domain: 'localhost',
        }

        return res.cookie(label, token, cookieOptions)
    }

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
            const result = await this.userService.createUser({
                firstName,
                lastName,
                email,
                password,
            })

            this.logger.info('user created successfully', {
                id: result.user?.id,
            })

            this.setCookie(res, 'accessToken', result.accessToken)
            this.setCookie(res, 'refreshToken', result.refreshToken)

            res.status(201).json({ id: result.user?.id })
        } catch (err) {
            next(err)
        }
    }
}

export default AuthController
