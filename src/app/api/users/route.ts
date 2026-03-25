import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


// GET: List all staff members
export async function GET() {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, role, status FROM User WHERE role IN ('ADMIN', 'RECEPTIONIST')"
    );
    return NextResponse.json(users);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST: Register a new staff member
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID(); // Modern Node.js has crypto.randomUUID()

    await pool.execute(
      "INSERT INTO User (id, name, email, password, role, status, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [id, name, email, hashedPassword, role || "RECEPTIONIST", "ACTIVE"]
    );


    return NextResponse.json({ message: "Success" }, { status: 201 });
  } catch (error: any) {
    console.error("Creation Error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
