const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function checkData() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });

        console.log("--- User ---");
        const [users] = await pool.execute("SELECT * FROM User WHERE email = ?", ['abeltariku43@gmail.com']);
        console.log(JSON.stringify(users, null, 2));

        if (users.length > 0) {
            const userId = users[0].id;
            console.log("--- Bookings for User ---");
            const [bookings] = await pool.execute(
                "SELECT b.*, r.roomNumber FROM Booking b JOIN Room r ON b.roomId = r.id WHERE b.userId = ?",
                [userId]
            );
            console.log(JSON.stringify(bookings, null, 2));
        }

        console.log("--- Room 450 ---");
        const [rooms] = await pool.execute("SELECT * FROM Room WHERE roomNumber = ?", ['450']);
        console.log(JSON.stringify(rooms, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
checkData();
