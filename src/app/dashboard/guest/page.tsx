"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BedDouble, ConciergeBell, PlusCircle, LayoutDashboard, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function GuestDashboard() {
    const { data: session } = useSession();
    const user = session?.user as any;

    const [bookings, setBookings] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [memberships, setMemberships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsRes, ordersRes, membershipsRes] = await Promise.all([
                    fetch("/api/bookings"),
                    fetch("/api/orders"),
                    fetch("/api/memberships")
                ]);
                const bookingsData = await bookingsRes.json();
                const ordersData = await ordersRes.json();
                const membershipsData = await membershipsRes.json();

                // Filter for current user's requests
                const userId = user?.id;
                setBookings(bookingsData.filter((b: any) => b.userId === userId).slice(0, 5));
                setOrders(ordersData.filter((o: any) => o.userId === userId).slice(0, 5));
                setMemberships(membershipsData);
            } catch (error) {
                console.error("Failed to fetch requests:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const guestCards = [
        {
            title: "Room Booking",
            desc: "Reserve your luxury suite with instant confirmation",
            icon: <BedDouble className="w-8 h-8" />,
            link: "/dashboard/rooms",
            color: "border-l-amber-500",
            bg: "bg-amber-500/10",
            text: "text-amber-600"
        },
        {
            title: "Food Order",
            desc: "Exquisite culinary experiences delivered to your door",
            icon: <ConciergeBell className="w-8 h-8" />,
            link: "/order-food",
            color: "border-l-rose-500",
            bg: "bg-rose-500/10",
            text: "text-rose-600"
        },
        {
            title: "Gym & Swim Member",
            desc: "Access our exclusive majestic wellness services",
            icon: <PlusCircle className="w-8 h-8" />,
            link: "/services/gym",
            color: "border-l-blue-500",
            bg: "bg-blue-500/10",
            text: "text-blue-600"
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
            case "PENDING_VERIFICATION":
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Waiting for Approval</Badge>;
            case "APPROVED":
            case "COMPLETED":
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Approved</Badge>;
            case "CANCELLED":
            case "REJECTED":
                return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Premium Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                    alt="Dashboard Background"
                    fill
                    className="object-cover opacity-10 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/50" />
            </div>

            <div className="relative z-10 p-8 max-w-7xl mx-auto">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <LayoutDashboard className="w-6 h-6 text-amber-600" />
                            </div>
                            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">Palais Portal</h1>
                        </div>
                        <p className="text-muted-foreground text-lg">
                            Welcome to your luxury escape, <span className="font-semibold text-slate-900">{user?.name || 'Distinguished Guest'}</span>
                        </p>
                    </div>

                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 font-bold uppercase tracking-widest text-[10px] hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-sm active:scale-95 group"
                    >
                        <AlertCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        Sign Out
                    </button>
                </motion.header>

                {/* Luxury Service Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                >
                    {guestCards.map((card) => (
                        <motion.div key={card.title} variants={itemVariants}>
                            <Link href={card.link} className="block h-full">
                                <Card className={`h-full glass-card hover:shadow-2xl transition-all duration-500 cursor-pointer border-l-4 ${card.color} hover:border-l-8 hover:-translate-y-2 group p-6`}>
                                    <div className={`text-4xl mb-6 p-4 ${card.bg} w-fit rounded-2xl ${card.text} group-hover:scale-110 transition-transform duration-500`}>
                                        {card.icon}
                                    </div>
                                    <CardTitle className="text-2xl font-serif mb-2">{card.title}</CardTitle>
                                    <CardDescription className="text-base mb-6">{card.desc}</CardDescription>
                                    <button className="text-sm font-bold uppercase tracking-widest text-amber-600 group-hover:underline underline-offset-4">
                                        Explore Now &rarr;
                                    </button>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* My Requests Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-serif font-bold text-slate-900">My Requests</h2>
                        <Link href="/dashboard/my-reservations" className="text-sm font-bold text-amber-600 hover:underline">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Bookings */}
                        <Card className="glass-card overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BedDouble className="w-5 h-5 text-amber-600" />
                                    Recent Room Reservations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-400 animate-pulse">Loading your reservations...</div>
                                ) : bookings.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                                                        <Clock className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Suite {booking.room_roomNumber || booking.roomId}</p>
                                                        <p className="text-xs text-slate-500">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-slate-400 italic">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        No recent room reservations found.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Food Orders */}
                        <Card className="glass-card overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ConciergeBell className="w-5 h-5 text-rose-500" />
                                    Recent Food Orders
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-8 text-center text-slate-400 animate-pulse">Preparing your order list...</div>
                                ) : orders.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {orders.map((order) => (
                                            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                                                        <Clock className="w-5 h-5 text-rose-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{order.dishName}</p>
                                                        <p className="text-xs text-slate-500">Qty: {order.quantity} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {getStatusBadge(order.status)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-slate-400 italic">
                                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        No recent food orders found.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Memberships */}
                    {memberships.length > 0 && (
                        <Card className="glass-card overflow-hidden mt-8">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PlusCircle className="w-5 h-5 text-blue-500" />
                                    Gym & Swim Memberships
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {memberships.map((membership) => (
                                        <div key={membership.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-inner">
                                                    <PlusCircle className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{membership.type} Membership</p>
                                                    <p className="text-xs text-slate-500">Applied on {new Date(membership.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {membership.status === "APPROVED" && (
                                                    <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex flex-col items-center">
                                                        <span className="text-[8px] uppercase tracking-tighter text-amber-500 font-bold mb-0.5">Membership ID</span>
                                                        <span className="font-mono font-bold text-amber-700 text-sm tracking-widest">{membership.membershipId}</span>
                                                    </div>
                                                )}
                                                {getStatusBadge(membership.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.section>
            </div>
        </div>
    );
}
