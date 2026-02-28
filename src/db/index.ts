import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use environment variable or fallback to direct connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xJ9Mz6wLrlnU@ep-sparkling-water-a1ivp9n0.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
