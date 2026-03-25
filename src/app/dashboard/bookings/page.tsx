import { pool } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import BookingsClient from "./BookingsClient";
import { Building2 } from "lucide-react";

async function getBookings() {
  try {
    const [bookings]: any = await pool.execute(`
      SELECT b.*, 
             r.roomNumber as room_roomNumber, r.type as room_type, r.price as room_price,
             u.name as user_name, u.email as user_email, u.government_id_url as user_government_id_url
      FROM Booking b
      LEFT JOIN Room r ON b.roomId = r.id
      LEFT JOIN User u ON b.userId = u.id
      ORDER BY b.createdAt DESC
    `);

    return bookings.map((b: any) => ({
      ...b,
      user: b.user_name ? {
        name: b.user_name,
        email: b.user_email,
        government_id_url: b.user_government_id_url
      } : null,
      room: {
        roomNumber: b.room_roomNumber,
        type: b.room_type || "N/A",
        price: b.room_price || 0
      }
    }));
  } catch (error) {
    console.error("DB Fetch Error (Bookings):", error);
    return [];
  }
}

export default async function ManageBookings() {
  const bookings = await getBookings();

  return (
    <div className="min-h-screen relative font-sans">
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/50 to-slate-200/90" />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-serif font-bold text-slate-900">Reservations</h1>
            </div>
            <p className="text-slate-600 font-medium">Manage all guest bookings and verification documents</p>
          </div>
          <Link href="/dashboard/bookings/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-2xl shadow-xl transition-all active:scale-95 font-bold uppercase tracking-widest text-xs">
              + New Reservation
            </Button>
          </Link>
        </header>

        <BookingsClient initialBookings={bookings} />
      </div>
    </div>
  );
}
