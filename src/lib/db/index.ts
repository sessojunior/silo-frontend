import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '@/lib/db/schema'

export const db = drizzle(process.env.DATABASE_URL!, { schema: schema })
