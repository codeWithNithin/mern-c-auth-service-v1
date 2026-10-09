import { date } from 'drizzle-orm/cockroach-core'
import { pgTable, serial, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    firstName: varchar('firstName', { length: 255 }).notNull(),
    lasttName: varchar('lasttName', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    created_at: date(),
})
