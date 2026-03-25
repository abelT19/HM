import { NextRequest, NextResponse } from 'next/server';
import { pool } from "@/lib/db";
import { getToken } from "next-auth/jwt";

// --- 1. GET ALL ROOMS (For the Client Suite View) ---
export async function GET() {
  try {
    // Lazy Migration: Ensure capacity column exists and synchronize prices/capacities
    try {
      const [columns]: any = await pool.execute("SHOW COLUMNS FROM Room LIKE 'capacity'");
      if (columns.length === 0) {
        console.log("[Migration] Adding capacity column and synchronizing prices to ETB...");
        await pool.execute("ALTER TABLE Room ADD COLUMN capacity INT DEFAULT 2 AFTER price");
        
        // One-time sync to the new ETB standards requested by the user
        await pool.execute("UPDATE Room SET price = 2000, capacity = 2 WHERE type = 'SINGLE'");
        await pool.execute("UPDATE Room SET price = 4000, capacity = 4 WHERE type = 'DOUBLE'");
        await pool.execute("UPDATE Room SET price = 4500, capacity = 5 WHERE type = 'FAMILY'");
        await pool.execute("UPDATE Room SET price = 6000, capacity = 6 WHERE type = 'PRESIDENTIAL'");
      }
    } catch (e) {
      console.error('[Migration] Lazy migration error:', e);
    }

    const [rooms] = await pool.execute(
      "SELECT * FROM Room ORDER BY roomNumber ASC"
    );
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('❌ GET Rooms Error:', error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

// --- 2. CREATE A NEW ROOM (For the Admin Panel) ---
export async function POST(request: NextRequest) {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token"
    });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    console.log('🏨 API Route Hit!');
    const body = await request.json();
    console.log('📦 Received data:', body);

    // VALIDATION: Ensure all fields exist
    if (!body.roomNumber || !body.type || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const roomNumber = body.roomNumber.toString();
    const type = body.type;
    const price = parseFloat(body.price.toString());
    
    // Default capacity mapping
    const capacityMap: Record<string, number> = {
      'SINGLE': 2,
      'DOUBLE': 4,
      'FAMILY': 5,
      'PRESIDENTIAL': 6
    };
    const capacity = body.capacity || capacityMap[type] || 2;

    // CREATE: Add the room to the database
    await pool.execute(
      "INSERT INTO Room (id, roomNumber, type, price, capacity, status, isAvailable, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [id, roomNumber, type, price, capacity, "AVAILABLE", true]
    );


    const newRoom = { id, roomNumber, type, price, status: "AVAILABLE", isAvailable: true };

    return NextResponse.json(
      {
        success: true,
        message: 'Room saved to database!',
        data: newRoom
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ POST Rooms Error:', error);

    // Handle MySQL Duplicate Entry Error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: "This room number already exists in the registry." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- 3. UPDATE AN EXISTING ROOM (For the Admin Panel) ---
export async function PATCH(request: NextRequest) {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token"
    });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { id, roomNumber, type, price, status } = body;

    if (!id || !roomNumber || !type || !price || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isAvailable = status === "AVAILABLE";
    
    // Default capacity mapping
    const capacityMap: Record<string, number> = {
      'SINGLE': 2,
      'DOUBLE': 4,
      'FAMILY': 5,
      'PRESIDENTIAL': 6
    };
    const finalCapacity = body.capacity || capacityMap[type] || 2;

    await pool.execute(
      "UPDATE Room SET roomNumber = ?, type = ?, price = ?, capacity = ?, status = ?, isAvailable = ?, updatedAt = NOW() WHERE id = ?",
      [roomNumber.toString(), type, parseFloat(price), finalCapacity, status, isAvailable, id]
    );

    return NextResponse.json({
      success: true,
      message: "Room configuration updated successfully"
    });

  } catch (error: any) {
    console.error('❌ PATCH Rooms Error:', error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
