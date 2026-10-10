import { eq } from 'drizzle-orm'
import type { db as database } from '../db/index.js'
import { users } from '../db/schema.js'
import type { NewUser } from '../types/index.js'

class UserRepository {
    constructor(private readonly db: typeof database) {}

    async createUser(userData: NewUser) {
        const [user] = await this.db
            .insert(users)
            .values(userData)
            .returning({ id: users.id, role: users.role })

        return user
    }

    async findByEmail(email: string) {
        // SELECT  * FROM users WLHERE email = email i recieve
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))

        return user
    }
}

export default UserRepository
