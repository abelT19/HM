const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1] : null;

async function migrate() {
    let pool;
    try {
        console.log("Connecting to database...");
        pool = await mysql.createPool({ uri: DATABASE_URL });

        console.log("Adding government_id_url to User table...");
        await pool.execute("ALTER TABLE User ADD COLUMN IF NOT EXISTS government_id_url VARCHAR(255) AFTER phone");

        console.log("Adding payment_proof_url to Booking table...");
        await pool.execute("ALTER TABLE Booking ADD COLUMN IF NOT EXISTS payment_proof_url VARCHAR(255) AFTER totalPrice");

        console.log("Ensuring status column can handle new statuses...");
        // Usually status is a VARCHAR, if it's an ENUM we might need to modify it, but based on previous DESCRIBE it's likely VARCHAR.
        // Let's check status column definition
        const [cols] = await pool.execute("DESCRIBE Booking");
        const statusCol = cols.find(c => c.Field === 'status');
        console.log("Booking status type:", statusCol.Type);

        console.log("✅ Migration completed successfully.");
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        if (pool) await pool.end();
    }
}
migrate();
