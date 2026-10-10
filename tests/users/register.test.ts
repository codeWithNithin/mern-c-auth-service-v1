import { after, beforeEach, describe, it } from 'node:test'
import request from 'supertest'
import app from '../../src/app.js'
import assert from 'node:assert'

import { sql } from 'drizzle-orm'

import { db, pool } from '../../src/db/index.js'
import { users } from '../../src/db/schema.js'
import { Roles } from '../../src/constants'
import { isValidJWT } from '../../src/utils'

describe('POST /auth/register', () => {
    beforeEach(async () => {
        await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
    })

    after(async () => {
        await pool.end()
    })

    describe('fields missing', () => {
        it('should return 400 if firstName is missing', async () => {
            // Arrange
            const userData = {
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if firstName is empty', async () => {
            // Arrange
            const userData = {
                firstName: '',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userList = await db.select().from(users)

            assert.strictEqual(userList.length, 0)
            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if lastName is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if lastName is empty', async () => {
            // Arrange
            const userData = {
                firstName: 'Nihtin',
                lastName: '',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userList = await db.select().from(users)

            assert.strictEqual(userList.length, 0)
            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if email is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if email is empty', async () => {
            // Arrange
            const userData = {
                firstName: 'Nihtin',
                lastName: 'V Kumar',
                email: '',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userList = await db.select().from(users)

            assert.strictEqual(userList.length, 0)
            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if email is not valid', async () => {
            // Arrange
            const userData = {
                firstName: 'Nihtin',
                lastName: 'V Kumar',
                email: 'nithingmail.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userList = await db.select().from(users)

            assert.strictEqual(userList.length, 0)
            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if password is missing', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'nithin@gmail.com',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if password is empty', async () => {
            // Arrange
            const userData = {
                firstName: 'Nihtin',
                lastName: 'V Kumar',
                email: 'nithin@gmail.com',
                password: '',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userList = await db.select().from(users)

            assert.strictEqual(userList.length, 0)
            assert.strictEqual(response.statusCode, 400)
        })
    })

    describe('password validation', () => {
        it('should return 400 if password is less than 8 characters', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'nithin@gmail.com',
                password: 'secret', // 6 characters
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert
            const userList = await db.select().from(users)

            assert.strictEqual(response.statusCode, 400)
            assert.strictEqual(userList.length, 0)
        })
    })

    describe('field trimming', () => {
        it('should trim firstName, if there are space at starting and ending', async () => {
            // Arrange
            const userData = {
                firstName: ' Nithin ',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act

            await request(app).post('/auth/register').send(userData)

            const userList = await db.select().from(users)
            assert.strictEqual(userList[0]?.firstName, 'Nithin')
        })

        it('should trim lastName, if there are space at starting and ending', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: ' V Kumar ',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // ACT

            await request(app).post('/auth/register').send(userData)

            const userList = await db.select().from(users)

            // ASSERT
            assert.strictEqual(userList[0]?.lastName, 'V Kumar')
        })
    })

    describe('all fields are given', () => {
        it('should return 201 status code', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // assert
            assert.strictEqual(response.statusCode, 201)
        })

        it('should return a valid json response', async () => {
            // AAA

            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            // Assert
            // i dont want this content type header to be undefined
            assert.ok(response.headers['content-type'])
            // i want to match this content type to json
            assert.match(response.headers['content-type'], /json/)
        })

        it('should persist user in database', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            await request(app).post('/auth/register').send(userData)

            const userList = await db.select().from(users)
            // check if in database, we store the user or user cocunt is 1 or not
            assert.strictEqual(userList.length, 1)
        })

        it('should return user id in response', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userList = await db.select().from(users)

            assert.strictEqual(response.body.id, userList[0]?.id)
        })

        it('should return 400 if user already exists', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: 'V Kumar',
                email: 'something@something.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // inserting the db insert first before making request to get the 400 status code..
            await db.insert(users).values({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
                role: Roles.CUSTOMER,
            })

            // Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const userList = await db.select().from(users)

            assert.strictEqual(response.statusCode, 400)
            assert.strictEqual(userList.length, 1)
        })

        it('should assign a customer role', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V kumar',
                email: 'nithin@gmail.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // ACT
            await request(app).post('/auth/register').send(userData)

            const userList = await db.select().from(users)
            // ASSERT

            // check if the role exists
            assert.ok('role' in userList[0])

            // and check that role field contains only customer value
            assert.strictEqual(userList[0]?.role, Roles.CUSTOMER)
        })

        it('should have password hashed', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V kumar',
                email: 'nithin@gmail.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // ACT
            await request(app).post('/auth/register').send(userData)

            const userList = await db.select().from(users)
            // ASSERT

            // check if its length is 60
            // confirm that the incoming request and response password wont be same...
            assert.notStrictEqual(userList[0].password, userData.password)
            assert.strictEqual(userList[0]?.password.length, 60)
            // check that we have hashed the password with the regex...
            assert.match(userList[0].password, /^\$2[ab]\$\d+\$/)
        })

        it('should never return password in response', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V kumar',
                email: 'nithin@gmail.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
            }

            // ACT
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            assert.strictEqual('password' in response.body, false)
        })

        it('should return accessToken and refreshToken in cookie', async () => {
            // ARRANGE
            const userData = {
                firstName: 'Nithin',
                lastName: 'V kumar',
                email: 'nithin@gmail.com',
                password: 'secret-password',
                role: Roles.CUSTOMER,
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
            let accessToken = '',
                refreshToken = ''

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

            // i want jwt token to get validated while converitng it into normal data...
            assert.strictEqual(isValidJWT(accessToken), true)
            assert.strictEqual(isValidJWT(refreshToken), true)
        })
    })
})
