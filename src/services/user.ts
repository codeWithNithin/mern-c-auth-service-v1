import createHttpError from 'http-errors'
import type UserRepository from '../repositories/user.js'
import type { UserData } from '../types/index.js'

class UserService {
    constructor(private userRepository: UserRepository) {}

    async createUser(userData: UserData) {
        const existingUser = await this.userRepository.findByEmail(
            userData.email,
        )

        if (existingUser) {
            const err = createHttpError(400, 'user already exists')
            throw err
        }

        return this.userRepository.createUser(userData)
    }
}

export default UserService
