import pool from "./src/lib/db.js";

async function checkOrdersSchema() {
    try {
        const [rows] = await pool.execute("DESCRIBE Orders");
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkOrdersSchema();
