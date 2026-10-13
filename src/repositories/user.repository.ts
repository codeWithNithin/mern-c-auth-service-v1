import { eq } from 'drizzle-orm'
import type { db as database } from '../db/index.js'
import { users } from '../db/schema.js'
import type { NewUser } from '../types/index.js'

class UserRepository {
    constructor(private readonly db: typeof database) {}

    async createUser(userData: NewUser) {
        // INSERT INTO users VALUES (firstName, lastName, email, password);
        const [user] = await this.db
            .insert(users)
            .values(userData)
            .returning({ id: users.id, role: users.role })

        return user
    }

    async findByEmail(email: string) {
        // SELECT  * FROM users WLHERE email = email i recieve
        const [user] = await this.db
            .select({
                id: users.id,
                password: users.password,
                role: users.role,
            })
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

        return user
    }

    async findById(id: number) {
        const [user] = await this.db
            .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1)

        return user
    }

    async find() {
        return await this.db.select().from(users)
    }

    async update(id: number, data: NewUser) {
        const [updatedUser] = await this.db
            .update(users)
            .set(data)
            .where(eq(users.id, id))
            .returning({ id: users.id })
        return updatedUser
    }

    async delete(id: number) {
        const [deletedUser] = await this.db
            .delete(users)
            .where(eq(users.id, id))
            .returning({ id: users.id })
        return deletedUser
    }
}

export default UserRepository
