import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token"
        });

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = token?.id || token?.sub;

        const [rows]: any = await pool.execute(
            `SELECT r.roomNumber 
             FROM Booking b 
             JOIN Room r ON b.roomId = r.id 
             WHERE b.userId = ? AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'APPROVED')
             ORDER BY b.createdAt DESC LIMIT 1`,
            [userId]
        );

        if (rows && rows.length > 0) {
            return NextResponse.json({ roomNumber: rows[0].roomNumber });
        }

        return NextResponse.json({ roomNumber: null });
    } catch (error) {
        console.error("Fetch My Room Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
