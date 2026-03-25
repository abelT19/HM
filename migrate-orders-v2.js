const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const conn = await mysql.createConnection(process.env.DATABASE_URL || {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hotel_db',
    });

    console.log('Running Orders table migration v2...');

    try {
        await conn.execute(`
      ALTER TABLE Orders
      ADD COLUMN IF NOT EXISTS order_type ENUM('INDOOR','OUTDOOR') NOT NULL DEFAULT 'INDOOR',
      ADD COLUMN IF NOT EXISTS maps_url VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS govt_id_url VARCHAR(500) NULL,
      ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50) NULL,
      ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) NULL,
      ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2) NULL
    `);
        console.log('✓ Added order_type, maps_url, govt_id_url, guest_name, guest_phone, unit_price, total_price columns');
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠ Columns already exist, skipping.');
        } else {
            throw err;
        }
    }

    await conn.end();
    console.log('Migration complete.');
}

migrate().catch(console.error);
