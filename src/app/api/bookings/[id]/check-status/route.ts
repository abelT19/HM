import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;
    const { status, roomId } = await req.json();

    connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute(
        "UPDATE Booking SET status = ? WHERE id = ?",
        [status, id]
      );

      if (status === "CHECKED_OUT") {
        await connection.execute(
          "UPDATE Room SET status = 'AVAILABLE', isAvailable = true, updatedAt = NOW() WHERE id = ?",
          [roomId]
        );
      }

      await connection.commit();

      const [updatedBookings]: any = await pool.execute(
        "SELECT * FROM Booking WHERE id = ?",
        [id]
      );

      return NextResponse.json(updatedBookings[0]);
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  } catch (error) {
    console.error("Check-status Error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

