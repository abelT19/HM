import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DoorOpen, Clock, FileText, UserCheck, ShieldCheck, Mail, Phone } from "lucide-react";

type Booking = {
    id: string;
    user: { name: string; email: string; phone?: string; government_id_url?: string };
    room: { roomNumber: string; type: string };
    guestName?: string;
    guestEmail?: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalPrice: number;
    payment_proof_url?: string;
    government_id_url?: string; // Some APIs might flatten it
};

interface BookingTableProps {
    bookings: Booking[];
    type: "active" | "pending";
    onAction: (id: string, isApproval?: boolean) => void;
    onReject?: (id: string) => void;
}

export default function BookingTable({ bookings, type, onAction, onReject }: BookingTableProps) {
    const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: any = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const handleVerification = (b: Booking) => {
        // 1. Open links if they exist
        const idUrl = b.government_id_url || b.user?.government_id_url;
        const payUrl = b.payment_proof_url;

        if (idUrl) window.open(idUrl, '_blank');
        if (payUrl) window.open(payUrl, '_blank');

        // 2. Mark as reviewed
        setReviewedBookings(prev => new Set(prev).add(b.id));
    };

    if (bookings.length === 0) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 text-center border border-slate-200">
                <div className="text-5xl mb-4 opacity-40">{type === "active" ? "🏨" : "✅"}</div>
                <p className="text-slate-600 text-lg">{type === "active" ? "No active check-ins" : "All caught up!"}</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {bookings.map((b) => {
                const isReviewed = reviewedBookings.has(b.id);
                const isWaitingDocs = b.status === 'PENDING_VERIFICATION';

                return (
                    <motion.div key={b.id} variants={itemVariants}>
                        <div className={`hover-lift bg-white shadow-xl border-l-4 overflow-hidden group rounded-3xl ${type === "active" ? "border-l-green-500" : (isWaitingDocs ? 'border-l-amber-500' : 'border-l-slate-500')}`}>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{b.guestName || b.user?.name || "Guest"}</h3>
                                    <Badge className={type === "active" ? "bg-green-500 text-white" : (isWaitingDocs ? "bg-amber-500 text-white pulse-slow" : "bg-slate-500 text-white")}>
                                        {isWaitingDocs ? "Waiting Docs" : (type === "active" ? "Active" : "Pending")}
                                    </Badge>
                                </div>
                                <div className="space-y-3 text-sm text-slate-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <DoorOpen className="w-4 h-4 text-blue-600" />
                                        <span className="font-semibold text-slate-900">Room {b.room?.roomNumber || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                         <span>{b.totalPrice.toLocaleString()} ETB - {b.room?.type}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3 mt-3">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{b.guestEmail || b.user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Phone className="w-3 h-3 text-green-600" />
                                        <span>{b.user?.phone || "No Phone"}</span>
                                    </div>

                                    {/* Document Links */}
                                    <div className="pt-2 flex flex-wrap gap-2">
                                        {b.payment_proof_url && (
                                            <a
                                                href={b.payment_proof_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-1 transition-colors"
                                            >
                                                <FileText className="w-3 h-3" />
                                                Payment Proof
                                            </a>
                                        )}
                                        {(b.government_id_url || b.user?.government_id_url) && (
                                            <a
                                                href={b.government_id_url || b.user?.government_id_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-[10px] font-bold text-slate-600 flex items-center gap-1 transition-colors"
                                            >
                                                <ShieldCheck className="w-3 h-3" />
                                                Guest ID
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {type === "active" ? (
                                        <Button
                                            onClick={() => onAction(b.id)}
                                            variant="destructive"
                                            size="sm"
                                            className="flex-1 rounded-xl uppercase tracking-widest text-[10px] font-bold h-10 shadow-lg"
                                        >
                                            Complete Check-out
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                if (isWaitingDocs && !isReviewed) {
                                                    handleVerification(b);
                                                } else {
                                                    onAction(b.id, true); // True means actual approval
                                                }
                                            }}
                                            variant={isReviewed ? "success" as any : "default"}
                                            size="sm"
                                            className="flex-1 rounded-xl uppercase tracking-widest text-[10px] font-bold h-10 shadow-lg"
                                        >
                                            {isWaitingDocs
                                                ? (isReviewed ? "✅ Approve & Allocate" : "Verify First")
                                                : "Approve & Allocate"}
                                        </Button>
                                    )}
                                    {type === "pending" && onReject && (
                                        <Button
                                            onClick={() => onReject(b.id)}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl uppercase tracking-widest text-[10px] font-bold h-10 border-rose-200 text-rose-600 hover:bg-rose-50"
                                        >
                                            Reject
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
