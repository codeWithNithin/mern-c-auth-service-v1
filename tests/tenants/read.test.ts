import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { sql } from 'drizzle-orm'
import mockJWKS, { type JWKSMock } from 'mock-jwks'
import { tenants } from '../../src/db/schema'
import { Roles } from '../../src/constants'
import app from '../../src/app'
import assert from 'node:assert'
import request from 'supertest'

describe('GET /tenants', () => {
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

    it('should return 200 status code', async () => {
        // ARRANGE
        const tenantData = [
            { name: 'Tenant A', address: 'Address A' },
            { name: 'Tenant B', address: 'Address B' },
        ]

        await db.insert(tenants).values(tenantData)

        const adminToken = jwks.token({
            sub: 'admin-id',
            role: Roles.ADMIN,
        })

        // ACT
        const response = await request(app)
            .get('/tenants')
            .set('Cookie', [`accessToken=${adminToken}`])

        // ASSERT
        assert.strictEqual(response.statusCode, 200)
    })

    it('should return all data in response', async () => {
        // ARRANGE
        const tenantData = [
            { name: 'Tenant A', address: 'Address A' },
            { name: 'Tenant B', address: 'Address B' },
        ]

        await db.insert(tenants).values(tenantData)

        const adminToken = jwks.token({
            sub: 'admin-id',
            role: Roles.ADMIN,
        })

        // ACT
        const response = await request(app)
            .get('/tenants')
            .set('Cookie', [`accessToken=${adminToken}`])

        const tenantsList = await db.select().from(tenants)

        // ASSERT
        assert.strictEqual(response.body.length, tenantsList.length)
    })
})
