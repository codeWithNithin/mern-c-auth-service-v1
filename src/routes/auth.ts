import express from 'express'
import AuthController from '../controllers/auth.js'
import registerValidator from '../validators/register.validator.js'

const authRouter = express.Router()

const authController = new AuthController()

authRouter.post(
    '/register',
    registerValidator,
    authController.register.bind(authController),
)

export default authRouter
