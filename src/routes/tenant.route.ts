import express from 'express'
import TenantController from '../controllers/tenant.controller.js'
import authenticateMiddleware from '../middlewares/authenticate.middleware.js'
import { canAccess } from '../middlewares/canAccess.middleware.js'
import { Roles } from '../constants/index.js'
import tenantValidator from '../validators/tenant.validator.js'
import TenantService from '../services/tenant.service.js'
import TenantRepository from '../repositories/tenant.repository.js'
import { db } from '../db/index.js'
import logger from '../config/logger.js'
import { validateTenantId } from '../middlewares/validatId.middleware.js'

const tenantRouter = express.Router()

const tenantRepository = new TenantRepository(db)

const tenantService = new TenantService(tenantRepository)

const tenantController = new TenantController(tenantService, logger)

tenantRouter.post(
    '/',
    authenticateMiddleware,
    canAccess([Roles.ADMIN]),
    tenantValidator,
    tenantController.create.bind(tenantController),
)

tenantRouter.get('/', tenantController.find.bind(tenantController))

tenantRouter.get(
    '/:id',
    authenticateMiddleware,
    canAccess([Roles.ADMIN]),
    validateTenantId,
    tenantController.findById.bind(tenantController),
)

tenantRouter.patch(
    '/:id',
    authenticateMiddleware,
    canAccess([Roles.ADMIN]),
    validateTenantId,
    tenantController.findByIdAndUpdate.bind(tenantController),
)

tenantRouter.delete(
    '/:id',
    authenticateMiddleware,
    canAccess([Roles.ADMIN]),
    validateTenantId,
    tenantController.findByIdAndDelete.bind(tenantController),
)

export default tenantRouter
