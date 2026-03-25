"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
    ChefHat,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    Image as ImageIcon,
    ShoppingBag,
    Home,
    Car,
    MapPin,
    ExternalLink,
    CreditCard
} from "lucide-react";


export default function ReceptionistOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "INDOOR" | "OUTDOOR">("ALL");

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 3000); // Auto-refresh every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const handleAction = async (orderId: string, status: string, rejectionReason = "") => {
        const previousOrders = [...orders];
        setOrders(prev => prev.filter(o => o.id !== orderId));
        try {
            const res = await fetch("/api/orders/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status, rejectionReason })
            });
            if (!res.ok) throw new Error("Failed to update");
        } catch (error) {
            console.error("Update Error:", error);
            setOrders(previousOrders);
            alert("Error updating order. Please try again.");
        }
    };

    const handleReject = (id: string) => {
        const reason = prompt("Reason for Rejection (e.g. 'Payment not received' or 'Invalid ID'):");
        if (reason !== null) handleAction(id, "REJECTED", reason || "Incomplete information");
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading Orders...</div>;

    const pendingOrders = orders.filter(o => o.status === "PENDING");
    const filtered = filter === "ALL" ? pendingOrders : pendingOrders.filter(o => (o.order_type || "INDOOR") === filter);

    const outdoorCount = pendingOrders.filter(o => o.order_type === "OUTDOOR").length;
    const indoorCount = pendingOrders.filter(o => !o.order_type || o.order_type === "INDOOR").length;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <ChefHat className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">Order Management</h1>
                        <p className="text-slate-500">Live guest dining & delivery requests</p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <Badge className="bg-amber-100 text-amber-700 border-0 px-5 py-2 rounded-full font-bold">
                        {pendingOrders.length} PENDING TOTAL
                    </Badge>
                    {outdoorCount > 0 && (
                        <Badge className="bg-orange-100 text-orange-700 border-0 px-5 py-2 rounded-full font-bold">
                            🚗 {outdoorCount} DELIVERY VERIFICATION
                        </Badge>
                    )}
                </div>
            </header>

            {/* Filter Tabs */}
            <div className="flex gap-3">
                {(["ALL", "INDOOR", "OUTDOOR"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === f
                            ? f === "OUTDOOR" ? "bg-blue-600 text-white shadow-lg" : f === "INDOOR" ? "bg-amber-500 text-white shadow-lg" : "bg-slate-900 text-white shadow-lg"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        {f === "INDOOR" ? "🏠 Indoor" : f === "OUTDOOR" ? "🚗 Outdoor" : "All Orders"}
                        {f === "ALL"
                            ? ` (${pendingOrders.length})`
                            : f === "INDOOR"
                                ? ` (${indoorCount})`
                                : ` (${outdoorCount})`}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filtered.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
                    <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-serif font-bold text-slate-900">No Pending Orders</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">All requests have been handled. New orders will appear here automatically.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filtered.map((order) => {
                        const isOutdoor = order.order_type === "OUTDOOR";
                        return (
                            <Card key={order.id} className={`border-0 shadow-xl rounded-3xl overflow-hidden bg-white hover:shadow-2xl transition-shadow border-l-4 ${isOutdoor ? "border-l-blue-500" : "border-l-amber-500"}`}>
                                <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-slate-100">

                                    {/* Main Info */}
                                    <div className="p-8 flex-1">
                                        <div className="flex flex-wrap items-start gap-3 mb-5">
                                            <Badge variant="outline" className="font-mono tracking-tighter text-slate-400 border-slate-200">
                                                ORD-{order.id}
                                            </Badge>
                                            {isOutdoor ? (
                                                <Badge className="bg-orange-100 text-orange-700 border-0 font-bold">
                                                    🚗 PENDING DELIVERY VERIFICATION
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold">
                                                    🏠 INDOOR · KITCHEN
                                                </Badge>
                                            )}
                                        </div>

                                        <h3 className="text-3xl font-serif font-bold text-slate-900 mb-1">{order.dishName}</h3>
                                        <p className="text-amber-600 font-bold text-lg mb-6">Qty: {order.quantity}</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                                            <div className="space-y-1">
                                                <span className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Customer</span>
                                                <p className="text-slate-800 font-bold text-base">
                                                    {order.user_name || order.guest_name || "Walk-in Guest"}
                                                    {order.guest_phone && <span className="block text-slate-500 text-xs font-normal">{order.guest_phone}</span>}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                                                    {isOutdoor ? "Delivery Location" : "Room"}
                                                </span>
                                                {isOutdoor && order.maps_url ? (
                                                    <a
                                                        href={order.maps_url.startsWith("http") ? order.maps_url : `https://www.google.com/maps/search/${encodeURIComponent(order.maps_url)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-blue-600 font-bold hover:underline"
                                                    >
                                                        <MapPin className="w-4 h-4" />
                                                        Open in Maps
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <div className="bg-amber-100/50 p-4 rounded-2xl border-2 border-amber-200 shadow-inner">
                                                        <span className="text-[10px] uppercase tracking-widest text-amber-600 font-black block mb-1">Delivering To</span>
                                                        <p className="text-slate-900 font-black text-2xl flex items-center gap-2">
                                                            <Home className="w-6 h-6 text-amber-600" />
                                                            {order.delivery_details || "—"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Time Received</span>
                                                <p className="text-slate-800 font-bold text-base flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-amber-500" />
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents (Outdoor only) */}
                                    {isOutdoor && (
                                        <div className="p-8 xl:w-80 bg-slate-50/60 flex flex-col gap-4 justify-center">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Verification Documents</p>

                                            {/* Payment Receipt */}
                                            <a
                                                href={order.receipt_url || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-5 bg-amber-500 text-white rounded-2xl border-4 border-amber-600 hover:bg-amber-600 transition-all group shadow-xl"
                                            >
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <ImageIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-base">VERIFY RECEIPT</p>
                                                    <p className="text-[10px] text-white/80 flex items-center gap-1 font-bold uppercase">Click to open <Eye className="w-3 h-3" /></p>
                                                </div>
                                            </a>

                                            {/* Govt ID */}
                                            <a
                                                href={order.govt_id_url || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50 transition-all group shadow-sm"
                                            >
                                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">Government ID</p>
                                                    <p className="text-xs text-slate-400 flex items-center gap-1">View <Eye className="w-3 h-3" /></p>
                                                </div>
                                            </a>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="p-8 xl:w-72 flex flex-col justify-center gap-4">
                                        <Button
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 shadow-lg shadow-emerald-500/20 text-lg font-bold"
                                            onClick={() => handleAction(order.id, "APPROVED")}
                                        >
                                            <CheckCircle2 className="mr-2 w-5 h-5" />
                                            {isOutdoor ? "Approve & Dispatch" : "Accept Order"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 rounded-2xl h-14 font-bold"
                                            onClick={() => handleReject(order.id)}
                                        >
                                            <XCircle className="mr-2 w-5 h-5" />
                                            Reject Order
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
