import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { sql } from 'drizzle-orm'
import request from 'supertest'

import app from '../../src/app'
import assert from 'node:assert'
import { users } from '../../src/db/schema'

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
                email: 'nithin',
                password: 'Password@123',
            }

            // ACT
            const response = await request(app)
                .post('/auth/login')
                .send(userData)

            // ASSERT
            assert.strictEqual(response.statusCode, 200)
        })

        it('should return valid json', async () => {
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
            // i dont want this content type header to be undefined
            assert.ok(response.headers['content-type'])
            // i want to match this content type to json
            assert.match(response.headers['content-type'], /json/)
        })
    })
})
