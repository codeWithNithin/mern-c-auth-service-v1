import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { sql } from 'drizzle-orm'
import request from 'supertest'

import app from '../../src/app'
import assert from 'node:assert'

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
    })

    it('should return 400 status code if email is missing', async () => {
        // ARRANGE
        const userData = {
            email: '',
            password: 'Password@123',
        }

        // ACT
        const response = await request(app).post('/auth/login').send(userData)

        // ASSERT
        assert.strictEqual(response.statusCode, 400)
    })
})
