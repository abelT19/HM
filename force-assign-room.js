const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function forceFix() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });

        // Find Room 450 ID
        const [roomRows] = await pool.execute("SELECT id FROM Room WHERE roomNumber = ?", ['450']);
        if (roomRows.length === 0) {
            console.log("Room 450 not found.");
            return;
        }
        const roomId450 = roomRows[0].id;

        // Find User ID
        const [userRows] = await pool.execute("SELECT id FROM User WHERE email = ?", ['abeltariku43@gmail.com']);
        if (userRows.length === 0) {
            console.log("User not found.");
            return;
        }
        const userId = userRows[0].id;

        // Update booking
        const [updateResult] = await pool.execute(
            "UPDATE Booking SET roomId = ?, status = 'CHECKED_IN' WHERE userId = ?",
            [roomId450, userId]
        );

        console.log("Updated bookings count:", updateResult.affectedRows);

        if (updateResult.affectedRows === 0) {
            console.log("No booking found to update. Creating one...");
            await pool.execute(
                "INSERT INTO Booking (id, userId, roomId, guestName, guestEmail, status, numGuests, checkIn, checkOut, totalPrice) VALUES (?, ?, ?, ?, ?, 'CHECKED_IN', 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 0)",
                [crypto.randomUUID(), userId, roomId450, "Abel Tariku", "abeltariku43@gmail.com"]
            );
            console.log("New booking created for Room 450.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
forceFix();
