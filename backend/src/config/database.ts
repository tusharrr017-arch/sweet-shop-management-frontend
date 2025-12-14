import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pgPool: Pool | null = null;
let dbInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeDatabase() {
  if (dbInitialized) return;
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = (async () => {
    if (!process.env.DATABASE_URL) {
      const error = new Error('DATABASE_URL environment variable is not set. Please configure it in Vercel Settings → Environment Variables or in your .env file.');
      console.error(error.message);
      throw error;
    }
    
    console.log('Attempting to connect to PostgreSQL database...');
    
    // Check if connection string requires SSL (Supabase, Vercel Postgres, etc.)
    const requiresSSL = process.env.DATABASE_URL?.includes('sslmode=require') || 
                       process.env.DATABASE_URL?.includes('supabase') ||
                       process.env.NODE_ENV === 'production' || 
                       process.env.VERCEL === '1';
    
    // For Supabase and cloud databases, always use SSL with rejectUnauthorized: false
    const sslConfig = requiresSSL ? { 
      rejectUnauthorized: false,
      require: true 
    } : false;
    
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
    });
    
    try {
      const result = await pgPool.query('SELECT 1 as test');
      console.log('PostgreSQL database connected successfully');
      dbInitialized = true;
    } catch (err: any) {
      console.error('PostgreSQL connection error:', err.message);
      console.error('Connection string (first 20 chars):', process.env.DATABASE_URL?.substring(0, 20));
      throw new Error(`Database connection failed: ${err.message}`);
    }
  })();
  
  return initPromise;
}

export const query = async (text: string, params?: any[]) => {
  try {
    await initializeDatabase();
    
    if (!pgPool) {
      throw new Error('Database pool not initialized');
    }
    
    return await pgPool.query(text, params);
  } catch (error: any) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

const pool = {
  query: query,
  end: async () => {
    if (pgPool) {
      await pgPool.end();
    }
  },
};

if (process.env.VERCEL !== '1') {
  initializeDatabase().catch((err) => {
    console.error('Failed to initialize database on startup:', err);
  });
}

export default pool;
