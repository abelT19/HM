import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { recordTransaction } from "@/lib/audit";

export async function POST(req: NextRequest) {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token"
        });

        const userId = token?.id || token?.sub;
        if (!token || !userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const type = formData.get("type") as string;
        const file = formData.get("receipt_image") as File;

        if (!type || !file) {
            return NextResponse.json({ error: "Missing membership type or receipt" }, { status: 400 });
        }

        // Generate Membership ID: AF-GYM-2026-XXXX
        const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
        const membershipId = `AF-GYM-2026-${uniqueNumber}`;

        // Save file to public/uploads/memberships
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const relativePath = `/uploads/memberships/${filename}`;
        const absolutePath = path.join(process.cwd(), "public", "uploads", "memberships", filename);

        // Ensure directory exists
        await mkdir(path.dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, buffer);

        const id = uuidv4();
        await pool.execute(
            "INSERT INTO Memberships (id, userId, type, receipt_url, membershipId, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
            [id, userId, type, relativePath, membershipId]
        );

        // Record Audit Transaction
        const membershipPrices: Record<string, number> = {
            'Monthly': 2500,
            'Quarterly': 7000,
            'Yearly': 25000
        };
        const amount = membershipPrices[type] || 0;
        if (amount > 0) {
            await recordTransaction('MEMBERSHIP', amount, id);
        }

        return NextResponse.json({ success: true, membershipId });
    } catch (error) {
        console.error("Membership Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token"
        });

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = token.role as string;
        const userId = token.id || token.sub;

        let query = `
            SELECT m.*, u.name as user_name, u.email as user_email 
            FROM Memberships m 
            JOIN User u ON m.userId = u.id 
        `;
        let params: any[] = [];

        if (role !== "ADMIN" && role !== "RECEPTIONIST") {
            query += " WHERE m.userId = ?";
            params.push(userId);
        }

        query += " ORDER BY m.createdAt DESC";

        const [memberships] = await pool.execute(query, params);

        return NextResponse.json(memberships);
    } catch (error) {
        console.error("Fetch Memberships Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
