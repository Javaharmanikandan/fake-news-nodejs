// ====================================================
// DATABASE CONNECTION MODULE
// ====================================================
// Handles PostgreSQL database connection
// ====================================================

const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
    host: 'db.kdkaxpzmieaiwimexfuy.supabase.co' || 'localhost',
    port: 5432 || 5432,
    database: 'postgres' || 'postgres',
    user: 'postgres' || 'postgres',
    password: 'P_2JMvFd.QLW#wH' || 'P_2JMvFd.QLW#wH',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

module.exports = {
    pool,
    query
};

