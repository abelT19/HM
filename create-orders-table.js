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

async function createOrdersTable() {
    let pool;
    try {
        console.log("Connecting to database...");
        pool = await mysql.createPool({
            uri: DATABASE_URL,
            waitForConnections: true,
            connectionLimit: 1
        });

        console.log("Diagnosing User table...");
        const [columns] = await pool.execute("DESCRIBE User");
        console.log("User table schema:", columns);

        const idColumn = columns.find(c => c.Field.toLowerCase() === 'id');
        if (!idColumn) {
            console.error("❌ User table has no 'id' column. Found:", columns.map(c => c.Field));
            process.exit(1);
        }

        const idType = idColumn.Type.toUpperCase();
        let foreignKeyType = "INT";
        if (idType.includes("VARCHAR")) foreignKeyType = idType;

        console.log(`Creating Orders table (foreign key type: ${foreignKeyType})...`);
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS Orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId ${foreignKeyType} NOT NULL,
        dishName VARCHAR(255) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10,2) NULL,
        total_price DECIMAL(10,2) NULL,
        receipt_url VARCHAR(255),
        delivery_details VARCHAR(255),
        status ENUM('PENDING', 'APPROVED', 'REJECTED', 'PREPARING', 'DELIVERED') DEFAULT 'PENDING',
        rejection_reason TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (userId)
      )
    ";

        // Attempt to add foreign key separately to avoid total failure
        try {
            await pool.execute("ALTER TABLE Orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE");
            console.log("✅ Foreign key added.");
        } catch (fkError) {
            console.warn("⚠️ Could not add foreign key constraint (but table created):", fkError.sqlMessage);
        }

        console.log("✅ Orders table process complete.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        if (pool) await pool.end();
    }
}

createOrdersTable();
