"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CheckoutButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
        signal: controller.signal
      });

      if (res.ok) {
        toast.success("Checked Out successfully!");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error("Check-out failed", { description: data.error });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error("Check-out timed out", { description: "Server is processing slowly." });
      } else {
        toast.error("Error during check-out");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl uppercase tracking-widest text-[10px] font-bold h-10 shadow-lg px-6"
    >
      {loading ? "Processing..." : "Complete Check-out"}
    </Button>
  );
}