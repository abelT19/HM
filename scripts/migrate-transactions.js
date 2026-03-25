const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const config = {
        host: process.env.DB_HOST || "127.0.0.1",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "hotel_db",
    };

    const connection = await mysql.createConnection(config);

    try {
        console.log('Creating Transactions table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type ENUM('ROOM', 'FOOD', 'MEMBERSHIP') NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                sourceId VARCHAR(36) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (createdAt),
                INDEX (type)
            )
        `);

        console.log('Clearing existing transactions (for idempotency)...');
        await connection.execute('TRUNCATE TABLE transactions');

        console.log('Migrating Bookings into transactions...');
        const [bookingRows] = await connection.execute("SELECT COUNT(*) as count FROM booking WHERE status != 'CANCELLED'");
        console.log(`Found ${bookingRows[0].count} eligible bookings.`);
        
        await connection.execute(`
            INSERT INTO transactions (type, amount, sourceId, createdAt)
            SELECT 'ROOM', totalPrice, id, createdAt FROM booking
            WHERE status != 'CANCELLED'
        `);

        console.log('Migrating Food Orders into transactions...');
        // Check if total_price exists in orders
        const [orderCols] = await connection.execute('DESCRIBE orders');
        const hasTotalPrice = orderCols.some(c => c.Field === 'total_price');
        const hasTotalAmount = orderCols.some(c => c.Field === 'totalAmount');
        const priceCol = hasTotalPrice ? 'total_price' : (hasTotalAmount ? 'totalAmount' : 'unit_price * 1'); // Fallback

        await connection.execute(`
            INSERT INTO transactions (type, amount, sourceId, createdAt)
            SELECT 'FOOD', ${priceCol}, id, createdAt FROM orders
        `);

        console.log('Migrating Memberships into transactions...');
        // Map types to amounts: Monthly=49, Quarterly=129, Yearly=449
        await connection.execute(`
            INSERT INTO transactions (type, amount, sourceId, createdAt)
            SELECT 
                'MEMBERSHIP',
                CASE 
                    WHEN type = 'Monthly' THEN 49.00
                    WHEN type = 'Quarterly' THEN 129.00
                    WHEN type = 'Yearly' THEN 449.00
                    ELSE 0.00
                END as amount,
                id,
                createdAt
            FROM Memberships
        `);

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

migrate();
