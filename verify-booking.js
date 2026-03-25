const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function verify() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });
        const [rows] = await pool.execute(
            `SELECT b.status, r.roomNumber, u.email, u.id as userId
             FROM Booking b 
             JOIN Room r ON b.roomId = r.id 
             JOIN User u ON b.userId = u.id
             WHERE u.email = ? AND r.roomNumber = ?`,
            ['abeltariku43@gmail.com', '450']
        );
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
verify();
