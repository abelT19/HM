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

        // Role Protection: Only staff can update status
        if (!token || (token.role !== "ADMIN" && token.role !== "RECEPTIONIST")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { orderId, status, rejectionReason } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
        }

        // Standardized mapped statuses per receptionist workflow
        await pool.execute(
            "UPDATE Orders SET status = ?, rejection_reason = ? WHERE id = ?",
            [status, rejectionReason || null, orderId]
        );

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error("Order Status API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
