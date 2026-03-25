const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function checkFK() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });
        const [rows] = await pool.execute(
            "SELECT COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME " +
            "FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
            "WHERE TABLE_NAME = 'Orders' AND COLUMN_NAME = 'userId' AND TABLE_SCHEMA = DATABASE()"
        );
        console.log("Foreign Key Constraints:", JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
checkFK();
