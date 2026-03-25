"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewBookingPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available rooms for the dropdown
  useEffect(() => {
    fetch("/api/rooms/available") // We'll create this helper next
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch("/api/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/dashboard/bookings");
      router.refresh();
    } else {
      alert("Error creating booking");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Create New Booking</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded-lg">
        <div>
          <label className="block text-sm font-medium">Guest Name</label>
          <input name="guestName" required className="w-full border p-2 rounded" />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Select Room</label>
          <select name="roomId" required className="w-full border p-2 rounded">
            <option value="">-- Choose a Room --</option>
            {rooms.map((room: any) => (
              <option key={room.id} value={room.id}>
                Room {room.roomNumber} ({room.type} - ${room.price})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Check-In</label>
            <input name="checkInDate" type="date" required className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Check-Out</label>
            <input name="checkOutDate" type="date" required className="w-full border p-2 rounded" />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}