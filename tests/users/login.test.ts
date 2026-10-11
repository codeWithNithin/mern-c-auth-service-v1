import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { eq, sql } from 'drizzle-orm'
import request from 'supertest'
import bcrypt from 'bcryptjs'

import app from '../../src/app'
import assert from 'node:assert'
import { refreshTokens, users } from '../../src/db/schema'
import { Roles } from '../../src/constants'
import { isValidJWT } from '../../src/utils'

describe('POST /auth/login', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
    })

    after(async () => {
        await pool.end()
    })

    // missing fields
    describe('missing fields', () => {
        it('should return 400 status code if email is missing', async () => {
            // ARRANGE
            const userData = {
                password: 'Password@123',
            }

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            // ASSERT
            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 status code if email is empty', async () => {
            // ARRANGE
            const userData = {
                email: '',
                password: 'Password@123',
            }

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            // ASSERT
            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 status code if email is not valid', async () => {
            // ARRANGE
            const userData = {
                email: 'nithin',
                password: 'Password@123',
            }

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            // ASSERT
            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 status code if password is missing', async () => {
            // ARRANGE
            const userData = {
                email: 'nithin@gmail.com',
            }

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            // ASSERT
            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 status code if password is empty', async () => {
            // ARRANGE
            const userData = {
                email: 'nithin@gmail.com',
                password: '',
            }

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            // ASSERT
            assert.strictEqual(response.statusCode, 400)
        })
    })

    describe('password validation', () => {
        it('should return 400 if password is less than 8 characters', async () => {
            // Arrange
            const userData = {
                email: 'nithin@gmail.com',
                password: 'secret', // 6 characters
            }

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            // Assert
            const userList = await db.select().from(users)

            assert.strictEqual(response.statusCode, 400)
            assert.strictEqual(userList.length, 0)
        })
    })

    describe('given all fields', () => {
        it('should return 200 status code', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10)

            await db.insert(users).values({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            })

            // ACT
            const response = await request(app).post('/auth/login').send({
                email: userData.email,
                password: userData.password,
            })

            // ASSERT
            assert.strictEqual(response.statusCode, 200)
        })

        it('should return valid json', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10)

            await db.insert(users).values({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            })

            // ACT
            const response = await request(app).post('/auth/login').send({
                email: userData.email,
                password: userData.password,
            })

            // ASSERT
            // i dont want this content type header to be undefined
            assert.ok(response.headers['content-type'])
            // i want to match this content type to json
            assert.match(response.headers['content-type'], /json/)
        })

        it('should return 400 if the user not present', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10)

            await db.insert(users).values({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            })

            // ACT
            const response = await request(app).post('/auth/login').send({
                email: 'nithin1@gmail.com',
                password: userData.password,
            })

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if the password is wrong', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10)

            await db.insert(users).values({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            })

            // ACT
            const response = await request(app).post('/auth/login').send({
                email: userData.email,
                password: 'wrong-pass',
            })

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return accessToken and refreshToken in cookie', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V kumar',
                email: 'nithin@gmail.com',
                password: 'secret-password',
            }

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            interface Headers {
                'set-cookie': string[]
            }

            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || []
            let accessToken = null,
                refreshToken = null

            // accessToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjkzOTA5Mjc2LCJleHAiOjE2OTM5MDkzMzYsImlzcyI6Im1lcm5zcGFjZSJ9.KetQMEzY36vxhO6WKwSR-P_feRU1yI-nJtp6RhCEZQTPlQlmVsNTP7mO-qfCdBr0gszxHi9Jd1mqf-hGhfiK8BRA_Zy2CH9xpPTBud_luqLMvfPiz3gYR24jPjDxfZJscdhE_AIL6Uv2fxCKvLba17X0WbefJSy4rtx3ZyLkbnnbelIqu5J5_7lz4aIkHjt-rb_sBaoQ0l8wE5KzyDNy7mGUf7cI_yR8D8VlO7x9llbhvCHF8ts6YSBRBt_e2Mjg5txtfBaDq5auCTXQ2lmnJtMb75t1nAFu8KwQPrDYmwtGZDkHUcpQhlP7R-y3H99YnrWpXbP8Zr_oO67hWnoCSw; Max-Age=43200; Domain=localhost; Path=/; Expires=Tue, 05 Sep 2023 22:21:16 GMT; HttpOnly; SameSite=Strict
            // refreshToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjkzOTA5Mjc2LCJleHAiOjE2OTM5MDkzMzYsImlzcyI6Im1lcm5zcGFjZSJ9.KetQMEzY36vxhO6WKwSR-P_feRU1yI-nJtp6RhCEZQTPlQlmVsNTP7mO-qfCdBr0gszxHi9Jd1mqf-hGhfiK8BRA_Zy2CH9xpPTBud_luqLMvfPiz3gYR24jPjDxfZJscdhE_AIL6Uv2fxCKvLba17X0WbefJSy4rtx3ZyLkbnnbelIqu5J5_7lz4aIkHjt-rb_sBaoQ0l8wE5KzyDNy7mGUf7cI_yR8D8VlO7x9llbhvCHF8ts6YSBRBt_e2Mjg5txtfBaDq5auCTXQ2lmnJtMb75t1nAFu8KwQPrDYmwtGZDkHUcpQhlP7R-y3H99YnrWpXbP8Zr_oO67hWnoCSw; Max-Age=43200; Domain=localhost; Path=/; Expires=Tue, 05 Sep 2023 22:21:16 GMT; HttpOnly; SameSite=Strict
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1]
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1]
                }
            })

            // accesstoken and refreshtoken should not be null
            assert.notStrictEqual(accessToken, null)
            assert.notStrictEqual(refreshToken, null)

            // if both tokens are empty strings then it should not succeed
            assert.ok(accessToken)
            assert.ok(refreshToken)

            // i want jwt token to get validated while converitng it into normal data...
            assert.strictEqual(isValidJWT(accessToken), true)
            assert.strictEqual(isValidJWT(refreshToken), true)
        })

        it('should persist refreshtoken in database', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V kumar',
                email: 'nithin@gmail.com',
                password: 'secret-password',
            }

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // await db.select().from(refreshTokens).innerJoin(users)

            // SELECT * FROM refreshTokens
            // INNER JOIN users
            // ON refreshTokens.userId = response.body.id
            // WHERE refreshtoken.user = 1

            const refreshTokensList = await db
                .select()
                .from(refreshTokens)
                .innerJoin(users, eq(refreshTokens.userId, users.id))
                .where(eq(refreshTokens.userId, response.body.id))

            assert.strictEqual(refreshTokensList.length, 1)
        })
    })
})
