import { Pool, PoolConfig } from 'pg';
import { logger } from './logger';

const config: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'secure_upload_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Use DATABASE_URL if provided (for production/Azure)
if (process.env.DATABASE_URL) {
  delete config.host;
  delete config.port;
  delete config.database;
  delete config.user;
  delete config.password;
  (config as any).connectionString = process.env.DATABASE_URL;
  
  // For production with SSL
  if (process.env.NODE_ENV === 'production') {
    (config as any).ssl = {
      rejectUnauthorized: false
    };
  }
}

export const pool = new Pool(config);

// Test the connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to test database connection
export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection test successful');
  } catch (error) {
    logger.error('Database connection test failed:', error);
    throw error;
  }
};

// Helper function for queries
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error:', { text, error });
    throw error;
  }
};

export default pool;