import { pgTable, varchar, timestamp, serial, text, integer, pgEnum } from 'drizzle-orm/pg-core'

// This creates an enum called user_system_enum with the values 'user' and 'system'
export const userSystemEnum = pgEnum('user_system_enum', ['user', 'system'])

// This creates a table called chats with the following columns: id, pdfName, and createdAt
export const chats = pgTable('chats', {
    // This is the primary key for the table
    id: serial('id').primaryKey(),
    // This is the name of the PDF file that will be shown on the sidebar
    pdfName: text('pdf_name').notNull(),
    // This is the URL of the PDF file
    pdfUrl: text('pdf_url').notNull(),
    // This is the timestamp of when the chat was created
    createdAt: timestamp('created_at').notNull().defaultNow(),
    // This is the user's ID from Clerk
    userId: varchar('user_id', {length: 256}).notNull(),
    // This is the key of the PDF file in the AWS S3 bucket
    fileKey: text('file_key').notNull(),
})

export type DrizzleChat = typeof chats.$inferSelect

// This creates a table called messages with the following columns: id, chatId, content, role, and createdAt
export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    // This is the chat ID that the message belongs to, the reference is to the chats table
    chatId: integer('chat_id').references(() => chats.id).notNull(),
    // This is the content of the message
    content: text('content').notNull(),
    // This is the timestamp of when the message was created
    createdAt: timestamp('created_at').notNull().defaultNow(),
    // If the role here is system, it means it's sent from the AI type system, but if its user, it means it's sent from the user
    role: userSystemEnum('role').notNull()

})