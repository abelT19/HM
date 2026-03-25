"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Clock, DoorOpen, History, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const BookingTable = dynamic(() => import("@/components/BookingTable"), {
    loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-3xl" />
});

type Booking = {
    id: string;
    user: { name: string; email: string };
    room: { roomNumber: string; type: string };
    guestName?: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalPrice: number;
};

interface ReceptionClientProps {
    initialActive: Booking[];
    initialPending: Booking[];
    initialHistory: Booking[];
    initialAvailableCount: number;
}

export default function ReceptionClient({
    initialActive,
    initialPending,
    initialHistory,
    initialAvailableCount
}: ReceptionClientProps) {
    const [active, setActive] = useState<Booking[]>(initialActive);
    const [pending, setPending] = useState<Booking[]>(initialPending);
    const [history, setHistory] = useState<Booking[]>(initialHistory);
    const [availableCount, setAvailableCount] = useState(initialAvailableCount);
    const router = useRouter();

    const handleApprove = async (id: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch(`/api/bookings/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "APPROVED" }),
                signal: controller.signal
            });
            if (res.ok) {
                toast.success("Booking Approved!");
                router.refresh(); // Refresh server data
            } else {
                const error = await res.json();
                toast.error("Approval failed", { description: error.error });
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                toast.error("Request Timeout", { description: "The server is taking too long to approve this booking." });
            } else {
                toast.error("System error during approval");
            }
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const handleReject = async (id: string) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch(`/api/bookings/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED" }),
                signal: controller.signal
            });
            if (res.ok) {
                toast.success("Booking Rejected");
                router.refresh();
            } else {
                const error = await res.json();
                toast.error("Rejection failed", { description: error.error });
            }
        } catch (error: any) {
            toast.error("System error during rejection");
        } finally {
            clearTimeout(timeoutId);
        }
    };


    const handleCheckOut = async (id: string) => {
        const originalActive = [...active];
        setActive(active.filter(b => b.id !== id));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: id }),
                signal: controller.signal
            });

            const data = await res.json();

            if (res.ok) {
                const { bill } = data;
                toast.success("Checked Out successfully!", { 
                    description: `Total: ${bill.grandTotal.toLocaleString()} ETB (Room: ${bill.roomTotal.toLocaleString()}, Services: ${bill.ordersTotal.toLocaleString()})` 
                });
                router.refresh();
            } else {
                setActive(originalActive);
                toast.error("Check-out failed", { description: data.error || "Please try again." });
            }
        } catch (err: any) {
            setActive(originalActive);
            if (err.name === 'AbortError') {
                toast.error("Check-out Timeout", { description: "Server is processing slowly. Please verify inventory status manually." });
            } else {
                toast.error("Network error during check-out");
            }
        } finally {
            clearTimeout(timeoutId);
        }
    };


    return (
        <div className="relative z-10">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover-lift">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide mb-2">Active Guests</p>
                                <p className="text-5xl font-bold">{active.length}</p>
                            </div>
                            <Users className="w-12 h-12 opacity-30" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl hover-lift">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-amber-100 text-sm font-medium uppercase tracking-wide mb-2">Pending Check-ins</p>
                                <p className="text-5xl font-bold">{pending.length}</p>
                            </div>
                            <Clock className="w-12 h-12 opacity-30" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0 shadow-xl hover-lift">
                    <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide mb-2">Rooms Available</p>
                                <motion.p
                                    key={availableCount}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-5xl font-bold"
                                >
                                    {availableCount}
                                </motion.p>
                            </div>
                            <DoorOpen className="w-12 h-12 opacity-30" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Bookings */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-8 w-1 bg-green-500 rounded-full" />
                    Currently Checked-In
                </h2>
                <BookingTable bookings={active} type="active" onAction={handleCheckOut} />
            </div>

            {/* Pending Approvals */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="h-8 w-1 bg-amber-500 rounded-full" />
                    Pending Approvals
                </h2>
                <BookingTable bookings={pending} type="pending" onAction={handleApprove} onReject={handleReject} />
            </div>

            {/* Checked Out History */}
            <div className="mt-12 opacity-80">
                <h2 className="text-2xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                    <History className="w-6 h-6 text-slate-500" />
                    Recent Departures
                </h2>
                {history.length === 0 ? (
                    <Card className="glass p-8 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
                        <p className="text-slate-400">No recent check-outs found</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {history.map((b) => (
                            <motion.div
                                key={b.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <CheckCircle2 className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{b.user?.name || b.guestName || "Guest"}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Room {b.room?.roomNumber}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-400">Done</Badge>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
