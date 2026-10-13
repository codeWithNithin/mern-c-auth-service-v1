import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { eq, sql } from 'drizzle-orm'
import app from '../../src/app'
import request from 'supertest'
import mockJWKS, { type JWKSMock } from 'mock-jwks'
import { Roles } from '../../src/constants'
import assert from 'node:assert'
import { tenants, users } from '../../src/db/schema'

describe('GET /users:/id', () => {
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

    it('should  return 200 status code', async () => {
        // Save an initial tenant

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

        const [user] = await db
            .insert(users)
            .values(userData)
            .returning({ id: tenants.id })

        const token = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })

        const response = await request(app)
            .get(`/users/${user.id}`) // make sure your route accepts /:id
            .set('Cookie', [`accessToken=${token}`])

        assert.strictEqual(response.statusCode, 200)
    })

    it('should get the tenant from the database', async () => {
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

        const [user] = await db
            .insert(users)
            .values(userData)
            .returning({ id: tenants.id })

        const token = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })

        await request(app)
            .get(`/users/${user.id}`) // make sure your route accepts /:id
            .set('Cookie', [`accessToken=${token}`])

        const [foundUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1)

        assert.ok('id' in foundUser)
        assert.ok('firstName' in foundUser)
        assert.ok('lastName' in foundUser)
        assert.ok('email' in foundUser)
        assert.ok('role' in foundUser)
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

        const [user] = await db
            .insert(users)
            .values(userData)
            .returning({ id: tenants.id })

        // ARRANGE
        const token = jwks.token({
            sub: '1',
            role: Roles.MANAGER,
        })

        const response = await request(app)
            .get(`/users/${user.id}`) // make sure your route accepts /:id
            .set('Cookie', [`accessToken=${token}`])

        assert.strictEqual(response.statusCode, 403)
    })

    it('should return 400 if id is invalid', async () => {
        const token = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })

        const id = 3

        // ACT
        const response = await request(app)
            .get(`/users/${id}`)
            .set('Cookie', [`accessToken=${token}`])
            .send()

        // ASSERT
        assert.strictEqual(response.statusCode, 400)
    })

    it('should return 401 status code if token is invalid', async () => {
        const id = '1'

        const response = await request(app).get(`/users/${id}`).send()

        const userList = await db.select().from(users)

        assert.strictEqual(userList.length, 0)
        assert.strictEqual(response.statusCode, 401)
    })
})
