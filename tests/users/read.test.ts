import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { sql } from 'drizzle-orm'
import mockJWKS, { type JWKSMock } from 'mock-jwks'
import { tenants, users } from '../../src/db/schema'
import { Roles } from '../../src/constants'
import app from '../../src/app'
import assert from 'node:assert'
import request from 'supertest'

describe('GET /users', () => {
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

    it('should return 200 status code', async () => {
        // ARRANGE
        const [tenant] = await db
            .insert(tenants)
            .values({
                name: 'default name',
                address: 'default address',
            })
            .returning({ id: tenants.id })

        const userData = [
            {
                firstName: 'Rakesh k',
                lastName: 'Singh',
                email: 'nithin@gmail.com',
                password: 'Password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            },
            {
                firstName: 'Rakesh k',
                lastName: 'Singh',
                email: 'nithin1@gmail.com',
                password: 'Password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            },
        ]

        await db.insert(users).values(userData)

        const adminToken = jwks.token({
            sub: 'admin-id',
            role: Roles.ADMIN,
        })

        // ACT
        const response = await request(app)
            .get('/users')
            .set('Cookie', [`accessToken=${adminToken}`])

        // ASSERT
        assert.strictEqual(response.statusCode, 200)
    })

    it('should return all data in response', async () => {
        // ARRANGE
        const [tenant] = await db
            .insert(tenants)
            .values({
                name: 'default name',
                address: 'default address',
            })
            .returning({ id: tenants.id })

        const userData = [
            {
                firstName: 'Rakesh k',
                lastName: 'Singh',
                email: 'nithin@gmail.com',
                password: 'Password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            },
            {
                firstName: 'Rakesh k',
                lastName: 'Singh',
                email: 'nithin1@gmail.com',
                password: 'Password',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            },
        ]

        await db.insert(users).values(userData)

        const adminToken = jwks.token({
            sub: 'admin-id',
            role: Roles.ADMIN,
        })

        // ACT
        const response = await request(app)
            .get('/users')
            .set('Cookie', [`accessToken=${adminToken}`])

        const userList = await db.select().from(users)

        // ASSERT
        assert.strictEqual(response.body.length, userList.length)
    })

    it('should return 401 status code if token is invalid', async () => {
        const response = await request(app).get(`/users`).send()

        const userList = await db.select().from(users)

        assert.strictEqual(userList.length, 0)
        assert.strictEqual(response.statusCode, 401)
    })

    it('should return 403 status code if user is not admin', async () => {
        // ARRANGE
        const token = jwks.token({
            sub: '1',
            role: Roles.MANAGER,
        })

        const response = await request(app)
            .get(`/users`)
            .set('Cookie', [`accessToken=${token}`])
            .send()

        assert.strictEqual(response.statusCode, 403)
    })
})
