import express from 'express'
import UserController from '../controllers/user.controller.js'
import UserRepository from '../repositories/user.repository.js'
import { db } from '../db/index.js'
import logger from '../config/logger.js'
import UserService from '../services/user.service.js'
import PasswordService from '../services/password.service.js'
import TokenService from '../services/token.service.js'
import authenticateMiddleware from '../middlewares/authenticate.middleware.js'
import { canAccess } from '../middlewares/canAccess.middleware.js'
import { Roles } from '../constants/index.js'
import { validateTenantId } from '../middlewares/validatId.middleware.js'
import userValidator from '../validators/user.validator.js'

const userRouter = express.Router()

// repositories
const userRepository = new UserRepository(db)

const passwordService = new PasswordService()

const tokenService = new TokenService(db)
const userService = new UserService(
    userRepository,
    passwordService,
    tokenService,
)

const userController = new UserController(userService, logger)

userRouter.post(
    '/create-admin',
    userValidator,
    userController.createAdminUser.bind(userController),
)

userRouter.post(
    '/',
    authenticateMiddleware,
    canAccess([Roles.ADMIN]),
    userController.create.bind(userController),
)

userRouter.get(
    '/',
    authenticateMiddleware,
    canAccess([Roles.ADMIN]),
    userController.find.bind(userController),
)

userRouter.get(
    '/:id',
    authenticateMiddleware,
    canAccess([Roles.ADMIN]),
    validateTenantId,
    userController.findById.bind(userController),
)

userRouter.patch(
    '/:id',
    authenticateMiddleware,
    canAccess([Roles.ADMIN]),
    validateTenantId,
    userController.findByIdAndUpdate.bind(userController),
)

userRouter.delete(
    '/:id',
    authenticateMiddleware,
    canAccess([Roles.ADMIN]),
    validateTenantId,
    userController.findByIdAndDelete.bind(userController),
)

export default userRouter
