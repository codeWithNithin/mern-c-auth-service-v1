import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { sql } from 'drizzle-orm'
import app from '../../src/app'
import request from 'supertest'
import mockJWKS, { type JWKSMock } from 'mock-jwks'
import { Roles } from '../../src/constants'
import assert from 'node:assert'
import { tenants, users } from '../../src/db/schema'

describe('POST /users', () => {
    let jwks: JWKSMock
    let stopJWKS: () => void

    beforeEach(async () => {
        await db.execute(sql`
        TRUNCATE TABLE users, tenants
        RESTART IDENTITY CASCADE
    `)
        jwks = mockJWKS.createJWKSMock('http://localhost:5501')
        stopJWKS = jwks.start()
    })

    after(async () => {
        await pool.end()
        stopJWKS()
    })

    describe('fields are missing', () => {
        it('should return 400 if first name is missing', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                lastName: 'Singh',
                email: 'rakesh@mern.space',
                password: 'password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if first name is empaty', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: '',
                lastName: 'Singh',
                email: 'rakesh@mern.space',
                password: 'password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if last name is missing', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                email: 'rakesh@mern.space',
                password: 'password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if last name is empaty', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: '',
                email: 'rakesh@mern.space',
                password: 'password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if email is missing', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'Singh',
                password: 'password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if email is empaty', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: '',
                password: 'password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if email is not valid', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: 'nithin',
                password: 'password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if password is missing', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: '',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if passsword is empty', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: 'nithin',
                password: '',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if role is missing', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: '',
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if role is empty', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: 'nithin',
                password: 'Password@123',
                role: '',
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })
    })

    describe('all fields are given', () => {
        it('should return 201 status code', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 201)
        })

        it('should persist users in database', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            const usersList = await db.select().from(users)

            assert.strictEqual(usersList.length, 1)
            assert.strictEqual(usersList[0].firstName, userData.firstName)
            assert.strictEqual(usersList[0].lastName, userData.lastName)
            assert.strictEqual(usersList[0].email, userData.email)
            assert.strictEqual(usersList[0].role, userData.role)
        })

        it('should return 400 status code if user already exists', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            await db.insert(users).values(userData).returning({ id: users.id })

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return user id in response', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${token}`])
                .send(userData)

            assert.ok('id' in response.body)
        })

        it('should return 403 status code if user is not admin', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            })

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(userData)

            assert.strictEqual(response.statusCode, 403)
        })

        it('should return 401 status code if token is invalid', async () => {
            const [tenant] = await db
                .insert(tenants)
                .values({
                    name: 'default name',
                    address: 'default address',
                })
                .returning({ id: tenants.id })

            const userData = {
                firstName: 'Rakesh',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }
            const response = await request(app).post(`/users`).send(userData)

            const userList = await db.select().from(users)

            assert.strictEqual(userList.length, 0)
            assert.strictEqual(response.statusCode, 401)
        })
    })
})
