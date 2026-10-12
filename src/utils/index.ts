import { db } from '../db/index.js'
import { tenants } from '../db/schema.js'

export const isValidJWT = (token: string | null) => {
    if (!token) return null

    const parts = token.split('.')
    if (parts.length != 3) return false

    try {
        parts.forEach((part) => {
            Buffer.from(part, 'base64').toString('utf-8')
        })
        return true
    } catch {
        return false
    }
}

export const createTenant = async () => {
    const [tenant] = await db
        .insert(tenants)
        .values({
            name: 'tenant 1',
            address: 'tenant address 1',
        })
        .returning({ id: tenants.id })

    return tenant
}
