import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token"
        });

        if (!token || (token.role !== "ADMIN" && token.role !== "RECEPTIONIST")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Missing membership application ID" }, { status: 400 });
        }

        await pool.execute(
            "UPDATE Memberships SET status = 'APPROVED' WHERE id = ?",
            [id]
        );

        return NextResponse.json({ success: true, message: "Membership approved successfully" });
    } catch (error) {
        console.error("Approval Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
