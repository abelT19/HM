"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
    Lock,
    User,
    MapPin,
    Receipt,
    ExternalLink
} from "lucide-react";

const DISH_PRICES: Record<string, number> = {
    "Doro Wat": 450,
    "Kitfo": 550,
    "Beyaynetu": 350,
    "Special Shiro": 250
};

export default function ReceptionistActionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch("/api/orders");
            if (res.ok) {
                const data = await res.json();
                // User might want to see all orders or just Pending.
                // Let's keep it to PENDING for the "Action" view but handle visibility
                setOrders(data);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === "authenticated" && (session?.user as any)?.role !== "USER") {
            fetchOrders();
            interval = setInterval(fetchOrders, 3000); // Auto-refresh every 3 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, session]);

    const handleAction = async (orderId: number, nextStatus: string, rejectionReason = "") => {
        try {
            const res = await fetch("/api/orders/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: nextStatus, rejectionReason })
            });

            if (!res.ok) throw new Error("Update failed");

            // Update local state for instant badge change
            setOrders((prev: any) => prev.map((o: any) =>
                o.id === orderId ? { ...o, status: nextStatus } : o
            ));

            router.refresh();

            if (nextStatus === 'APPROVED') {
                alert("Order Approved Successfully! ✅");
            }
        } catch (error) {
            console.error("Update Error:", error);
            alert("Failed to update order status.");
        }
    };

    const handleReject = (id: number) => {
        const reason = prompt("Reason for Rejection (e.g., 'Invalid Receipt'):");
        if (reason !== null) {
            handleAction(id, "REJECTED", reason || "Order declined by receptionist");
        }
    };

    if (status === "loading" || loading) {
        return <div className="p-8 text-center text-slate-500 animate-pulse font-serif italic uppercase tracking-widest">Checking Palais Authority...</div>;
    }

    if (status === "unauthenticated" || (session?.user as any)?.role === "USER") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-0 shadow-2xl rounded-[2.5rem] p-10 text-center bg-white">
                    <Lock className="w-16 h-16 text-rose-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-serif font-bold text-slate-900">Staff Access Only</h2>
                    <p className="text-slate-500 mt-2 mb-8">Role authorization required to view guest dining requests.</p>
                    <Button luxury className="w-full" onClick={() => router.push("/")}>Return Home</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                        <ChefHat className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">Food Order Management</h1>
                        <p className="text-slate-500 text-sm">Managing live culinary requests for the Palace</p>
                    </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 px-6 py-2 rounded-full font-bold border-0 text-sm">
                    {orders.filter((o: any) => o.status === 'PENDING').length} PENDING ORDERS
                </Badge>
            </header>

            {orders.length === 0 ? (
                <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] p-32 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <ShoppingBag className="w-10 h-10 text-slate-200" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900">All Requests Handled</h2>
                    <p className="text-slate-400 mt-2">The queue is empty. Excellent work!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {orders.sort((a: any, b: any) => (a.status === 'PENDING' ? -1 : 1)).map((order: any) => {
                        const totalPrice = order.total_price || 0;

                        return (
                            <Card key={order.id} className={`border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 ${order.status !== 'PENDING' ? 'opacity-75 grayscale-[0.5]' : ''} ${order.order_type === 'OUTDOOR' ? 'ring-2 ring-blue-400/50 ring-offset-4 ring-offset-slate-50' : ''}`}>
                                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-50">
                                    {/* Left: Dish & Status */}
                                    <div className="p-8 md:w-64 bg-slate-50/30 flex flex-col justify-center">
                                        <div className="flex gap-2 mb-3">
                                            <Badge className={`border-0 font-bold px-4 py-1.5 rounded-full shadow-sm text-[10px] tracking-widest ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                order.status === 'APPROVED' ? 'bg-emerald-500 text-white' :
                                                    'bg-rose-500 text-white'
                                                }`}>
                                                {order.status}
                                            </Badge>
                                            <Badge className={`border-0 font-bold px-4 py-1.5 rounded-full shadow-sm text-[10px] tracking-widest ${order.order_type === 'OUTDOOR' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {order.order_type}
                                            </Badge>
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold text-slate-900 leading-tight">{order.dishName}</h3>
                                        <p className="text-amber-600 font-bold mt-2">Qty: {order.quantity}</p>
                                    </div>

                                    {/* Center: Customer & Receipt */}
                                    <div className="p-8 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                                    <User className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Customer</span>
                                                    <p className="font-bold text-slate-800">{order.user_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                                    <MapPin className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Room / Location</span>
                                                    {order.maps_url ? (
                                                        <a
                                                            href={order.maps_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-bold text-slate-800 inline-flex items-center gap-2 hover:underline"
                                                        >
                                                            Open Google Maps
                                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                                        </a>
                                                    ) : (
                                                        <p className="font-bold text-slate-800">{order.delivery_details}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-start gap-3">
                                            {order.receipt_url ? (
                                                <a
                                                    href={order.receipt_url.startsWith('/') ? order.receipt_url : `/${order.receipt_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group/link flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 hover:bg-amber-100 transition-colors w-full"
                                                >
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover/link:scale-110 transition-transform">
                                                        <Receipt className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs text-amber-500 font-bold uppercase tracking-wider">Payment Proof</div>
                                                        <div className="text-sm font-bold text-slate-900">View Bank Receipt</div>
                                                    </div>
                                                    <ExternalLink className="ml-auto w-4 h-4 text-amber-300 group-hover/link:text-amber-500 transition-colors" />
                                                </a>
                                            ) : (
                                                <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Payment Proof</div>
                                                    <div className="text-sm font-bold text-slate-600">Not required (Indoor)</div>
                                                </div>
                                            )}

                                            {order.govt_id_url && (
                                                <a
                                                    href={order.govt_id_url.startsWith('/') ? order.govt_id_url : `/${order.govt_id_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group/link flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors w-full"
                                                >
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover/link:scale-110 transition-transform">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-xs text-blue-500 font-bold uppercase tracking-wider">Identity</div>
                                                        <div className="text-sm font-bold text-slate-900">View Government ID</div>
                                                    </div>
                                                    <ExternalLink className="ml-auto w-4 h-4 text-blue-200 group-hover/link:text-blue-500 transition-colors" />
                                                </a>
                                            )}
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-widest">
                                                <Clock className="w-3 h-3" />
                                                Ordered: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Total Price & Actions */}
                                    <div className="p-8 md:w-80 flex flex-col justify-between gap-6 bg-slate-50/10">
                                        <div className="text-right">
                                            <span className="text-[10px] uppercase font-black tracking-tighter text-slate-400">Total Bill</span>
                                            <p className="text-3xl font-serif font-bold text-slate-900 line-clamp-1">{totalPrice.toLocaleString()} ETB</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {order.status === 'PENDING' ? (
                                                <>
                                                    <Button
                                                        className="h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-xs"
                                                        onClick={() => handleAction(order.id, 'APPROVED')}
                                                    >
                                                        <CheckCircle2 className="mr-1 w-4 h-4" />
                                                        ACCEPT
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="h-14 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold active:scale-95 transition-all text-xs bg-white"
                                                        onClick={() => handleReject(order.id)}
                                                    >
                                                        <XCircle className="mr-1 w-4 h-4" />
                                                        REJECT
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="col-span-2 text-center py-4 text-slate-400 font-bold italic text-xs">
                                                    Order Processed via Desk
                                                </div>
                                            )}
                                        </div>
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
