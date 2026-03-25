import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let connection;
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update booking
      await connection.execute(
        "UPDATE Booking SET status = ? WHERE id = ?",
        [status, id]
      );

      // Fetch booking to get roomId
      const [bookings]: any = await connection.execute(
        "SELECT roomId FROM Booking WHERE id = ?",
        [id]
      );
      if (bookings.length === 0) {
        throw new Error("Booking not found");
      }

      const roomId = bookings[0].roomId;

      // If approved, mark room as occupied and not available
      if (status === "APPROVED" || status === "CHECKED_IN") {
        await connection.execute(
          "UPDATE Room SET status = 'OCCUPIED', isAvailable = false, updatedAt = NOW() WHERE id = ?",
          [roomId]
        );
      }

      await connection.commit();

      // Fetch updated booking to return (optional, but keep consistent with previous API)
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

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}
