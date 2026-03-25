"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  bookingId: string;
  roomId?: string; // Optional because sometimes we might not have it immediately in the parent logic? No, let's make it optional and handle it
  initialCheckedIn: boolean;
  initialCheckedOut: boolean;
}

export default function CheckInOutButtons({ bookingId, roomId, initialCheckedIn, initialCheckedOut }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(action: "CHECK_IN" | "CHECK_OUT") {
    if (!roomId && action === "CHECK_IN") {
      toast.error("Room ID missing");
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/check-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "CHECK_IN" ? "CHECKED_IN" : "CHECKED_OUT",
          roomId
        }),
        signal: controller.signal
      });

      if (res.ok) {
        toast.success(action === "CHECK_IN" ? "Guest Checked In" : "Guest Checked Out");
        router.refresh();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error("Request Timeout", { description: "The server is taking too long to update status." });
      } else {
        toast.error("System Error");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }

  }

  if (initialCheckedOut) return <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed</div>;

  return (
    <div className="flex gap-2">
      {!initialCheckedIn && (
        <button
          onClick={() => updateStatus("CHECK_IN")}
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          Check In
        </button>
      )}

      {initialCheckedIn && !initialCheckedOut && (
        <button
          onClick={() => updateStatus("CHECK_OUT")}
          disabled={loading}
          className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition-all disabled:opacity-50"
        >
          Check Out
        </button>
      )}
    </div>
  );
}