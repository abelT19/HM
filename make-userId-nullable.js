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
        pool = await mysql.createPool({ uri: DATABASE_URL });
        console.log("Altering Orders table to make userId nullable (handling FK)...");

        // 1. Drop the existing foreign key
        try {
            await pool.execute("ALTER TABLE Orders DROP FOREIGN KEY fk_orders_user");
            console.log("Dropped foreign key: fk_orders_user");
        } catch (e) {
            console.log("Note: Could not drop FK (it might not exist or has a different name):", e.message);
        }

        // 2. Modify the column to be nullable
        await pool.execute("ALTER TABLE Orders MODIFY userId VARCHAR(255) NULL");
        console.log("Modified userId to be nullable.");

        // 3. Re-add the foreign key
        await pool.execute("ALTER TABLE Orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL");
        console.log("Re-added foreign key: fk_orders_user");

        console.log("Migration successful.");
    } catch (err) {
        console.error("Migration failed:", err);
    }
    finally {
        if (pool) await pool.end();
        process.exit(0);
    }
}
migrate();
