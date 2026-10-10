import createHttpError from 'http-errors'
import type UserRepository from '../repositories/user.repository.js'
import type { RegisterUserInput } from '../types/index.js'
import type CredentialService from './password.service.js'
import { Roles } from '../constants/index.js'

class UserService {
    constructor(
        private userRepository: UserRepository,
        private credentialService: CredentialService,
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

        return this.userRepository.createUser({
            ...userData,
            password: hashedPassword,
            role: Roles.CUSTOMER,
        })
    }
}

export default UserService
