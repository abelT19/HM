import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { pool } from "@/lib/db";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions as any);

        console.log("--- DEBUG: Staff Revoke API ---");
        console.log("Session:", session ? "Found" : "Not Found");
        if (session) {
            console.log("User Role:", (session as any).user?.role);
            console.log("User Email:", (session as any).user?.email);
        }

        const isDev = process.env.NODE_ENV === "development";
        const isAdmin = (session as any)?.user?.role === "ADMIN";

        // Check if the user is an ADMIN
        if (!isAdmin && !isDev) {
            console.log("Access Denied: Not an ADMIN and not in DEV mode");
            return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
        }

        if (isDev && !isAdmin) {
            console.log("Access Granted via DEV mode bypass");
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Update user status to REVOKED
        await pool.execute(
            "UPDATE User SET status = 'REVOKED', updatedAt = NOW() WHERE id = ?",
            [userId]
        );


        return NextResponse.json({ message: "Access revoked successfully" });
    } catch (error) {
        console.error("Error revoking access:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

