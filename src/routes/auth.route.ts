import express from 'express'
import AuthController from '../controllers/auth.controller.js'
import registerValidator from '../validators/register.validator.js'
import UserService from '../services/user.service.js'
import logger from '../config/logger.js'
import UserRepository from '../repositories/user.repository.js'
import { db } from '../db/index.js'
import PasswordService from '../services/password.service.js'
import TokenService from '../services/token.service.js'
import loginValidator from '../validators/login.validator.js'
import authenticateMiddleware from '../middlewares/authenticate.middleware.js'
import verifyRefreshTokenMiddleare from '../middlewares/verify-refreshToken.middleare.js'

const authRouter = express.Router()

// repositories
const userRepository = new UserRepository(db)

// services
const passwordService = new PasswordService()
const tokenService = new TokenService(db)
const userService = new UserService(
    userRepository,
    passwordService,
    tokenService,
)

// controllers
const authController = new AuthController(userService, logger)

authRouter.post(
    '/register',
    registerValidator,
    authController.register.bind(authController),
)

authRouter.post(
    '/login',
    loginValidator,
    authController.login.bind(authController),
)

authRouter.get(
    '/self',
    authenticateMiddleware,
    authController.self.bind(authController),
)

authRouter.get(
    '/refresh',
    verifyRefreshTokenMiddleare,
    authController.refresh.bind(authController),
)

export default authRouter
