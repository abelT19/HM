import { pool } from "@/lib/db";
import { notFound } from "next/navigation";

// Define params as a Promise
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Unwrapping the ID

  const [rows]: any = await pool.execute(
    `SELECT b.*, r.roomNumber, r.type as roomType 
     FROM Booking b 
     JOIN Room r ON b.roomId = r.id 
     WHERE b.id = ?`,
    [id]
  );


  if (rows.length === 0) return notFound();

  const booking = rows[0];
  // Map fields to match what the JSX expects if necessary
  booking.room = {
    roomNumber: booking.roomNumber,
    type: booking.roomType
  };


  return (
    <div className="p-10 bg-white min-h-screen">
      {/* Logic for print button in Server Component */}
      <button
        type="button"
        className="mb-8 bg-slate-900 text-white px-6 py-2 rounded-lg print:hidden"
      // Note: For onClick to work, this specific button needs to be in a separate Client Component 
      // OR you can use a small hack like this:
      >
        Invoice for {booking.guestName}
      </button>

      <div className="max-w-3xl mx-auto border p-12 rounded-sm shadow-sm">
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900">AFRICA HOTEL</h1>
            <p className="text-slate-500 text-sm mt-1">Luxury Hospitality Services</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-400">Invoice</h2>
            <p className="text-slate-500">#{booking.id.slice(0, 8)}</p>
            <p className="text-slate-500">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Guest Details</p>
            <p className="font-bold text-lg">{booking.guestName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Room Details</p>
            <p className="font-bold">{booking.room.type} - Room {booking.room.roomNumber}</p>
          </div>
        </div>

        <table className="w-full mb-12">
          <thead>
            <tr className="border-b-2 border-slate-900 text-left">
              <th className="py-4 font-bold uppercase text-xs">Description</th>
              <th className="py-4 font-bold uppercase text-xs text-right">Stay Period</th>
              <th className="py-4 font-bold uppercase text-xs text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-6 font-medium text-slate-800">Accommodation Charges</td>
              <td className="py-6 text-right text-slate-500">
                {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
              </td>
              <td className="py-6 text-right font-bold text-slate-900">${booking.totalPrice}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 text-right space-y-2">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>${booking.totalPrice}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t border-slate-900 pt-2 mt-4">
              <span>Total Paid:</span>
              <span className="text-emerald-600">${booking.totalPrice}</span>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center border-t border-slate-100 pt-8">
          <p className="text-slate-400 text-sm italic">Thank you for choosing Africa Hotel. Safe travels!</p>
        </div>
      </div>
    </div>
  );
}