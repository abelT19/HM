import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions as any) as any;
        const userRole = session?.user?.role;

        // Security: Only Admin and Receptionist can approve bookings
        if (!session || (userRole !== "ADMIN" && userRole !== "RECEPTIONIST")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { bookingId } = await req.json();

        if (!bookingId) {
            return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
        }

        // --- ATOMIC TRANSACTION ---
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Fetch the booking to get the roomId
            const [bookings]: any = await connection.execute(
                "SELECT roomId FROM Booking WHERE id = ?",
                [bookingId]
            );

            if (bookings.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: "Booking not found" }, { status: 404 });
            }

            const roomId = bookings[0].roomId;

            // 2. Update Booking status to APPROVED
            await connection.execute(
                "UPDATE Booking SET status = 'APPROVED' WHERE id = ?",
                [bookingId]
            );

            // 3. Update Room status to OCCUPIED and mark as unavailable
            await connection.execute(
                "UPDATE Room SET status = 'OCCUPIED', isAvailable = false WHERE id = ?",
                [roomId]
            );

            await connection.commit();

            console.log(`[APPROVAL] Booking ${bookingId} approved. Room ${roomId} set to OCCUPIED.`);

            return NextResponse.json({
                success: true,
                message: "Booking approved and room allocated successfully"
            });
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }

    } catch (error: any) {
        console.error("Approval Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
