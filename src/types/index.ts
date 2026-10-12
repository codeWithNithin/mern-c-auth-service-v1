export interface RegisterUserInput {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface NewUser {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
}

export interface AuthResult {
    user: { id: number }
    accessToken: string
    refreshToken: string
}

export interface IRefreshTokenPayload {
    id: string
}
