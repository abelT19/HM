const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Manually parse .env to get DATABASE_URL
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env");
    process.exit(1);
}

async function renameColumn() {
    let pool;
    try {
        console.log("Connecting to database...");
        pool = await mysql.createPool({
            uri: DATABASE_URL,
            waitForConnections: true,
            connectionLimit: 1
        });

        console.log("Checking columns in Menu table...");
        const [columns] = await pool.execute("DESCRIBE Menu");
        const hasIsAvailable = columns.some(c => c.Field === 'is_available');
        const hasIsActive = columns.some(c => c.Field === 'is_active');

        if (hasIsAvailable && !hasIsActive) {
            console.log("Renaming is_available to is_active...");
            await pool.execute("ALTER TABLE Menu CHANGE is_available is_active BOOLEAN DEFAULT TRUE");
            console.log("✅ Column renamed successfully.");
        } else if (hasIsActive) {
            console.log("ℹ️ Column is_active already exists.");
        } else {
            console.log("⚠️ Column is_available not found, and is_active doesn't exist either.");
            // If neither exists, let's create it just in case
            await pool.execute("ALTER TABLE Menu ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
            console.log("✅ Column is_active added.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        if (pool) await pool.end();
    }
}

renameColumn();
