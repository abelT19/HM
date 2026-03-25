"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  
  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-serif mb-6">My Reservations</h1>
      <div className="space-y-4">
        {bookings.map((b: any) => (
          <div key={b.id} className="bg-white p-6 rounded-2xl border flex justify-between items-center">
            <div>
              <p className="font-bold">Room {b.roomNumber}</p>
              <p className="text-sm text-slate-500">{b.checkIn} to {b.checkOut}</p>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-1 rounded-full text-xs font-bold ${
              b.status === "PENDING" ? "bg-amber-100 text-amber-600" :
              b.status === "APPROVED" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100"
            }`}>
              {b.status === "PENDING" ? "⏳ Waiting for Approval" : b.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}