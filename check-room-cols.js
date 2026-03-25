const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function checkRoom() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });
        const [roomCols] = await pool.execute("DESCRIBE Room");
        console.log("Room Columns: " + roomCols.map(c => c.Field).join(', '));
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
checkRoom();
