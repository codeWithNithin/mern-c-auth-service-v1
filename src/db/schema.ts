import {
    integer,
    pgTable,
    serial,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    firstName: varchar('firstName', { length: 255 }).notNull(),
    lastName: varchar('lastName', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 60 }).notNull(),
    role: varchar('role', { length: 20 }).notNull(),
})

export const refreshTokens = pgTable('refreshtokens', {
    id: serial('id').primaryKey(),

    expiresIn: timestamp('expiresIn', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),

    userId: integer('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),

    createdAt: timestamp('createdAt', {
        withTimezone: true,
        mode: 'date',
    })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp('updatedAt', {
        withTimezone: true,
        mode: 'date',
    })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
})
