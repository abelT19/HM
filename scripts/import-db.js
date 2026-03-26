const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importDatabase() {
  const sqlFilePath = 'C:\\Users\\Public\\hotel_backup.sql';
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error('Backup file not found at:', sqlFilePath);
    return;
  }

  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  
  // Connect to local MySQL. Try root with no password, as is common for local dev
  let connection;
  try {
    console.log('Connecting to local MySQL...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true // Required to run a full dump
    });
    
    console.log('Connected! Creating database if it does not exist...');
    await connection.query('CREATE DATABASE IF NOT EXISTS hotel_db;');
    await connection.query('USE hotel_db;');
    
    console.log('Importing SQL backup...');
    await connection.query(sql);
    console.log('Backup imported successfully!');
    
  } catch (error) {
    console.error('Database import failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

importDatabase();
