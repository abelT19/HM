import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { pool } from "@/lib/db";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { recordTransaction } from "@/lib/audit";

async function saveFile(file: File, prefix: string): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${prefix}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const absolutePath = path.join(uploadDir, filename);
    await writeFile(absolutePath, buffer);
    return `/uploads/${filename}`;
}

// Public endpoint — no auth required for outdoor delivery requests from walk-in customers
export async function POST(req: NextRequest) {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: isProd,
        });

        const userId = token?.id || token?.sub || null;
        console.log(`[DELIVERY-REQUEST] Order from userId: ${userId}`);

        const formData = await req.formData();

        const guestName = (formData.get("guest_name") as string) || token?.name || "Guest";
        const guestPhone = (formData.get("guest_phone") as string) || "N/A";
        const dishName = formData.get("dishName") as string;
        const quantityStr = formData.get("quantity") as string;
        const mapsUrl = formData.get("maps_url") as string;
        const govtId = formData.get("govt_id") as File | null;
        const receiptImage = formData.get("receipt_image") as File | null;
        const unitPriceStr = (formData.get("unitPrice") as string) || "0";

        if (!dishName || !quantityStr || !mapsUrl || (!token && !govtId) || !receiptImage) {
            console.error("[DELIVERY-REQUEST] Validation failed:", { dishName, quantityStr, mapsUrl, hasGovtId: !!govtId, hasReceipt: !!receiptImage });
            return NextResponse.json({ error: "Required fields (Files + Location) are missing." }, { status: 400 });
        }

        const quantity = parseInt(quantityStr) || 1;
        const unitPrice = parseFloat(unitPriceStr) || 0;
        const totalPrice = unitPrice * quantity;

        let govtIdUrl = null;
        if (govtId) {
            govtIdUrl = await saveFile(govtId, "govt-id");
        }
        const receiptUrl = await saveFile(receiptImage, "receipt");

        const [result]: any = await pool.execute(
            `INSERT INTO Orders 
             (userId, dishName, quantity, unit_price, total_price, receipt_url, govt_id_url, delivery_details, maps_url, guest_name, guest_phone, order_type, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OUTDOOR', 'PENDING')`,
            [userId, dishName, quantity, unitPrice, totalPrice, receiptUrl, govtIdUrl, mapsUrl, mapsUrl, guestName, guestPhone]
        );

        if (result.insertId && totalPrice > 0) {
            await recordTransaction('FOOD', totalPrice, result.insertId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delivery Request Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
