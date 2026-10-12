export interface RegisterUserInput {
    firstName: string
    lastName: string
    email: string
    password: string
    tenantId?: number | null
}

export interface NewUser {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
    tenantId?: number | null
}

export interface AuthResult {
    user: { id: number }
    accessToken: string
    refreshToken: string
}

export interface IRefreshTokenPayload {
    id: string
}

export interface TenantUserInput {
    name: string
    address: string
}
