import { expressjwt } from 'express-jwt'
import { Config } from '../config/env.js'
import { type Request } from 'express'
import { db } from '../db/index.js'
import { refreshTokens } from '../db/schema.js'
import { and, eq } from 'drizzle-orm'
import type { IRefreshTokenPayload } from '../types/index.js'
import logger from '../config/logger.js'

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies
        return refreshToken
    },
    async isRevoked(req: Request, token) {
        // SELECT * FROM refreshtokens WHERE refreshTokens.id = ? and refreshToken.userId = ?
        try {
            const [refreshToken] = await db
                .select()
                .from(refreshTokens)
                .where(
                    and(
                        eq(
                            refreshTokens.id,
                            Number((token?.payload as IRefreshTokenPayload).id),
                        ),
                        eq(refreshTokens.userId, Number(token?.payload.sub)),
                    ),
                )
                .limit(1)

            return refreshToken === null
        } catch {
            logger.error('Error while getting the refresh token', {
                id: (token?.payload as IRefreshTokenPayload).id,
            })
        }
        return true
    },
})
