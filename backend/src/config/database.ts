import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const useSQLite = process.env.USE_SQLITE === 'true' && process.env.VERCEL !== '1';

let db: Database | null = null;
let pgPool: Pool | null = null;
let dbInitialized = false;
let initPromise: Promise<void> | null = null;

function convertParams(query: string, params?: any[]): { query: string; params: any[] } {
  if (!useSQLite || !params) {
    return { query, params: params || [] };
  }
  
  let convertedQuery = query;
  const convertedParams: any[] = [];
  
  convertedQuery = convertedQuery.replace(/NOW\s*\(\s*\)/gi, "datetime('now')");
  
  convertedQuery = convertedQuery.replace(/\$(\d+)/g, (match, index) => {
    const paramIndex = parseInt(index) - 1;
    if (params[paramIndex] !== undefined) {
      convertedParams.push(params[paramIndex]);
      return '?';
    }
    return match;
  });
  
  convertedQuery = convertedQuery.replace(/(\w+)\s+ILIKE\s+\?/gi, (match, column) => {
    return `LOWER(${column}) LIKE LOWER(?)`;
  });
  
  return { query: convertedQuery, params: convertedParams };
}

async function initializeSQLiteSchema(database: Database) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sweets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sweets_category ON sweets(category);
    CREATE INDEX IF NOT EXISTS idx_sweets_name ON sweets(name);
  `);
}

async function initializeDatabase() {
  if (dbInitialized) return;
  
  if (initPromise) {
    return initPromise;
  }
  
  initPromise = (async () => {
    if (useSQLite) {
      const dbPath = path.join(__dirname, '../../sweet_shop.db');
      
      try {
        const database = await open({
          filename: dbPath,
          driver: sqlite3.Database,
        });
        
        db = database;
        await initializeSQLiteSchema(database);
        dbInitialized = true;
        console.log('SQLite database connected and initialized');
      } catch (err) {
        console.error('SQLite connection error:', err);
        throw err;
      }
    } else {
      if (!process.env.DATABASE_URL) {
        const error = new Error('DATABASE_URL environment variable is not set. Please configure it in Vercel Settings → Environment Variables.');
        console.error(error.message);
        throw error;
      }
      
      console.log('Attempting to connect to PostgreSQL database...');
      pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' ? { rejectUnauthorized: false } : false,
      });
      
      try {
        const result = await pgPool.query('SELECT 1 as test');
        console.log('PostgreSQL database connected successfully', result.rows[0]);
        dbInitialized = true;
      } catch (err: any) {
        console.error('PostgreSQL connection error:', err.message);
        console.error('Connection string (first 20 chars):', process.env.DATABASE_URL?.substring(0, 20));
        throw new Error(`Database connection failed: ${err.message}`);
      }
    }
  })();
  
  return initPromise;
}

export const query = async (text: string, params?: any[]) => {
  try {
    await initializeDatabase();
    
    if (useSQLite && db) {
      const { query: convertedQuery, params: convertedParams } = convertParams(text, params);
      
      if (text.toUpperCase().includes('RETURNING')) {
        const returningMatch = text.match(/RETURNING\s+(.+)/i);
        const returningCols = returningMatch?.[1] || '*';
        
        if (text.toUpperCase().includes('INSERT')) {
          const insertQuery = convertedQuery.replace(/RETURNING.*/i, '');
          const result = await db.run(insertQuery, convertedParams);
          
          if (result.lastID) {
            const tableMatch = text.match(/INTO\s+(\w+)/i);
            if (tableMatch) {
              const selectQuery = `SELECT ${returningCols} FROM ${tableMatch[1]} WHERE id = ?`;
              const row = await db.get(selectQuery, [result.lastID]);
              return { rows: row ? [row] : [], rowCount: 1 };
            }
          }
          return { rows: [], rowCount: result.changes || 0 };
        }
      if (text.toUpperCase().includes('UPDATE')) {
        const tableMatch = text.match(/UPDATE\s+(\w+)/i);
        const id = convertedParams[convertedParams.length - 1];
        
        const updateQuery = convertedQuery.replace(/RETURNING.*/i, '');
        const updateResult = await db.run(updateQuery, convertedParams);
        
        if (updateResult.changes === 0) {
          return { rows: [], rowCount: 0 };
        }
        
        if (tableMatch && id !== undefined) {
          const selectQuery = `SELECT ${returningCols} FROM ${tableMatch[1]} WHERE id = ?`;
          const row = await db.get(selectQuery, [id]);
          return { rows: row ? [row] : [], rowCount: updateResult.changes };
        }
        
        return { rows: [], rowCount: updateResult.changes || 0 };
      }
      if (text.toUpperCase().includes('DELETE')) {
        const tableMatch = text.match(/FROM\s+(\w+)/i);
        const id = convertedParams[0];
        
        if (tableMatch && id) {
          const selectQuery = `SELECT ${returningCols} FROM ${tableMatch[1]} WHERE id = ?`;
          const row = await db.get(selectQuery, [id]);
          await db.run(convertedQuery.replace(/RETURNING.*/i, ''), convertedParams);
          return { rows: row ? [row] : [], rowCount: 1 };
        }
      }
    }
    
    if (text.trim().toUpperCase().startsWith('SELECT')) {
      const rows = await db.all(convertedQuery, convertedParams);
      return { rows, rowCount: rows.length };
    } else {
      const result = await db.run(convertedQuery, convertedParams);
      return {
        rows: result.lastID ? [{ id: result.lastID }] : [],
        rowCount: result.changes || 0,
      };
    }
    } else if (pgPool) {
      return await pgPool.query(text, params);
    }
    throw new Error('Database not initialized');
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
    if (db) {
      await db.close();
    }
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
