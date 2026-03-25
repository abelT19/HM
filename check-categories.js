const mysql = require('mysql2/promise');

async function checkCategories() {
    let pool;
    try {
        pool = await mysql.createPool({ uri: "mysql://root@127.0.0.1:3306/hotel_db" });
        const [rows] = await pool.execute("SELECT name, is_active FROM Menu");
        console.log("DB Items:", JSON.stringify(rows));
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        if (pool) await pool.end();
    }
}
checkCategories();
