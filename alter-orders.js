const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function alterTable() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });
        console.log("Adding columns...");
        await pool.execute("ALTER TABLE Orders ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0, ADD COLUMN total_price DECIMAL(10,2) DEFAULT 0;");
        console.log("Migration successful");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        if (pool) await pool.end();
    }
}
alterTable();
