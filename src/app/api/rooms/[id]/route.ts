import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getToken } from "next-auth/jwt";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Lazy Migration: Ensure capacity column exists and synchronize prices/capacities
        try {
            const [columns]: any = await pool.execute("SHOW COLUMNS FROM Room LIKE 'capacity'");
            if (columns.length === 0) {
                await pool.execute("ALTER TABLE Room ADD COLUMN capacity INT DEFAULT 2 AFTER price");
                await pool.execute("UPDATE Room SET price = 2000, capacity = 2 WHERE type = 'SINGLE'");
                await pool.execute("UPDATE Room SET price = 4000, capacity = 4 WHERE type = 'DOUBLE'");
                await pool.execute("UPDATE Room SET price = 4500, capacity = 5 WHERE type = 'FAMILY'");
                await pool.execute("UPDATE Room SET price = 6000, capacity = 6 WHERE type = 'PRESIDENTIAL'");
            }
        } catch (e) {
            console.error('[Migration] Lazy migration error:', e);
        }

        if (!id) {
            return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
        }

        const [rows]: any = await pool.execute(
            "SELECT * FROM Room WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error: any) {
        console.error("Fetch Room Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch room" },
            { status: 500 }
        );
    }
}
