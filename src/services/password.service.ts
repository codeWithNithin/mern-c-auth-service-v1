import bcrypt from 'bcryptjs'

class PasswordService {
    async createHashPassword(userPassword: string) {
        return await bcrypt.hash(userPassword, 10)
    }

    async verifyPassword(userPassword: string, hashedPassword: string) {
        return await bcrypt.compare(userPassword, hashedPassword)
    }
}

export default PasswordService
