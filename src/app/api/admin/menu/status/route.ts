import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function PATCH(req: NextRequest) {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token"
        });

        if (!token || token.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { id, targetStatus } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Dish ID is required" }, { status: 400 });
        }

        // targetStatus should be 0 (Archive) or 1 (Restore)
        const isActive = targetStatus === 1;

        await pool.execute(
            "UPDATE Menu SET is_active = ?, updatedAt = NOW() WHERE id = ?",
            [isActive, id]
        );

        return NextResponse.json({
            success: true,
            message: `Dish ${isActive ? 'restored to' : 'archived from'} menu successfully`
        });
    } catch (error: any) {
        console.error("PATCH Menu Status Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
