const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

(async () => {
    const config = {
        host: process.env.DB_HOST || "127.0.0.1",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "hotel_db",
    };
    const connection = await mysql.createConnection(config);
    try {
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM transactions WHERE createdAt >= "2026-03-20"');
        console.log('Transactions since 2026-03-20:', rows[0].count);
        
        const [today] = await connection.execute('SELECT * FROM transactions WHERE createdAt >= "2026-03-21"');
        console.log('Today Transactions:', today);
    } catch (err) {
        console.error(err);
    } finally {
        await connection.end();
    }
})();
