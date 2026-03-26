import mysql from 'mysql2/promise';

// This uses the DATABASE_URL you set in Vercel
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Aiven SSL connections
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
