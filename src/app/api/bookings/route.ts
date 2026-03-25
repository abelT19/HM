import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { writeFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { recordTransaction } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    const formData = await request.formData();
    const roomId = formData.get("roomId") as string;
    const guestName = (formData.get("guestName") as string) || session?.user?.name || "";
    const guestEmail = (formData.get("guestEmail") as string) || session?.user?.email || "";
    const numGuests = parseInt(formData.get("numGuests") as string || "1");
    const checkIn = new Date(formData.get("checkIn") as string);
    const checkOut = new Date(formData.get("checkOut") as string);
    const totalPrice = parseFloat(formData.get("totalPrice") as string || "0");
    const paymentProof = formData.get("paymentProof") as File;

    const isLocalPayment = formData.get("isLocalPayment") === "true";
    const userRole = session?.user?.role;
    const isStaff = userRole === "RECEPTIONIST" || userRole === "ADMIN";

    let relativePath = null;
    if (!isLocalPayment) {
      if (!paymentProof) {
        return NextResponse.json({ error: "Payment Proof is required" }, { status: 400 });
      }

      // Ensure Directory Exists
      const uploadDir = path.join(process.cwd(), "public", "uploads", "payments");
      mkdirSync(uploadDir, { recursive: true });

      // Handle Payment Proof Upload
      const buffer = Buffer.from(await paymentProof.arrayBuffer());
      const filename = `${Date.now()}-${paymentProof.name.replace(/\s+/g, '_')}`;
      const absolutePath = path.join(uploadDir, filename);
      relativePath = `/uploads/payments/${filename}`;

      await writeFile(absolutePath, buffer);
    }

    const bookingId = crypto.randomUUID();
    const status = (isLocalPayment && isStaff) ? "APPROVED" : "PENDING_VERIFICATION";
    const userId = session?.user?.id || null;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Create the booking
      await connection.execute(
        "INSERT INTO Booking (id, userId, guestName, guestEmail, numGuests, checkIn, checkOut, totalPrice, status, roomId, payment_proof_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [bookingId, userId, guestName, guestEmail, numGuests, checkIn, checkOut, totalPrice, status, roomId, relativePath]
      );

      // 1.5 Record Audit Transaction
      if (totalPrice > 0) {
        await recordTransaction('ROOM', totalPrice, bookingId);
      }

      // 2. If approved instantly, update the room status
      if (status === "APPROVED") {
        await connection.execute(
          "UPDATE Room SET status = 'OCCUPIED', isAvailable = false WHERE id = ?",
          [roomId]
        );
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        bookingId,
        status,
        message: status === "APPROVED"
          ? "Booking confirmed and room occupied."
          : "Reservation received and pending verification"
      }, { status: 201 });
    } catch (dbError: any) {
      if (connection) await connection.rollback();
      throw dbError;
    } finally {
      if (connection) connection.release();
    }
  } catch (error: any) {
    console.error("Booking Error:", error);
    return NextResponse.json(
      { error: error.message || "Booking failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = `
      SELECT b.*, 
             r.roomNumber as room_roomNumber, r.type as room_type, r.price as room_price, r.status as room_status,
             u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM Booking b
      LEFT JOIN Room r ON b.roomId = r.id
      LEFT JOIN User u ON b.userId = u.id
    `;
    const params = [];

    if (status) {
      query += " WHERE b.status = ?";
      params.push(status);
    }

    query += " ORDER BY b.createdAt DESC";

    const [rows]: any = await pool.execute(query, params);

    // Format rows to match Prisma's nested structure if needed by frontend
    const bookings = rows.map((row: any) => ({
      ...row,
      room: row.roomId ? {
        id: row.roomId,
        roomNumber: row.room_roomNumber,
        type: row.room_type,
        price: row.room_price,
        status: row.room_status
      } : null,
      user: row.userId ? {
        id: row.userId,
        name: row.user_name,
        email: row.user_email,
        phone: row.user_phone
      } : null
    }));

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
