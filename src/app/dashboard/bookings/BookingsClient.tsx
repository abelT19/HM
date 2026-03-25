"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const BookingTable = dynamic(() => import("@/components/BookingTable"), {
    loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-3xl" />
});

type Booking = {
    id: string;
    guestName?: string;
    user: { name: string; email: string; government_id_url?: string };
    room: { roomNumber: string; type: string; price: number };
    checkIn: string;
    checkOut: string;
    status: string;
    totalPrice: number;
    payment_proof_url?: string;
    government_id_url?: string;
};

interface BookingsClientProps {
    initialBookings: Booking[];
}

export default function BookingsClient({ initialBookings }: BookingsClientProps) {
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const router = useRouter();

    const [receiptData, setReceiptData] = useState<any>(null);
    const [checkoutBookingId, setCheckoutBookingId] = useState<string | null>(null);

    const handleAction = async (id: string, isApproval?: boolean) => {
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;

        const isCheckOut = booking.status === "APPROVED" || booking.status === "CHECKED_IN";

        // Handle Check-Out flow: 1. Generate Receipt, 2. Show Modal
        if (isCheckOut) {
            try {
                const res = await fetch("/api/checkout/generate-receipt", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        bookingId: id,
                        roomPrice: booking.room.price,
                        checkInDate: booking.checkIn,
                        membershipType: "None" // Update logic as needed
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    setReceiptData(data.receipt);
                    setCheckoutBookingId(id);
                } else {
                    toast.error("Failed to generate receipt");
                }
            } catch (err) {
                toast.error("System error fetching receipt");
            }
            return;
        }

        // Define Endpoint and Options for approvals
        let endpoint = `/api/bookings/${id}/status`;
        let method = "PATCH";
        let body: any = { status: "APPROVED" };

        if (isApproval) {
            endpoint = "/api/bookings/approve";
            method = "POST";
            body = { bookingId: id };
        }

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(isApproval ? "✅ Booking Confirmed!" : "Approved!");
                router.refresh();
            } else {
                const err = await res.json();
                toast.error("Action failed", { description: err.error });
            }
        } catch (error) {
            toast.error("System error");
        }
    };

    const confirmCheckOut = async () => {
        if (!checkoutBookingId) return;
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId: checkoutBookingId })
            });

            if (res.ok) {
                toast.success("Checked out successfully!");
                setReceiptData(null);
                setCheckoutBookingId(null);
                router.refresh();
            } else {
                const err = await res.json();
                toast.error("Check-out failed", { description: err.error });
            }
        } catch (err) {
            toast.error("System error during check-out");
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await fetch(`/api/bookings/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "REJECTED" })
            });

            if (res.ok) {
                toast.success("Booking Rejected");
                router.refresh();
            } else {
                const err = await res.json();
                toast.error("Rejection failed", { description: err.error });
            }
        } catch (error) {
            toast.error("System error during rejection");
        }
    };

    const pending = bookings.filter(b => b.status === "PENDING" || b.status === "PENDING_VERIFICATION");
    const active = bookings.filter(b => b.status === "APPROVED" || b.status === "CHECKED_IN");

    return (
        <div className="space-y-12">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="h-8 w-1 bg-amber-500 rounded-full" />
                    Incoming Requests
                </h2>
                <BookingTable bookings={pending} type="pending" onAction={handleAction} onReject={handleReject} />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="h-8 w-1 bg-green-500 rounded-full" />
                    In-House Guests
                </h2>
                <BookingTable bookings={active} type="active" onAction={handleAction} />
            </div>

            {/* Receipt Side Panel */}
            {receiptData && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
                    <div className="bg-white h-full p-8 max-w-md w-full shadow-2xl relative font-sans slide-in-from-right animate-in fade-in duration-300">
                        <button
                            onClick={() => { setReceiptData(null); setCheckoutBookingId(null); }}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4 mt-8">Check-Out Receipt</h3>
                        
                        <div className="space-y-4 mb-8 text-sm flex-grow">
                            <div className="flex justify-between text-slate-600">
                                <span>Guest</span>
                                <span className="font-semibold text-slate-900">{receiptData.guest}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Stay Duration</span>
                                <span className="font-semibold text-slate-900">{receiptData.stay}</span>
                            </div>
                            <div className="border-t border-dashed pt-4 flex justify-between">
                                <span className="font-semibold">Item Description</span>
                                <span className="font-semibold">Cost (Individual)</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Room Charge (Daily Cutoff 11 AM)</span>
                                <span>{receiptData.individualCosts.roomCharge}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Food & Beverages (Membership Linked)</span>
                                <span>{receiptData.individualCosts.foodOrders}</span>
                            </div>
                            <div className="flex justify-between text-amber-600 font-medium">
                                <span>Membership Discount</span>
                                <span>-{receiptData.individualCosts.membershipDiscount}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between text-lg font-bold text-slate-900">
                                <span>GRAND TOTAL</span>
                                <span>{receiptData.totalBirr}</span>
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8">
                            <button
                                onClick={confirmCheckOut}
                                className="w-full bg-slate-900 text-white font-bold tracking-widest uppercase text-lg rounded-xl py-4 hover:bg-amber-600 transition-colors shadow-lg"
                            >
                                Finalize Check-Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
