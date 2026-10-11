import { expressjwt, type GetVerificationKey } from 'express-jwt'
import jwksClient from 'jwks-rsa'
import { type Request } from 'express'
import { Config } from '../config/env.js'

// this middleware responsible for verifying access token...
export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!, // the public api
        cache: true, // for every request, we should not fetch the token,
        rateLimit: true, // limiting number of requests
    }) as GetVerificationKey,
    algorithms: ['RS256'],
    getToken(req: Request) {
        const authHeaders = req.headers.authorization
        if (authHeaders && authHeaders.split('')[1] != 'undefined') {
            return authHeaders.split(' ')[1]
        }

        const { accessToken } = req.cookies
        return accessToken
    },
})
