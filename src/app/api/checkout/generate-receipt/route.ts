import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

async function getFoodOrdersTotal(userId: string, checkInDate: string): Promise<number> {
  try {
    const [rows]: any = await pool.query(
      'SELECT SUM(total_price) as total FROM Orders WHERE userId = ? AND createdAt >= ? AND status != "REJECTED"', 
      [userId, checkInDate]
    );
    return Number(rows[0]?.total || 0);
  } catch (err) {
    console.error("Error fetching food orders total:", err);
    return 0;
  }
}

// Optimized for Antigravity & MySQL (The Africa Portal)
export async function POST(req: NextRequest) {
  try {
    const { bookingId, roomPrice, checkInDate, membershipType } = await req.json();

    // 0. Fetch Booking to get UserId if not provided
    const [bookings]: any = await pool.execute("SELECT userId, guestName FROM Booking WHERE id = ?", [bookingId]);
    const guestUserId = bookings[0]?.userId;
    const guestName = bookings[0]?.guestName || "Guest";

    // 1. Calculate Room Stay (11:00 AM Cutoff)
    const now = new Date();
    const cutoff = new Date(now).setHours(11, 0, 0, 0);
    const stayDuration = Math.ceil((now.getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24));
    let finalDays = now.getTime() > cutoff ? stayDuration + 1 : stayDuration;
    if (finalDays <= 0) finalDays = 1; 

    // USE THE PROVIDED ROOM PRICE (NOW IN ETB)
    const roomTotalPrice = finalDays * Number(roomPrice || 0);

    // 2. Fetch Food Orders from Orders table using userId
    const foodTotal = guestUserId ? await getFoodOrdersTotal(guestUserId, checkInDate) : 0;

    // 3. Apply Membership Discount
    let discount = 0;
    if (membershipType === 'Gold') discount = 0.15; // 15% off
    if (membershipType === 'Silver') discount = 0.10; // 10% off

    const grandTotal = (roomTotalPrice + foodTotal) * (1 - discount);

    return NextResponse.json({
      receipt: {
        guest: guestName,
        stay: `${finalDays} Nights`,
        individualCosts: {
          roomCharge: `${roomTotalPrice} ETB`,
          foodOrders: `${foodTotal} ETB`,
          membershipDiscount: `${(discount * 100)}%`
        },
        totalBirr: `${grandTotal.toLocaleString()} ETB`,
        roomTotal: roomTotalPrice,
        foodTotal: foodTotal,
        discountAmount: (roomTotalPrice + foodTotal) * discount,
        grandTotal: grandTotal,
      }
    });
  } catch (error) {
    console.error("Receipt Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
