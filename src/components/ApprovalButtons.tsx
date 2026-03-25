"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  bookingId: string;
  onStatusChange?: () => void;
};

export default function ApprovalButtons({ bookingId, onStatusChange }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: "APPROVED" | "REJECTED") => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        signal: controller.signal
      });

      if (res.ok) {
        router.refresh(); // Refresh the Server Component data
        if (onStatusChange) onStatusChange();
      } else {
        alert("Failed to update status");
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        alert("Request timed out. The server is not responding.");
      } else {
        console.error(error);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }

  };

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => updateStatus("APPROVED")}
        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "..." : "Approve"}
      </button>
      <button
        disabled={loading}
        onClick={() => updateStatus("REJECTED")}
        className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50"
      >
        {loading ? "..." : "Reject"}
      </button>
    </div>
  );
}