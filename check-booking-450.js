const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function checkBooking() {
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

        const [roomRows] = await pool.execute("SELECT id FROM Room WHERE roomNumber = ?", ['450']);
        if (roomRows.length === 0) {
            console.log("Room 450 not found.");
            return;
        }
        const roomId = roomRows[0].id;
        console.log("Room ID:", roomId);

        const [bookingRows] = await pool.execute(
            "SELECT * FROM Booking WHERE userId = ? AND roomId = ?",
            [userId, roomId]
        );
        console.log("Bookings:", JSON.stringify(bookingRows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
checkBooking();
