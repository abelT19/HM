import pool from "./src/lib/db.js";

async function migrate() {
    try {
        console.log("Running migration: Adding phone column to User...");
        await pool.execute("ALTER TABLE User ADD COLUMN phone VARCHAR(20) AFTER email;");
        console.log("Migration successful.");
    } catch (error) {
        if (error.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column 'phone' already exists, skipping.");
        } else {
            console.error("Migration failed:", error);
        }
    } finally {
        process.exit();
    }
}

migrate();
