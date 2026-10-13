import type { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import type TenantService from '../services/tenant.service.js'
import type { Logger } from 'winston'

class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) {}

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req)

        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() })
        }

        try {
            const { name, address } = req.body

            this.logger.info('new request to create tenant', { name, address })

            const newTenant = await this.tenantService.createTenant({
                name,
                address,
            })

            this.logger.info('created tenant in database', {
                id: newTenant?.id,
            })

            res.status(200).json({ id: newTenant?.id })
        } catch (err) {
            next(err)
            return
        }
    }

    async find(req: Request, res: Response, next: NextFunction) {
        try {
            const tenants = await this.tenantService.findAllTenant()

            this.logger.info('found tenant list in database', { tenants })
            res.status(200).json(tenants)
        } catch (err) {
            next(err)
            return
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id)
        try {
            const tenant = await this.tenantService.findById(id)

            this.logger.info('found tenant data in database', {
                id: Number(req.params.id),
            })

            res.status(200).json({ tenant })
        } catch (err) {
            next(err)
            return
        }
    }

    async findByIdAndUpdate(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id)

        const { name, address } = req.body

        try {
            const updatedTenant = await this.tenantService.findByIdAndUpdate(
                id,
                { name, address },
            )

            this.logger.info('found tenant list in database', { updatedTenant })

            res.status(200).json({ id: updatedTenant.id })
        } catch (err) {
            next(err)
            return
        }
    }

    async findByIdAndDelete(req: Request, res: Response, next: NextFunction) {
        const id = Number(req.params.id)

        try {
            const tenant = await this.tenantService.findByIdAndDelete(id)
            res.status(200).json({ id: tenant.id })
        } catch (err) {
            next(err)
            return
        }
    }
}

export default TenantController
