import express from 'express'
import AuthController from '../controllers/auth.js'
import registerValidator from '../validators/register.validator.js'
import UserService from '../services/user.js'
import logger from '../config/logger.js'
import UserRepository from '../repositories/user.js'
import { db } from '../db/index.js'

const authRouter = express.Router()

// repositories
const userRepository = new UserRepository(db)

// services
const userService = new UserService(userRepository)

// controllers
const authController = new AuthController(userService, logger)

authRouter.post(
    '/register',
    registerValidator,
    authController.register.bind(authController),
)

export default authRouter
