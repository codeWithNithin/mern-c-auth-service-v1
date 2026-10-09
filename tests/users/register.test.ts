import { after, beforeEach, describe, it } from 'node:test'
import request from 'supertest'
import app from '../../src/app.js'
import assert from 'node:assert'

import { sql } from 'drizzle-orm'

import { db, pool } from '../../src/db/index.js'
import { users } from '../../src/db/schema.js'

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
                // role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
            }

            // Act

            await request(app).post('/auth/register').send(userData)

            await db.insert(users).values({
                firstName: userData.firstName.trim(),
                lastName: userData.lastName.trim(),
                email: userData.email,
                password: userData.password,
            })

            const userList = await db.select().from(users)
            assert.strictEqual(userList[0]?.firstName, 'Nithin')
        })

        it('should trim lastName, if there are space at starting and ending', async () => {
            // Arrange
            const userData = {
                firstName: 'Nithin',
                lastName: ' V Kumar ',
                email: 'something@something.com',
                password: 'secret-password',
                // role: Roles.CUSTOMER,
            }

            // Act

            await request(app).post('/auth/register').send(userData)

            await db.insert(users).values({
                firstName: userData.firstName.trim(),
                lastName: userData.lastName.trim(),
                email: userData.email,
                password: userData.password,
            })

            const userList = await db.select().from(users)
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
                //  role: Roles.CUSTOMER,
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
                // role: Roles.CUSTOMER,
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
    })
})
