import { after, beforeEach, describe, it } from 'node:test'
import { db, pool } from '../../src/db'
import { sql } from 'drizzle-orm'
import app from '../../src/app'
import request from 'supertest'
import mockJWKS, { type JWKSMock } from 'mock-jwks'
import { Roles } from '../../src/constants'
import assert from 'node:assert'
import { tenants } from '../../src/db/schema'

describe('POST /tenants', () => {
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

    describe('fields are missing', () => {
        it('should return 400 if tenant name is missing', async () => {
            const tenantsData = {
                address: 'tenant address',
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${token}`])
                .send(tenantsData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if tenant name is empaty', async () => {
            const tenantsData = {
                name: '',
                address: 'tenant address',
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${token}`])
                .send(tenantsData)

            assert.strictEqual(response.statusCode, 400)
        })
        it('should return 400 if tenant address is missing', async () => {
            const tenantsData = {
                name: 'tenant 1',
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${token}`])
                .send(tenantsData)

            assert.strictEqual(response.statusCode, 400)
        })

        it('should return 400 if tenant address is empty', async () => {
            const tenantsData = {
                name: 'tenant 1',
                address: '',
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${token}`])
                .send(tenantsData)

            assert.strictEqual(response.statusCode, 400)
        })
    })

    describe('all fields are given', () => {
        it('should return 201 status code', async () => {
            const tenantsData = {
                name: 'tenant name',
                address: 'tenant address',
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${token}`])
                .send(tenantsData)

            assert.strictEqual(response.statusCode, 201)
        })

        it('should persist tenant in database', async () => {
            const tenantsData = {
                name: 'tenant name',
                address: 'tenant address',
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${token}`])
                .send(tenantsData)

            const tenantList = await db.select().from(tenants)

            assert.strictEqual(tenantList.length, 1)
            assert.strictEqual(tenantList[0].name, tenantsData.name)
            assert.strictEqual(tenantList[0].address, tenantsData.address)
        })

        it('should return tenant id in response', async () => {
            const tenantsData = {
                name: 'tenant name',
                address: 'tenant address',
            }

            const token = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            })

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${token}`])
                .send(tenantsData)

            assert.ok('id' in response.body)
        })

        it('should return 403 status code if user is not admin', async () => {
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            }
            const managerToken = jwks.token({
                sub: '1',
                role: Roles.MANAGER,
            })

            const response = await request(app)
                .post('/tenants')
                .set('Cookie', [`accessToken=${managerToken}`])
                .send(tenantData)

            assert.strictEqual(response.statusCode, 403)
        })
    })
})
