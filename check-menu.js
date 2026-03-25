const mysql = require('mysql2/promise');

async function checkMenu() {
    let pool;
    try {
        pool = await mysql.createPool({
            uri: "mysql://root@127.0.0.1:3306/hotel_db"
        });
        const [rows] = await pool.execute("SELECT * FROM Menu");
        console.log("Menu rows:", JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        if (pool) await pool.end();
    }
}
checkMenu();
