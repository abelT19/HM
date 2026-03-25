"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

// Separate component that uses useSearchParams
function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill from URL if available
  const roomId = searchParams.get("roomId") || "";
  const price = searchParams.get("price") || "";

  const [formData, setFormData] = useState({
    roomId: roomId,
    guestName: "",
    checkIn: "",
    checkOut: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      if (res.ok) {
        setIsSuccess(true);
        toast.success("Reservation Request Received!");
      } else {
        const errorData = await res.json();
        toast.error("Booking Failed", {
          description: errorData.error || "Please try again."
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast.error("Booking Timeout", { description: "The server is taking too long to process your request." });
      } else {
        toast.error("System Error");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };


  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto shadow-2xl border-t-4 border-t-green-500 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <div className="text-9xl">✨</div>
        </div>
        <CardContent className="pt-12 pb-12 text-center space-y-6 relative z-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
          >
            ✓
          </motion.div>
          <CardTitle className="text-3xl font-serif">Thank You!</CardTitle>
          <p className="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
            We have received your request. We will check it and send you a confirmation email in a few seconds.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push("/dashboard/my-bookings")} variant="outline" className="rounded-full px-8">
              View My Reservations
            </Button>
            <Button onClick={() => router.push("/")} className="rounded-full px-8">
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-t-4 border-t-primary">
      <CardHeader>
        <div className="flex items-center gap-4 mb-2">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">📅</div>
          <div>
            <CardTitle>New Reservation</CardTitle>
            <CardDescription>Secure your stay with us.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Number / ID</label>
              <Input
                required
                value={formData.roomId}
                onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                placeholder="Enter Room ID"
              />
              {price && <p className="text-xs text-muted-foreground">Price per night: ${price}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Guest Name</label>
              <Input
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                placeholder="Full Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Check-in Date</label>
              <Input
                required
                type="date"
                value={formData.checkIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Check-out Date</label>
              <Input
                required
                type="date"
                value={formData.checkOut}
                min={formData.checkIn || new Date().toISOString().split("T")[0]}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading} disabled={loading}>
            Confirm Reservation
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function NewBookingPage() {
  return (
    <div className="p-8 min-h-screen">
      <Suspense fallback={
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }>
        <NewBookingForm />
      </Suspense>
    </div>
  );
}