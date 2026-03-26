const mysql = require('mysql2/promise');
const fs = require('fs');

async function importDatabase() {
  const sqlFilePath = 'C:\\Users\\Public\\hotel_backup.sql';
  
  if (!fs.existsSync(sqlFilePath)) {
    console.error('Backup file not found at:', sqlFilePath);
    return;
  }

  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  
  let connection;
  try {
    console.log('Connecting to local MySQL on port 3306...');
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      multipleStatements: true
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
