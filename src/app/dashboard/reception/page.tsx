import Image from "next/image";
export const dynamic = 'force-dynamic';

import { pool } from "@/lib/db";
import { Building2 } from "lucide-react";
import ReceptionClient from "./ReceptionClient";

async function getReceptionData() {
  const [bookings]: any = await pool.execute(`
    SELECT b.*, 
           r.roomNumber as room_roomNumber, r.type as room_type, r.isAvailable as room_isAvailable,
           u.name as user_name, u.email as user_email
    FROM Booking b
    LEFT JOIN Room r ON b.roomId = r.id
    LEFT JOIN User u ON b.userId = u.id
    ORDER BY b.createdAt DESC
  `);

  const [rooms]: any = await pool.execute("SELECT isAvailable FROM Room");

  // Format bookings to match the expected structure
  const formattedBookings = bookings.map((b: any) => ({
    ...b,
    user: { name: b.user_name, email: b.user_email },
    room: { roomNumber: b.room_roomNumber, type: b.room_type }
  }));

  return {
    active: formattedBookings.filter((b: any) => b.status === "APPROVED" || b.status === "CHECKED_IN"),
    pending: formattedBookings.filter((b: any) => b.status === "PENDING"),
    history: formattedBookings.filter((b: any) => b.status === "CHECKED_OUT" || b.status === "COMPLETED").slice(0, 6),
    availableCount: rooms.filter((r: any) => r.isAvailable).length
  };
}

export default async function ReceptionPage() {
  const { active, pending, history, availableCount } = await getReceptionData();

  return (
    <div className="min-h-screen relative font-sans">
      {/* Luxurious Hotel Lobby Background */}
      <div className="fixed inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2072&auto=format&fit=crop"
          alt="Lobby Background"
          fill
          priority
          unoptimized={true} // Performance priority
          className="object-cover opacity-30 scale-110"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/70 to-slate-100/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-10 h-10 text-amber-600" />
            <h1 className="text-4xl font-serif font-bold text-slate-900">Guest Registry</h1>
          </div>
          <p className="text-slate-600 text-lg">Real-time check-ins, departures, and guest management</p>
        </header>

        <ReceptionClient
          initialActive={active}
          initialPending={pending}
          initialHistory={history}
          initialAvailableCount={availableCount}
        />
      </div>
    </div>
  );
}
