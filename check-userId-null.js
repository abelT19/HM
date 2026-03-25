const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function checkNullability() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: DATABASE_URL });
        const [rows] = await pool.execute("DESCRIBE Orders");
        const userIdCol = rows.find(r => r.Field === 'userId');
        console.log("userId Column Nullable:", userIdCol ? userIdCol.Null : "Not Found");
    } catch (err) {
        console.error(err);
    } finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
checkNullability();
