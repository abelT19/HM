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

async function createMenuTable() {
    let pool;
    try {
        console.log("Connecting to database...");
        pool = await mysql.createPool({
            uri: DATABASE_URL,
            waitForConnections: true,
            connectionLimit: 1
        });

        console.log("Creating Menu table...");
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS Menu (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(255),
        is_available BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

        console.log("✅ Menu table created successfully.");

        // Optional: Seed initial data if table is empty
        const [rows] = await pool.execute("SELECT COUNT(*) as count FROM Menu");
        if (rows[0].count === 0) {
            console.log("Seeding initial menu data...");
            const initialMenu = [
                ['doro-wat', 'Doro Wat', 'Spicy chicken stew with boiled eggs and Injera.', 450, 'Traditional', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&fit=crop'],
                ['kitfo', 'Kitfo', 'Minced raw beef marinated in mitmita and niter kibbeh.', 550, 'Traditional', 'https://images.unsplash.com/photo-1544124499-58912cbddaad?q=80&w=400&fit=crop'],
                ['beyaynetu', 'Beyaynetu', 'A colorful platter of various vegan stews and lentils.', 350, 'Vegan', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&fit=crop'],
                ['special-shiro', 'Special Shiro', 'Roasted ground chickpeas simmered with garlic and ginger.', 250, 'Vegan', 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=400&fit=crop']
            ];

            for (const item of initialMenu) {
                await pool.execute(
                    "INSERT INTO Menu (id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)",
                    item
                );
            }
            console.log("✅ Seeding complete.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        if (pool) await pool.end();
    }
}

createMenuTable();
