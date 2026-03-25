const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function checkAllBookings() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });
        const [userRows] = await pool.execute("SELECT id FROM User WHERE email = ?", ['abeltariku43@gmail.com']);
        if (userRows.length === 0) {
            console.log("User not found.");
            return;
        }
        const userId = userRows[0].id;
        console.log("User ID:", userId);

        const [bookingRows] = await pool.execute(
            `SELECT b.*, r.roomNumber 
             FROM Booking b 
             LEFT JOIN Room r ON b.roomId = r.id 
             WHERE b.userId = ?`,
            [userId]
        );
        console.log("All User Bookings:", JSON.stringify(bookingRows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
checkAllBookings();
