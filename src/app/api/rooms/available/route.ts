import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [availableRooms] = await pool.execute(
      "SELECT * FROM Room WHERE status = 'AVAILABLE' AND isAvailable = 1 ORDER BY roomNumber ASC"
    );


    return NextResponse.json(availableRooms);
  } catch (error: any) {
    console.error("Error fetching available rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch available rooms", details: error.message },
      { status: 500 }
    );
  }
}
