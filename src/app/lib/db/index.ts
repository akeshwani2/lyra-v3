import {neon, neonConfig} from '@neondatabase/serverless'
import {drizzle} from 'drizzle-orm/neon-http'
// This caches the connections that are being made to the database
neonConfig.fetchConnectionCache = true;

// This checks if the PDF_DATABASE_URL is set in the environment variables (basic error handling)
if (!process.env.PDF_DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
}

// This creates a connection to the database
const sql = neon(process.env.PDF_DATABASE_URL)

export const db = drizzle(sql)