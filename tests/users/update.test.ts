import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { sql } from 'drizzle-orm'
import app from '../../src/app'
import request from 'supertest'
import mockJWKS, { type JWKSMock } from 'mock-jwks'
import { Roles } from '../../src/constants'
import assert from 'node:assert'
import { tenants, users } from '../../src/db/schema'

describe('PATCH /users/:id', () => {
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

    it('should return  200 status code', async () => {
        // ARRANGE

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

        const id = user.id

        const token = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })

        // ACT
        const response = await request(app)
            .patch(`/users/${id}`)
            .set('Cookie', [`accessToken=${token}`])
            .send({
                firstName: 'yuvraj',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            })

        // ASSERT
        assert.strictEqual(response.statusCode, 200)
    })

    it('should update a user in database', async () => {
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
            .returning({ id: users.id })

        const id = user.id

        const token = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })

        // ACT
        const response = await request(app)
            .patch(`/users/${id}`)
            .set('Cookie', [`accessToken=${token}`])
            .send({
                firstName: 'yuvraj',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            })

        // ASSERT
        assert.strictEqual(response.body.id, 1)
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
            .returning({ id: users.id })

        const id = user.id

        const token = jwks.token({
            sub: '1',
            role: Roles.MANAGER,
        })

        // ACT
        const response = await request(app)
            .patch(`/users/${id}`)
            .set('Cookie', [`accessToken=${token}`])
            .send({
                firstName: 'yuvraj',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            })

        assert.strictEqual(response.statusCode, 403)
    })

    it('should return 400 if id is invalid', async () => {
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

        const id = 3

        const token = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })

        // ACT
        const response = await request(app)
            .patch(`/users/${id}`)
            .set('Cookie', [`accessToken=${token}`])
            .send({
                firstName: 'yuvraj',
                lastName: 'singh',
                email: 'nithin@gmail.com',
                password: 'Password@123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            })

        // ASSERT
        assert.strictEqual(response.statusCode, 400)
    })

    it('should return 401 status code if token is invalid', async () => {
        const id = '1'

        const response = await request(app).patch(`/users/${id}`).send()

        const usersList = await db.select().from(users)

        assert.strictEqual(usersList.length, 0)
        assert.strictEqual(response.statusCode, 401)
    })
})
