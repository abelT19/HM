const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function fixStatus() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });

        console.log("Setting booking status to CHECKED_IN for user abeltariku43@gmail.com / Room 450...");

        await pool.execute(
            `UPDATE Booking b
             JOIN User u ON b.userId = u.id
             JOIN Room r ON b.roomId = r.id
             SET b.status = 'CHECKED_IN'
             WHERE u.email = ? AND r.roomNumber = ?`,
            ['abeltariku43@gmail.com', '450']
        );

        console.log("Status updated successfully.");

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
fixStatus();
