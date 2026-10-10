import jwt, { type JwtPayload } from 'jsonwebtoken'
import { Config } from '../config/env.js'
import fs from 'fs'
import { fileURLToPath } from 'node:url'
import createHttpError from 'http-errors'

class TokenService {
    private accessTokenSecret: string | undefined
    private refreshTokenSecret: string | undefined

    private loadSecrets(): {
        accessTokenSecret: string
        refreshTokenSecret: string
    } {
        if (!this.accessTokenSecret) {
            try {
                this.accessTokenSecret = fs.readFileSync(
                    fileURLToPath(
                        new URL('../../certs/private.pem', import.meta.url),
                    ),
                    'utf8',
                )
            } catch (err) {
                throw createHttpError(500, 'Failed to load signing key', {
                    cause: err,
                })
            }
        }

        this.refreshTokenSecret ??= Config.REFRESH_TOKEN_SECRET

        if (!this.accessTokenSecret.trim()) {
            throw createHttpError(500, 'Private key is empty')
        }

        if (!this.refreshTokenSecret?.trim()) {
            throw createHttpError(500, 'Refresh token secret is not configured')
        }

        return {
            accessTokenSecret: this.accessTokenSecret,
            refreshTokenSecret: this.refreshTokenSecret,
        }
    }

    initialize(): void {
        this.loadSecrets()
    }

    createAccessToken(payload: JwtPayload): string {
        const { accessTokenSecret } = this.loadSecrets()

        return jwt.sign(payload, accessTokenSecret, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        })
    }

    createRefreshToken(payload: JwtPayload): string {
        const { refreshTokenSecret } = this.loadSecrets()

        return jwt.sign(payload, refreshTokenSecret, {
            algorithm: 'HS256',
            expiresIn: '7d',
            issuer: 'auth-service',
        })
    }
}

export default TokenService
