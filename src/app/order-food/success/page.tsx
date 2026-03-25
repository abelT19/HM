"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

import DashboardLayout from "@/app/dashboard/layout";

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const type = searchParams.get("type") || "indoor";
    const isOutdoor = type === "outdoor";

    const content = (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] ${isOutdoor ? "bg-blue-500/10" : "bg-amber-500/10"}`} />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="max-w-md w-full text-center relative z-10"
            >
                {/* Icon */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 border-4 ${isOutdoor ? "bg-blue-500/20 border-blue-500/30" : "bg-emerald-500/20 border-emerald-500/30"}`}>
                    {isOutdoor
                        ? <Clock className="w-12 h-12 text-blue-400" />
                        : <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    }
                </div>

                {isOutdoor ? (
                    <>
                        <h1 className="text-4xl font-serif font-bold text-white mb-6">Order Received!</h1>
                        <p className="text-slate-300 text-lg mb-4 leading-relaxed">
                            We are verifying your delivery details and payment.
                        </p>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 text-left space-y-3">
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                </div>
                                Our team will review your ID and payment receipt shortly.
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 text-sm">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-blue-400" />
                                </div>
                                Once approved, your order will be dispatched to your location.
                            </div>
                        </div>
                        <p className="text-blue-400 font-bold mb-10">Check your status in My Orders.</p>
                    </>
                ) : (
                    <>
                        <h1 className="text-4xl font-serif font-bold text-white mb-6">Sent to the Kitchen! 🍽️</h1>
                        <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                            Your order is being prepared right now.{" "}
                            <span className="text-emerald-500 font-bold">Estimated delivery: 25-35 minutes.</span>
                        </p>
                    </>
                )}

                <div className="space-y-4">
                    <Link href="/dashboard/guest">
                        <Button
                            className={`w-full h-16 rounded-2xl text-lg ${isOutdoor ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-amber-500 hover:bg-amber-600 text-slate-900"} font-bold shadow-xl`}
                        >
                            {isOutdoor ? "Check My Order Status" : "Back to Palais Portal"}
                            <ShoppingBag className="ml-3 w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/order-food">
                        <Button variant="ghost" className="text-slate-500 hover:text-white">
                            Order More
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );

    // wrap in dashboard layout to enforce guest sidebar if viewed under /dashboard
    return <DashboardLayout>{content}</DashboardLayout>;
}
