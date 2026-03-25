import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { writeFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import path from "node:path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const password = formData.get("password") as string;
        const idFile = formData.get("idFile") as File;

        if (!name || !email || !password || !phone || !idFile) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user already exists
        const [existing]: any = await pool.execute("SELECT id FROM User WHERE email = ?", [email]);
        if (existing.length > 0) {
            return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        // Ensure Directory Exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", "identity");
        mkdirSync(uploadDir, { recursive: true });

        // Handle ID Upload
        const buffer = Buffer.from(await idFile.arrayBuffer());
        const filename = `${Date.now()}-${idFile.name.replace(/\s+/g, '_')}`;
        const relativePath = `/uploads/identity/${filename}`;
        const absolutePath = path.join(uploadDir, filename);

        await writeFile(absolutePath, buffer);

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = crypto.randomUUID();

        // Anyone signing up via the public portal is a GUEST
        await pool.execute(
            "INSERT INTO User (id, name, email, phone, password, role, status, government_id_url) VALUES (?, ?, ?, ?, ?, 'GUEST', 'ACTIVE', ?)",
            [id, name, email, phone, hashedPassword, relativePath]
        );

        return NextResponse.json({
            success: true,
            message: "Account created successfully",
            user: { id, name, email, phone, role: "GUEST" }
        }, { status: 201 });

    } catch (error: any) {
        console.error("Signup Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
