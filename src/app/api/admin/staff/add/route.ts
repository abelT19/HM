import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions as any);

        const isDev = process.env.NODE_ENV === "development";
        const isAdmin = (session as any)?.user?.role === "ADMIN";

        // Check if the user is an ADMIN (exact match for "ADMIN")
        // Bypass for debug: Allow if in development OR if isAdmin is true
        if (!isAdmin && !isDev) {
            return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
        }


        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user already exists
        const [existingUsers]: any = await pool.execute(
            "SELECT id FROM User WHERE email = ?",
            [email]
        );
        if (existingUsers.length > 0) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = crypto.randomUUID();

        await pool.execute(
            "INSERT INTO User (id, name, email, password, role, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
            [id, name, email, hashedPassword, role, "ACTIVE"]
        );


        const newUser = {
            id,
            name,
            email,
            role,
            status: "ACTIVE"
        };

        return NextResponse.json({ message: "Staff added successfully", user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Error adding staff:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

