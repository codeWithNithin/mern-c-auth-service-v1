import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { sql } from 'drizzle-orm'
import app from '../../src/app'
import request from 'supertest'
import mockJWKS, { type JWKSMock } from 'mock-jwks'
import { Roles } from '../../src/constants'
import assert from 'node:assert'
import { tenants } from '../../src/db/schema'

describe('DELETE /tenants/:id', () => {
    let jwks: JWKSMock
    let stopJWKS: () => void

    beforeEach(async () => {
        await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`)
        await db.execute(sql`TRUNCATE TABLE tenants RESTART IDENTITY CASCADE`)
        jwks = mockJWKS.createJWKSMock('http://localhost:5501')
        stopJWKS = jwks.start()
    })

    after(async () => {
        await pool.end()
        stopJWKS()
    })

    it('should return  200 status code', async () => {
        // ARRANGE

        await db.insert(tenants).values({
            name: 'default name',
            address: 'default address',
        })

        const tenantsData = {
            name: 'tenant name',
            address: 'tenant address',
        }

        const id = '1'

        const token = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })

        // ACT
        const response = await request(app)
            .delete(`/tenants/${id}`)
            .set('Cookie', [`accessToken=${token}`])
            .send(tenantsData)

        // ASSERT
        assert.strictEqual(response.statusCode, 200)
    })

    it('should return id in response', async () => {
        const [tenant] = await db
            .insert(tenants)
            .values({
                name: 'default name',
                address: 'default address',
            })
            .returning({ id: tenants.id })

        // ARRANGE
        const token = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })

        const id = tenant.id

        // ACT
        const response = await request(app)
            .delete(`/tenants/${id}`)
            .set('Cookie', [`accessToken=${token}`])
            .send()

        // ASSERT
        assert.strictEqual(response.body.id, id)
    })

    it('should return 403 status code if user is not admin', async () => {
        const [tenant] = await db
            .insert(tenants)
            .values({
                name: 'default name',
                address: 'default address',
            })
            .returning({ id: tenants.id })

        // ARRANGE
        const token = jwks.token({
            sub: '1',
            role: Roles.MANAGER,
        })

        const id = tenant.id

        const response = await request(app)
            .delete(`/tenants/${id}`)
            .set('Cookie', [`accessToken=${token}`])
            .send()

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
            .delete(`/tenants/${id}`)
            .set('Cookie', [`accessToken=${token}`])
            .send()

        // ASSERT
        assert.strictEqual(response.statusCode, 400)
    })

    it('should return 401 status code if token is invalid', async () => {
        const id = '1'

        const response = await request(app).delete(`/tenants/${id}`).send()

        const tenantList = await db.select().from(tenants)

        assert.strictEqual(tenantList.length, 0)
        assert.strictEqual(response.statusCode, 401)
    })
})
