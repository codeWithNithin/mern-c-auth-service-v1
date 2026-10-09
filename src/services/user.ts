import type UserRepository from '../repositories/user.js'
import type { UserData } from '../types/index.js'

class UserService {
    constructor(private userRepository: UserRepository) {}

    async createUser(userData: UserData) {
        return this.userRepository.createUser(userData)
    }
}

export default UserService
