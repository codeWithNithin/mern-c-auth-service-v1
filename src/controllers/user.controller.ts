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

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() })
        }

        try {
            const { firstName, lastName, email, password, role, tenantId } =
                req.body

            this.logger.info('new request to create tenant', {
                firstName,
                lastName,
                email,
                role,
                tenantId,
                password: '******',
            })

            const newUser = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            })

            this.logger.info('created tenant in database', {
                id: newUser?.id,
            })

            res.status(201).json({ id: newUser?.id })
        } catch (err) {
            next(err)
            return
        }
    }

    async find(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.find()
            this.logger.info('found user list in database', { users })
            res.status(200).json(users)
        } catch (err) {
            next(err)
            return
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id)
        try {
            const user = await this.userService.findById(id)

            this.logger.info('found tenant data in database', {
                id: Number(req.params.id),
            })

            res.status(200).json({ user })
        } catch (err) {
            next(err)
            return
        }
    }

    async findByIdAndUpdate(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id)

        try {
            const updatedUser = await this.userService.findByIdAndUpdate(
                id,
                req.body,
            )

            this.logger.info('found tenant list in database', { updatedUser })

            res.status(200).json({ id: updatedUser.id })
        } catch (err) {
            next(err)
            return
        }
    }

    async findByIdAndDelete(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id)

        try {
            const user = await this.userService.findByIdAndDelete(id)
            res.status(200).json({ id: user.id })
        } catch (err) {
            next(err)
            return
        }
    }
}

export default UserController
