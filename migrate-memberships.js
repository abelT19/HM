const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function migrate() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    console.log('Creating Memberships table...');

    await connection.execute(`
        CREATE TABLE IF NOT EXISTS Memberships (
            id VARCHAR(36) PRIMARY KEY,
            userId VARCHAR(36) NOT NULL,
            type ENUM('Monthly', 'Quarterly', 'Yearly') NOT NULL,
            receipt_url VARCHAR(255) NOT NULL,
            membershipId VARCHAR(50) NOT NULL UNIQUE,
            status ENUM('PENDING', 'APPROVED', 'EXPIRED') DEFAULT 'PENDING',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
        )
    `);

    console.log('Memberships table created successfully.');
    await connection.end();
}

migrate().catch(console.error);
