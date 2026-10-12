import express from 'express'
import UserController from '../controllers/user.controller.js'
import registerValidator from '../validators/register.validator.js'
import UserRepository from '../repositories/user.repository.js'
import { db } from '../db/index.js'
import logger from '../config/logger.js'
import UserService from '../services/user.service.js'
import PasswordService from '../services/password.service.js'
import TokenService from '../services/token.service.js'

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
    registerValidator,
    userController.createAdminUser.bind(userController),
)

export default userRouter
