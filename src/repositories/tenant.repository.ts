import type { TenantUserInput } from '../types/index.js'
import type { db as database } from '../db/index.js'
import { tenants } from '../db/schema.js'
import { eq } from 'drizzle-orm'

class TenantRepository {
    constructor(private readonly db: typeof database) {}

    async create(tenantData: TenantUserInput) {
        // INSERT INTO tenants VALUES (name, address);
        const [user] = await this.db
            .insert(tenants)
            .values(tenantData)
            .returning({ id: tenants.id })

        return user
    }

    async find() {
        return await this.db.select().from(tenants)
    }

    async findById(id: number) {
        const [tenant] = await this.db
            .select()
            .from(tenants)
            .where(eq(tenants.id, id))
        return tenant
    }

    async update(id: number, data: TenantUserInput) {
        const [updatedTenant] = await this.db
            .update(tenants)
            .set(data)
            .where(eq(tenants.id, id))
            .returning({ id: tenants.id })
        return updatedTenant
    }

    async delete(id: number) {
        const [deletedTenant] = await this.db
            .delete(tenants)
            .where(eq(tenants.id, id))
            .returning({ id: tenants.id })
        return deletedTenant
    }
}

export default TenantRepository
