import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    // 1. Check if the database is reachable
    await pool.execute('SELECT 1');


    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health Check Error:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Database connection failed"
      },
      { status: 500 }
    );
  }
}
