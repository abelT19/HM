import pool from "./src/lib/db.js";

async function listColumns() {
    try {
        const [rows] = await pool.execute("DESCRIBE Orders");
        const columns = rows.map(r => r.Field);
        console.log("Columns:", columns.join(", "));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

listColumns();
