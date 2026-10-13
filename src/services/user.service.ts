import createHttpError from 'http-errors'
import type { JwtPayload } from 'jsonwebtoken'
import type UserRepository from '../repositories/user.repository.js'
import type PasswordService from './password.service.js'
import type TokenService from './token.service.js'
import { Roles } from '../constants/index.js'
import type { AuthResult, NewUser, RegisterUserInput } from '../types/index.js'

class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
    ) {}

    async register(userData: RegisterUserInput): Promise<AuthResult> {
        const existingUser = await this.userRepository.findByEmail(
            userData.email,
        )

        if (existingUser) {
            throw createHttpError(400, 'User is already registered')
        }

        const hashedPassword = await this.passwordService.createHashPassword(
            userData.password,
        )

        const user = await this.userRepository.createUser({
            ...userData,
            password: hashedPassword,
            role: Roles.CUSTOMER,
            tenantId: userData?.tenantId ? userData.tenantId : null,
        })

        if (!user) {
            throw createHttpError(500, 'Failed to create user')
        }

        return this.issueTokens(user)
    }

    async login(email: string, password: string): Promise<AuthResult> {
        const user = await this.userRepository.findByEmail(email)

        if (!user) {
            throw createHttpError(400, 'Invalid email or password')
        }

        const isPasswordValid = await this.passwordService.verifyPassword(
            password,
            user.password,
        )

        if (!isPasswordValid) {
            throw createHttpError(400, 'Invalid email or password')
        }

        return this.issueTokens(user)
    }

    async self(id: number) {
        const user = await this.userRepository.findById(id)

        if (!user) {
            throw createHttpError(400, 'user doesnt exist')
        }

        return user
    }

    async refresh(user: { id: number; role: string; tokenId: number }) {
        const existingUser = await this.userRepository.findById(user.id)

        if (!existingUser) {
            throw createHttpError(400, 'user doesnt exist')
        }

        const result = await this.issueTokens(user)

        await this.tokenService.deleteRefreshToken(user.tokenId)

        return result
    }

    async logout(tokenId: number) {
        return await this.tokenService.deleteRefreshToken(tokenId)
    }

    async createAdmin(userData: RegisterUserInput) {
        const existingUser = await this.userRepository.findByEmail(
            userData.email,
        )

        if (existingUser) {
            throw createHttpError(400, 'User is already registered')
        }

        const hashedPassword = await this.passwordService.createHashPassword(
            userData.password,
        )

        const user = await this.userRepository.createUser({
            ...userData,
            password: hashedPassword,
            role: Roles.ADMIN,
        })

        if (!user) {
            throw createHttpError(500, 'Failed to create user')
        }

        return user
    }

    private async issueTokens(user: {
        id: number
        role: string
    }): Promise<AuthResult> {
        const payload: JwtPayload = {
            sub: String(user.id),
            role: user.role,
        }

        const accessToken = this.tokenService.createAccessToken(payload)

        const refreshTokenRecord = await this.tokenService.persistRefreshToken(
            user.id,
        )

        if (!refreshTokenRecord) {
            throw createHttpError(500, 'Failed to persist refresh token')
        }

        const refreshToken = this.tokenService.createRefreshToken({
            ...payload,
            id: refreshTokenRecord.id,
        })

        return { user: { id: user.id }, accessToken, refreshToken }
    }

    async create(userData: NewUser) {
        const existingUser = await this.userRepository.findByEmail(
            userData.email,
        )

        if (existingUser) {
            throw createHttpError(400, 'User is already registered')
        }

        const hashedPassword = await this.passwordService.createHashPassword(
            userData.password,
        )

        const user = await this.userRepository.createUser({
            ...userData,
            password: hashedPassword,
            role: userData.role ? userData.role : Roles.CUSTOMER,
            tenantId: userData?.tenantId ? userData.tenantId : null,
        })

        if (!user) {
            throw createHttpError(500, 'Failed to create user')
        }

        return user
    }

    async find() {
        return await this.userRepository.find()
    }

    async findById(id: number) {
        const tenant = await this.userRepository.findById(id)

        if (!tenant) {
            throw createHttpError(400, 'user does not exists')
        }

        return tenant
    }

    async findByIdAndUpdate(id: number, data: NewUser) {
        const tenant = await this.userRepository.findById(id)

        if (!tenant) {
            throw createHttpError(400, 'user does not exists')
        }

        const updatedTenant = await this.userRepository.update(id, data)

        if (!updatedTenant) {
            throw createHttpError(500, 'Failed to update user data')
        }

        return updatedTenant
    }

    async findByIdAndDelete(id: number) {
        const tenant = await this.userRepository.findById(id)

        if (!tenant) {
            throw createHttpError(400, 'user does not exists')
        }

        const updatedTenant = await this.userRepository.delete(id)

        if (!updatedTenant) {
            throw createHttpError(500, 'Failed to update user data')
        }

        return updatedTenant
    }
}

export default UserService
