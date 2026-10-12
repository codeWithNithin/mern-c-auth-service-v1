import createHttpError from 'http-errors'
import type TenantRepository from '../repositories/tenant.repository.js'
import type { TenantUserInput } from '../types/index.js'

class TenantService {
    constructor(private readonly tenantRepository: TenantRepository) {}

    async createTenant(tenantData: TenantUserInput) {
        return await this.tenantRepository.create(tenantData)
    }

    async findAllTenant() {
        return await this.tenantRepository.find()
    }

    async findById(id: number) {
        const tenant = await this.tenantRepository.findById(id)

        if (!tenant) {
            throw createHttpError(400, 'Tenant does not exists')
        }

        return tenant
    }

    async findByIdAndUpdate(id: number, data: TenantUserInput) {
        const tenant = await this.tenantRepository.findById(id)

        if (!tenant) {
            throw createHttpError(400, 'Tenant does not exists')
        }

        const updatedTenant = await this.tenantRepository.update(id, data)

        if (!updatedTenant) {
            throw createHttpError(500, 'Failed to update tenant data')
        }

        return updatedTenant
    }

    async findByIdAndDelete(id: number) {
        const tenant = await this.tenantRepository.findById(id)

        if (!tenant) {
            throw createHttpError(400, 'Tenant does not exists')
        }

        const updatedTenant = await this.tenantRepository.delete(id)

        if (!updatedTenant) {
            throw createHttpError(500, 'Failed to update tenant data')
        }

        return updatedTenant
    }
}

export default TenantService
