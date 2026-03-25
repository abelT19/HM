import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
    let connection;
    try {
        const body = await request.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }

        // Fetch booking and room info
        const [bookings]: any = await pool.execute(
            `SELECT b.*, r.roomNumber, r.id as roomId 
             FROM Booking b 
             JOIN Room r ON b.roomId = r.id 
             WHERE b.id = ?`,
            [bookingId]
        );

        if (bookings.length === 0) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const booking = bookings[0];

        // Fetch Orders for this user during their stay
        const [orders]: any = await pool.execute(
            `SELECT SUM(total_price) as total 
             FROM Orders 
             WHERE userId = ? 
             AND createdAt >= ? 
             AND status != 'REJECTED'`,
            [booking.userId, booking.checkIn]
        );
        
        const ordersTotal = Number(orders[0]?.total || 0);
        const roomTotal = Number(booking.totalPrice || 0);
        const grandTotal = roomTotal + ordersTotal;

        connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute(
                "UPDATE Room SET isAvailable = true, status = 'AVAILABLE', updatedAt = NOW() WHERE id = ?",
                [booking.roomId]
            );
            await connection.execute(
                "UPDATE Booking SET status = 'CHECKED_OUT' WHERE id = ?",
                [bookingId]
            );
            await connection.commit();
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }



        return NextResponse.json({
            success: true,
            message: `Check-out completed for Room ${booking.roomNumber}.`,
            bill: {
                roomTotal: roomTotal,
                ordersTotal: ordersTotal,
                grandTotal: grandTotal,
                currency: "ETB"
            }
        });
    } catch (error: any) {
        console.error("💥 CHECKOUT ERROR:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}

