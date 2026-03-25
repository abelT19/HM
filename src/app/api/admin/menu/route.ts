import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { writeFile, unlink, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "crypto";

export async function GET(req: NextRequest) {
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

        const [menuItems]: any = await pool.execute(
            "SELECT * FROM Menu ORDER BY is_active DESC, category ASC, name ASC"
        );
        return NextResponse.json(menuItems);
    } catch (error) {
        console.error("GET Admin Menu Error:", error);
        return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
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

        const formData = await req.formData();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = formData.get("price") as string;
        const category = formData.get("category") as string;
        const file = formData.get("image") as File;

        if (!name || !price || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let imageUrl = null;
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            imageUrl = `/uploads/menu/${filename}`;
            const absolutePath = path.join(process.cwd(), "public", "uploads", "menu", filename);

            // Ensure directory exists
            await mkdir(path.dirname(absolutePath), { recursive: true });
            await writeFile(absolutePath, buffer);
        }

        const id = crypto.randomUUID();

        await pool.execute(
            "INSERT INTO Menu (id, name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?, ?)",
            [id, name, description, parseFloat(price), category, imageUrl]
        );

        return NextResponse.json({ success: true, message: "Dish added to menu" });
    } catch (error: any) {
        console.error("POST Menu Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

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

        const formData = await req.formData();
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = formData.get("price") as string;
        const category = formData.get("category") as string;
        const isAvailable = formData.get("is_active") === "true";
        const file = formData.get("image") as File;

        if (!id) {
            return NextResponse.json({ error: "Dish ID is required" }, { status: 400 });
        }

        let updateQuery = "UPDATE Menu SET name = ?, description = ?, price = ?, category = ?, is_active = ?";
        let params: any[] = [name, description, parseFloat(price), category, isAvailable];

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            const imageUrl = `/uploads/menu/${filename}`;
            const absolutePath = path.join(process.cwd(), "public", "uploads", "menu", filename);

            await mkdir(path.dirname(absolutePath), { recursive: true });
            await writeFile(absolutePath, buffer);

            updateQuery += ", image_url = ?";
            params.push(imageUrl);
        }

        updateQuery += " WHERE id = ?";
        params.push(id);

        await pool.execute(updateQuery, params);

        return NextResponse.json({ success: true, message: "Dish updated successfully" });
    } catch (error: any) {
        console.error("PATCH Menu Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

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

        const { id, archiveOnly } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Dish ID is required" }, { status: 400 });
        }

        if (archiveOnly) {
            await pool.execute("UPDATE Menu SET is_active = FALSE WHERE id = ?", [id]);
            return NextResponse.json({ success: true, message: "Dish archived successfully" });
        } else {
            await pool.execute("DELETE FROM Menu WHERE id = ?", [id]);
            return NextResponse.json({ success: true, message: "Dish removed successfully" });
        }
    } catch (error: any) {
        console.error("DELETE Menu Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
