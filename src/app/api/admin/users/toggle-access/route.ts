import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { pool } from "@/lib/db";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions as any);
        const isDev = process.env.NODE_ENV === "development";
        const isAdmin = (session as any)?.user?.role === "ADMIN";

        if (!isAdmin && !isDev) {
            return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
        }

        const { userId, targetStatus } = await request.json();

        if (!userId || !targetStatus) {
            return NextResponse.json({ error: "User ID and target status are required" }, { status: 400 });
        }

        if (targetStatus !== "ACTIVE" && targetStatus !== "REVOKED") {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        await pool.execute(
            "UPDATE User SET status = ?, updatedAt = NOW() WHERE id = ?",
            [targetStatus, userId]
        );

        return NextResponse.json({ message: `Access ${targetStatus.toLowerCase()} successfully` });
    } catch (error) {
        console.error("Error toggling access:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
