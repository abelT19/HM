const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function checkSchema() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });
        const [orderCols] = await pool.execute("DESCRIBE Orders");
        fs.writeFileSync('orders_columns.json', JSON.stringify(orderCols.map(c => c.Field), null, 2));
        const [bookingCols] = await pool.execute("DESCRIBE Booking");
        fs.writeFileSync('booking_columns.json', JSON.stringify(bookingCols.map(c => c.Field), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
    }
}
checkSchema();
