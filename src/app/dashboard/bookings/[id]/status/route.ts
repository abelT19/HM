import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    const bookingId = params.id;

    // Update the booking status in the database
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status }, // e.g., "APPROVED" or "REJECTED"
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}