import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const userId = token?.id || token?.sub;
        if (!token || !userId || (token.role !== "ADMIN" && token.role !== "RECEPTIONIST")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { status, rejection_reason } = await req.json();
        const orderId = params.id;

        await pool.execute(
            "UPDATE Orders SET status = ?, rejection_reason = ? WHERE id = ?",
            [status, rejection_reason || null, orderId]
        );

        return NextResponse.json({ message: "Order updated successfully" });
    } catch (error) {
        console.error("Update Order Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
