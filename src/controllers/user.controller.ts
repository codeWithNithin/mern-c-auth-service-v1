import type { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import type UserService from '../services/user.service.js'
import type { Logger } from 'winston'

class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async createAdminUser(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() })
        }

        const { firstName, lastName, email, password } = req.body

        try {
            const adminUser = await this.userService.createAdmin({
                firstName,
                lastName,
                email,
                password,
            })

            res.status(200).json({ adminUser })
        } catch (err) {
            next(err)
            return
        }
    }
}

export default UserController
