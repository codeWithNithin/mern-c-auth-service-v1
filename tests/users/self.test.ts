import { after, beforeEach, describe, it } from 'node:test'
import assert from 'node:assert'
import { sql } from 'drizzle-orm'
import mockJWKS, { type JWKSMock } from 'mock-jwks'
import { Roles } from '../../src/constants/index.js'
import request from 'supertest'

import { db, pool } from '../../src/db/index.js'
import app from '../../src/app.js'

import bcrypt from 'bcryptjs'
import { users } from '../../src/db/schema.js'

describe('GET /auth/self', () => {
    let jwks: JWKSMock
    let stopJWKS: () => void

    beforeEach(async () => {
        await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
        jwks = mockJWKS.createJWKSMock('http://localhost:5501')
        stopJWKS = jwks.start()
    })

    after(async () => {
        await pool.end()
        stopJWKS()
    })

    describe('fields are given', () => {
        it('should return 200 status code', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10)

            const [user] = await db
                .insert(users)
                .values({
                    ...userData,
                    password: hashedPassword,
                    role: Roles.CUSTOMER,
                })
                .returning()

            // create a mock token
            const token = jwks.token({
                sub: String(user.id),
                role: user.role,
            })

            // ACT
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${token};`])
                .send()

            assert.strictEqual(response.statusCode, 200)
        })

        it('should return 400 status code if token valid but user not present', async () => {
            // ARRANGE
            const token = jwks.token({
                sub: '5',
                role: Roles.CUSTOMER,
            })

            // ACT
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${token};`])
                .send()

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return user data', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10)

            const [user] = await db
                .insert(users)
                .values({
                    ...userData,
                    password: hashedPassword,
                    role: Roles.CUSTOMER,
                })
                .returning()

            // create a mock token
            const token = jwks.token({
                sub: String(user.id),
                role: user.role,
            })

            // set cookie to response
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${token};`])
                .send()

            // check if registered user is same as in the response.
            assert.strictEqual(response.body.id, user.id)
            assert.strictEqual(response.body.firstName, user.firstName)
            assert.strictEqual(response.body.lastName, user.lastName)
            assert.strictEqual(response.body.email, user.email)
            assert.strictEqual(response.body.role, user.role)
        })

        it('should return not return  password in response data', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10)

            const [user] = await db
                .insert(users)
                .values({
                    ...userData,
                    password: hashedPassword,
                    role: Roles.CUSTOMER,
                })
                .returning()

            // create a mock token
            const token = jwks.token({
                sub: String(user.id),
                role: user.role,
            })

            // set cookie to response
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${token};`])
                .send()

            // check if registered user is same as in the response.
            assert.ok(!('password' in response.body))
        })
    })
})
