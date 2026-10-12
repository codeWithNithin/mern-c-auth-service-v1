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
            const result = await this.userService.register({
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

    async login(req: Request, res: Response, next: NextFunction) {
        // 1. validate the incoming request
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }

        const { email, password } = req.body

        this.logger.info('new user login request', {
            email,
            password: '******',
        })

        try {
            // 2. check if user exists
            const { user, accessToken, refreshToken } =
                await this.userService.login(email, password)

            // 5. send access token and refresh token in cookie
            this.setCookie(res, 'accessToken', accessToken)
            this.setCookie(res, 'refreshToken', refreshToken)

            this.logger.info('user logged in successfully', {
                id: user.id,
            })

            // 6. in response only send user id
            res.status(200).json({ id: user.id })
        } catch (err) {
            next(err)
            return
        }
    }

    async self(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.auth?.sub)

            const user = await this.userService.self(userId)

            res.status(200).json({ ...user })
        } catch (err) {
            next(err)
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        // 1, i check if its valid or not and if its not valid

        try {
            const authInfo = {
                id: Number(req.auth!.sub),
                role: req.auth!.role,
                tokenId: Number(req.auth!.id),
            }

            const { user, accessToken, refreshToken } =
                await this.userService.refresh(authInfo)

            this.setCookie(res, 'accessToken', accessToken)
            this.setCookie(res, 'refreshToken', refreshToken)

            res.status(200).json({ id: user.id })
        } catch (err) {
            next(err)
        }

        // 2. delete the refresh token
        // 3. persist the new token
        // 4. s
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            await this.userService.logout(Number(req.auth?.id))

            this.logger.info('Refresh token has been deleted', {
                id: req.auth?.id,
            })

            res.clearCookie('accessToken').clearCookie('refreshToken')

            res.status(200).json({ message: 'logged out successfully !!!' })
        } catch (err) {
            next(err)
        }
    }
}

export default AuthController
