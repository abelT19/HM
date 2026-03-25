import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// 1. THIS FETCHES THE ROOMS (Fixes the 405 error)
export async function GET() {
  try {
    const [rooms] = await pool.execute(
      "SELECT * FROM Room ORDER BY createdAt DESC"
    );
    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET Rooms Error:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

// 2. THIS ADDS THE ROOMS (Which worked for Room 18!)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = crypto.randomUUID();
    const roomNumber = body.roomNumber;
    const type = body.type;
    const price = parseFloat(body.price);

    await pool.execute(
      "INSERT INTO Room (id, roomNumber, type, price, status, isAvailable, updatedAt) VALUES (?, ?, ?, ?, 'AVAILABLE', true, NOW())",
      [id, roomNumber, type, price]
    );

    const newRoom = { id, roomNumber, type, price, status: "AVAILABLE", isAvailable: true };
    console.log("🏨 Room created:", newRoom);
    return NextResponse.json(newRoom);
  } catch (error) {
    console.error("POST Room Error:", error);
    return NextResponse.json({ error: "Error creating room" }, { status: 500 });
  }
}

