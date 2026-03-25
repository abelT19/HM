"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, Mail, Users, CheckCircle2, Sparkles, Send, Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: {
        id: string;
        roomNumber: string;
        type: string;
        price: number;
        capacity?: number;
    } | null;
    isReceptionist?: boolean;
}

export default function BookingModal({ isOpen, onClose, room, isReceptionist }: BookingModalProps) {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        guestName: "",
        guestEmail: "",
        checkIn: "",
        checkOut: "",
        numGuests: 1,
        paymentProof: null as File | null,
        isLocalPayment: false
    });

    useEffect(() => {
        if (session?.user && !formData.guestName && !formData.guestEmail) {
            setFormData(prev => ({
                ...prev,
                guestName: session.user?.name || "",
                guestEmail: session.user?.email || ""
            }));
        }
    }, [session]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!room) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            router.push(`/signup?callbackUrl=${window.location.pathname}`);
            onClose();
            return;
        }

        if (!formData.isLocalPayment && !formData.paymentProof) {
            toast.error("Payment proof screenshot is required.");
            return;
        }

        setIsSubmitting(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const data = new FormData();
            data.append("guestName", formData.guestName);
            data.append("guestEmail", formData.guestEmail);
            data.append("checkIn", formData.checkIn);
            data.append("checkOut", formData.checkOut);
            data.append("numGuests", formData.numGuests.toString());
            data.append("roomId", room.id);
            data.append("totalPrice", room.price.toString());
            data.append("isLocalPayment", formData.isLocalPayment.toString());

            if (formData.paymentProof) {
                data.append("paymentProof", formData.paymentProof);
            }

            const response = await fetch("/api/bookings", {
                method: "POST",
                body: data,
                signal: controller.signal
            });

            if (response.ok) {
                setIsSuccess(true);
                toast.success(formData.isLocalPayment ? "Booking Approved Instantly!" : "Reservation request sent!");
                router.refresh(); // Crucial for instant inventory update

                setTimeout(() => {
                    setIsSuccess(false);
                    onClose();
                    // Reset form
                    setFormData({
                        guestName: "",
                        guestEmail: "",
                        checkIn: "",
                        checkOut: "",
                        numGuests: 1,
                        paymentProof: null,
                        isLocalPayment: false
                    });
                }, 3000);
            } else {
                const err = await response.json();
                toast.error(err.error || "Booking failed. Please try again.");
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                toast.error("Request Timeout", { description: "The reservation is taking too long to process." });
            } else {
                toast.error("Network error. Please check your connection.");
            }
        } finally {
            clearTimeout(timeoutId);
            setIsSubmitting(false);
        }

    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto"
                    >
                        {isSuccess ? (
                            <div className="p-12 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
                                >
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                </motion.div>
                                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Congratulations! Successfully Ordered</h2>
                                <p className="text-slate-600 text-lg mb-8">
                                    We have received your reservation request for <span className="font-bold text-slate-800">Suite {room.roomNumber}</span>.
                                    Please wait until our team approves your request.
                                </p>
                                <Button
                                    onClick={onClose}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full"
                                >
                                    Return to Collection
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="bg-slate-900 p-8 text-white relative">
                                    <button
                                        onClick={onClose}
                                        className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 hover:rotate-90"
                                        aria-label="Close"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-slate-400">Premium Reservation</span>
                                    </div>
                                    <h2 className="text-4xl font-serif font-bold">Suite {room.roomNumber}</h2>
                                    <div className="flex flex-col gap-1 mt-4">
                                        <p className="text-amber-500 font-bold text-2xl">{room.price.toLocaleString()} ETB <span className="text-sm font-medium text-slate-400">/ night</span></p>
                                        <motion.div 
                                            animate={{ opacity: [0.7, 1, 0.7] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="bg-red-600/90 text-white px-4 py-1 rounded-full text-[10px] font-black inline-block w-fit mt-3 shadow-lg tracking-tighter"
                                        >
                                            STRICT 11:00 AM CHECK-OUT CUTOFF
                                        </motion.div>
                                    </div>
                                </div>

                                {(
                                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Full Name"
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium shadow-sm"
                                                    value={formData.guestName}
                                                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                                                />
                                            </div>

                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium shadow-sm"
                                                    value={formData.guestEmail}
                                                    onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <div className="absolute left-4 top-3 text-[10px] uppercase font-bold text-slate-400">Check-in</div>
                                                    <Calendar className="absolute left-4 bottom-3 w-5 h-5 text-slate-400" />
                                                    <input
                                                        required
                                                        type="date"
                                                        min={today}
                                                        className="w-full pl-12 pr-4 pt-8 pb-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                                                        value={formData.checkIn}
                                                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <div className="absolute left-4 top-3 text-[10px] uppercase font-bold text-slate-400">Check-out</div>
                                                    <Calendar className="absolute left-4 bottom-3 w-5 h-5 text-slate-400" />
                                                    <input
                                                        required
                                                        type="date"
                                                        min={formData.checkIn || today}
                                                        className="w-full pl-12 pr-4 pt-8 pb-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                                                        value={formData.checkOut}
                                                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Staff Only: Local Payment Toggle */}
                                            {(isReceptionist || (session?.user as any)?.role === 'RECEPTIONIST' || (session?.user as any)?.role === 'ADMIN') && (
                                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between group cursor-pointer"
                                                    onClick={() => setFormData({ ...formData, isLocalPayment: !formData.isLocalPayment })}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${formData.isLocalPayment ? 'bg-amber-600' : 'bg-slate-200'}`}>
                                                            {formData.isLocalPayment ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Users className="w-5 h-5 text-slate-400" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Local Payment</p>
                                                            <p className="text-[10px] text-slate-500">Bypass verification (Instant Approval)</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.isLocalPayment ? 'bg-amber-600' : 'bg-slate-200'}`}>
                                                        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${formData.isLocalPayment ? 'translate-x-7' : 'translate-x-1'}`} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className={`relative p-6 border-2 border-dashed rounded-2xl transition-all group ${formData.isLocalPayment ? 'border-slate-100 opacity-50' : 'border-slate-200 hover:border-amber-500'}`}>
                                                    <input
                                                        required={!formData.isLocalPayment}
                                                        disabled={formData.isLocalPayment}
                                                        type="file"
                                                        accept="image/*"
                                                        className={`opacity-0 absolute inset-0 z-10 ${formData.isLocalPayment ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                        onChange={(e) => setFormData({ ...formData, paymentProof: e.target.files?.[0] || null })}
                                                    />
                                                    <div className={`flex flex-col items-center justify-center gap-2 transition-colors ${formData.isLocalPayment ? 'text-slate-300' : 'text-slate-500 group-hover:text-amber-600'}`}>
                                                        <Camera className="w-8 h-8" />
                                                        <div className="text-center">
                                                            <p className="text-xs font-bold uppercase tracking-[0.1em]">
                                                                {formData.isLocalPayment ? "Not required for local payment" : (formData.paymentProof ? formData.paymentProof.name : "Upload Payment Proof")}
                                                            </p>
                                                            {!formData.isLocalPayment && <p className="text-[10px] opacity-60 mt-1">Screenshot/PDF of transfer confirmation</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                <select
                                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all appearance-none bg-white text-slate-700"
                                                    value={formData.numGuests}
                                                    onChange={(e) => setFormData({ ...formData, numGuests: parseInt(e.target.value) })}
                                                >
                                                    {Array.from({ length: room.capacity || 2 }, (_, i) => i + 1).map(num => (
                                                        <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <Button
                                            disabled={isSubmitting}
                                            type="submit"
                                            className="w-full py-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-3 text-lg font-bold shadow-xl transition-all active:scale-95"
                                        >
                                            {isSubmitting ? "Processing Payment..." : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Submit for Verification
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
                                            Secured by Africa Hotel Encryption
                                        </p>
                                    </form>
                                )}
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
