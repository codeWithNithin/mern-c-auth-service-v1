import createHttpError from 'http-errors'
import type UserRepository from '../repositories/user.repository.js'
import type { RegisterUserInput } from '../types/index.js'
import type CredentialService from './password.service.js'
import { Roles } from '../constants/index.js'
import type TokenService from './token.service.js'
import type { JwtPayload } from 'jsonwebtoken'

class UserService {
    constructor(
        private userRepository: UserRepository,
        private credentialService: CredentialService,
        private tokenService: TokenService,
    ) {}

    async createUser(userData: RegisterUserInput) {
        const existingUser = await this.userRepository.findByEmail(
            userData.email,
        )

        if (existingUser) {
            const err = createHttpError(400, 'user already exists')
            throw err
        }

        const hashedPassword = await this.credentialService.createHashPassword(
            userData.password,
        )

        const user = await this.userRepository.createUser({
            ...userData,
            password: hashedPassword,
            role: Roles.CUSTOMER,
        })

        const payload: JwtPayload = {
            sub: String(user?.id),
            role: user?.role,
        }

        const accessToken = this.tokenService.createAccessToken(payload)
        const refreshToken = this.tokenService.createAccessToken(payload)

        return {
            user,
            accessToken,
            refreshToken,
        }
    }
}

export default UserService
