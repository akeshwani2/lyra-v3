import type {Config} from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config({path: '.env'})

export default {
    driver: 'pg', // Change to a compatible driver if needed
    schema: './src/app/lib/db/schema.ts',
    dbCredentials: {
        connectionString: process.env.PDF_DATABASE_URL!,
    }
} satisfies Config;


// npx drizzle-kit studio to start the studio
// npx drizzle-kit push:pg to push the schema to the database