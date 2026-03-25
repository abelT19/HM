import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function DELETE(req: NextRequest) {
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

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing membership ID" }, { status: 400 });
        }

        await pool.execute(
            "DELETE FROM Memberships WHERE id = ?",
            [id]
        );

        return NextResponse.json({ success: true, message: "Membership revoked successfully" });
    } catch (error) {
        console.error("Revoke Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
