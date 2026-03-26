"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { ChefHat, Star, Clock, ShoppingCart, Utensils, Home, Car, X } from "lucide-react";

type MenuItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
};

export default function OrderFoodPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    // begin with a forced menu in case the API or database is unreachable
    const [menuItems, setMenuItems] = useState<MenuItem[]>([
        { id: "forced-1", name: "Doro Wat", category: "Signature Platters", price: 15.0, description: "Spicy chicken stew", image_url: "" } as any,
        { id: "forced-2", name: "Special Kitfo", category: "Meat Dishes", price: 20.0, description: "Minced beef with mitemita", image_url: "" } as any,
        { id: "forced-3", name: "Beef Tibs", category: "Meat Dishes", price: 16.0, description: "Sautéed beef with onions", image_url: "" } as any,
        { id: "forced-4", name: "Spiced Tea", category: "Drinks", price: 3.0, description: "Traditional spiced tea", image_url: "" } as any,
    ]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<"signature" | "meat" | "drinks">("signature");
    const [cart, setCart] = useState<Record<string, number>>({});
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [serviceType, setServiceType] = useState<"indoor" | "outdoor">("indoor");
    const [roomNumber, setRoomNumber] = useState("");
    const [mapsUrl, setMapsUrl] = useState("");
    const [govtIdFile, setGovtIdFile] = useState<File | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<{ quantity: number; dishName: string; } | null>(null);
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");

    useEffect(() => {
        let isMounted = true;
        const FALLBACK_MENU = [
            { id: "fallback-signature-doro-wat", name: "Doro Wat", description: "Spicy chicken stew", price: 15.0, category: "Signature Platters", image_url: null },
            { id: "fallback-meat-special-kitfo", name: "Special Kitfo", description: "Minced beef with spices", price: 20.0, category: "Meat Dishes", image_url: null },
        ];

        const fetchMenu = async () => {
            try {
                const res = await fetch("/api/menu");
                const data = await res.json().catch(() => null);
                if (!isMounted) return;
                if (!res.ok || !Array.isArray(data)) {
                    setMenuItems(FALLBACK_MENU as any);
                    return;
                }
                setMenuItems(data as MenuItem[]);
            } catch (error) {
                if (isMounted) setMenuItems(FALLBACK_MENU as any);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMenu();

        if (status === "authenticated") {
            const fetchMyRoom = async () => {
                try {
                    const res = await fetch("/api/bookings/my-room");
                    const data = await res.json();
                    if (isMounted && res.ok && data.roomNumber) {
                        setRoomNumber(data.roomNumber);
                    }
                } catch (error) {
                    console.error("Failed to load assigned room:", error);
                }
            };
            fetchMyRoom();
        }

        return () => { isMounted = false; };
    }, [status]);

    const identityVerified = Boolean((session?.user as any)?.identity_verified);

    const filteredMenuItems = menuItems.filter((item) => {
        const cat = (item.category || "").toLowerCase();
        const name = (item.name || "").toLowerCase();

        if (activeCategory === "meat") {
            return cat.includes("meat") || name.includes("kitfo") || name.includes("tibs") || name.includes("beef") || name.includes("lamb");
        }
        if (activeCategory === "drinks") {
            return cat.includes("drink") || cat.includes("juice") || cat.includes("beverage") || cat.includes("tea") || cat.includes("coffee");
        }
        // Signature covers everything else (Beyaynetu, Doro Wat, Shiro, Tegabino, etc.)
        return !cat.includes("drink") && !cat.includes("beverage") && !cat.includes("meat") && !name.includes("kitfo") && !name.includes("tibs");
    });

    const resetCheckoutState = () => {
        setServiceType("indoor");
        setRoomNumber("");
        setMapsUrl("");
        setGovtIdFile(null);
        setReceiptFile(null);
        setGuestName("");
        setGuestPhone("");
        setSubmitting(false);
    };

    const openCheckout = () => {
        if (Object.keys(cart).length === 0) return;
        setIsCheckoutOpen(true);
    };

    const closeCheckout = () => {
        setIsCheckoutOpen(false);
        resetCheckoutState();
    };

    const cartItems = menuItems.filter(item => cart[item.id] > 0);
    const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.price * cart[item.id]), 0);

    const updateCart = (id: string, delta: number) => {
        setCart(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            const newCart = { ...prev };
            if (next === 0) delete newCart[id];
            else newCart[id] = next;
            return newCart;
        });
    };

    const submitOrder = async () => {
        if (cartItems.length === 0) return;
        if (submitting) return;

        if (serviceType === "indoor") {
            if (!roomNumber.trim()) {
                alert("Room Number is required for indoor service.");
                return;
            }
            if (status !== "authenticated") {
                router.push(`/login?callbackUrl=${encodeURIComponent("/order-food")}`);
                return;
            }
        }

        if (serviceType === "outdoor") {
            if (!mapsUrl.trim()) {
                alert("Google Maps URL is required for outdoor delivery.");
                return;
            }

            if (serviceType === "outdoor" && status !== "authenticated") {
                if (!guestName.trim() || !guestPhone.trim()) {
                    alert("Guest Name and Phone Number are required for outdoor delivery.");
                    return;
                }
            }

            if (!receiptFile) {
                alert("Please upload your payment receipt screenshot to proceed.");
                return;
            }
            if (!identityVerified && !govtIdFile) {
                alert("Please upload your identity document to proceed.");
                return;
            }
        }

        setSubmitting(true);

        try {
            // Aggregate all cart items into a single order string to match existing DB.
            const combinedDishNames = cartItems.map(item => `${item.name} (x${cart[item.id]})`).join(", ");
            const totalQuantity = cartItems.reduce((sum, item) => sum + cart[item.id], 0);

            const data = new FormData();
            data.append("dishName", combinedDishNames);
            data.append("quantity", "1"); // We treat the whole cart as 1 bundled order item in the DB
            data.append("unitPrice", String(totalCartPrice));
            data.append("order_type", serviceType === "indoor" ? "INDOOR" : "OUTDOOR");

            if (serviceType === "indoor") {
                data.append("delivery_details", `Room ${roomNumber.trim()}`);
            } else {
                data.append("delivery_details", mapsUrl.trim());
                data.append("maps_url", mapsUrl.trim());
                if (guestName.trim()) data.append("guest_name", guestName.trim());
                if (guestPhone.trim()) data.append("guest_phone", guestPhone.trim());
                if (receiptFile) data.append("receipt_image", receiptFile);
                if (govtIdFile) data.append("govt_id", govtIdFile);
            }

            const endpoint = serviceType === "indoor" ? "/api/orders" : "/api/orders/delivery-request";
            const res = await fetch(endpoint, {
                method: "POST",
                credentials: "include",
                body: data,
            });

            const result = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(result?.error || "Failed to place order");
                return;
            }

            // show local overlay/message instead of navigating off-page
            setOrderSuccess({ quantity: totalQuantity, dishName: combinedDishNames });
            // clear checkout modal & cart
            setIsCheckoutOpen(false);
            setCart({});
            resetCheckoutState();
        } catch (error) {
            console.error("Order Error:", error);
            alert("An error occurred while placing your order.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <span className="bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase">
                        Ethiopian Gourmet
                    </span>
                    <h1 className="text-6xl font-serif text-slate-900 mt-4 mb-6">The Palace Menu</h1>
                    <p className="text-xl text-slate-600 italic">Tradition in every bite, elegance in every dish.</p>
                </div>

                {/* Categories Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Menu Categories</h2>
                    <p className="text-slate-500 mb-8">Explore our signature platters, premium meats, and refreshing drinks.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Signature Platters */}
                        <div
                            onClick={() => setActiveCategory("signature")}
                            className={`p-8 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${activeCategory === "signature" ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}
                        >
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</span>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">Signature Platters</h3>
                            <p className="text-slate-400 italic mt-2">Beyaynetu, Doro Wat</p>
                        </div>

                        {/* Meat Dishes */}
                        <div
                            onClick={() => setActiveCategory("meat")}
                            className={`p-8 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${activeCategory === "meat" ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}
                        >
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</span>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">Meat Dishes</h3>
                            <p className="text-slate-400 italic mt-2">Tibs, Kitfo</p>
                        </div>

                        {/* Drinks */}
                        <div
                            onClick={() => setActiveCategory("drinks")}
                            className={`p-8 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer ${activeCategory === "drinks" ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"}`}
                        >
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Category</span>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">Drinks</h3>
                            <p className="text-slate-400 italic mt-2">Hot & Cold</p>
                        </div>
                    </div>
                </div>
            </div>
            <main className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-serif italic text-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl">
                        Preparing the Palace Selection...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredMenuItems.map((item) => (
                            <motion.div key={item.id} whileHover={{ y: -10 }}>
                                <Card className="h-full border-0 shadow-2xl bg-white rounded-3xl overflow-hidden group flex flex-col">
                                    <div className="h-48 relative overflow-hidden bg-slate-100 flex-shrink-0">
                                        {item.image_url ? (
                                            <Image
                                                src={item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.srcset = "";
                                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2'/%3E%3Cpath d='M7 2v20'/%3E%3Cpath d='M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'/%3E%3C/svg%3E";
                                                }}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                <Utensils className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
                                            <span className="text-amber-600 font-bold">{item.price} ETB</span>
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <div className="flex justify-between items-center mb-1">
                                            <Badge variant="outline" className="text-[8px] uppercase tracking-tighter bg-amber-50 text-amber-600 border-amber-100">{item.category}</Badge>
                                        </div>
                                        <CardTitle className="text-xl font-serif font-bold text-slate-900">{item.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className="text-slate-500 text-sm leading-relaxed h-12 overflow-hidden italic line-clamp-2">{item.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                                                <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> 25-35 min</div>
                                                <div className="flex items-center gap-1 text-amber-500"><Star className="w-3 h-3 fill-amber-500" /> 4.9 (120+)</div>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between border border-slate-100 rounded-xl p-1 bg-slate-50">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateCart(item.id, -1); }}
                                                className="w-10 h-10 rounded-lg bg-white flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm font-bold disabled:opacity-50"
                                                disabled={!cart[item.id]}
                                            >
                                                -
                                            </button>
                                            <span className="font-bold w-8 text-center text-slate-900">{cart[item.id] || 0}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateCart(item.id, 1); }}
                                                className="w-10 h-10 rounded-lg bg-white flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors shadow-sm font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
                {!loading && menuItems.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-serif italic text-2xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl">
                        Our chefs are currently refining the selection. Please check back soon.
                    </div>
                )}

                {/* Floating Checkout Button */}
                <AnimatePresence>
                    {Object.keys(cart).length > 0 && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
                        >
                            <button
                                onClick={openCheckout}
                                className="w-full flex items-center justify-between bg-slate-900 text-white rounded-full p-2 pl-6 pr-2 shadow-2xl hover:scale-105 transition-all"
                            >
                                <span className="font-bold flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    {cartItems.reduce((acc, i) => acc + cart[i.id], 0)} Items
                                </span>
                                <span className="bg-amber-500 text-slate-900 font-bold px-6 py-3 rounded-full">
                                    Checkout · {totalCartPrice} ETB
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Service Choice Modal */}
            <AnimatePresence>
                {isCheckoutOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md"
                        onClick={closeCheckout}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}
                            className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close */}
                            <button
                                onClick={closeCheckout}
                                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col max-h-[70vh]">
                                <div className="overflow-y-auto px-1 pr-2 space-y-6 pb-4">
                                    <div className="text-center mb-6">
                                        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <ChefHat className="w-7 h-7 text-amber-600" />
                                        </div>
                                        <h2 className="text-2xl font-serif font-bold text-slate-900">Complete Your Order</h2>
                                    </div>

                                    {/* Cart Summary Header */}
                                    <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex justify-between items-center text-sm mb-2 last:mb-0">
                                                <span className="font-bold text-slate-700">{cart[item.id]}x {item.name}</span>
                                                <span className="text-slate-500">{item.price * cart[item.id]} ETB</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-bold">
                                            <span>Total:</span>
                                            <span className="text-amber-600">{totalCartPrice} ETB</span>
                                        </div>
                                        {serviceType === "indoor" && roomNumber && (
                                            <div className="mt-3 pt-3 border-t-2 border-amber-200 flex flex-col items-center bg-amber-50 -mx-4 px-4 py-3 rounded-xl ring-2 ring-amber-400/20 shadow-inner">
                                                <span className="text-[10px] uppercase tracking-[0.2em] text-amber-600 font-extrabold mb-1">Assigned Delivery Point</span>
                                                <span className="text-amber-900 font-black text-2xl tracking-tight">Room {roomNumber}</span>
                                                <p className="text-[9px] text-amber-500 font-bold mt-1 uppercase">Verified Stay Account</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <Label className="text-slate-700 font-bold text-sm">Delivery Location</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => setServiceType("indoor")}
                                                className={`h-14 rounded-2xl border-2 transition-all font-bold flex items-center justify-center gap-2 ${serviceType === "indoor" ? "border-amber-400 bg-amber-50 text-slate-900" : "border-slate-100 bg-white text-slate-700 hover:bg-slate-50"}`}
                                                type="button"
                                            >
                                                <Home className="w-5 h-5" />
                                                🏨 Room
                                            </button>
                                            <button
                                                onClick={() => setServiceType("outdoor")}
                                                className={`h-14 rounded-2xl border-2 transition-all font-bold flex items-center justify-center gap-2 ${serviceType === "outdoor" ? "border-blue-400 bg-blue-50 text-slate-900" : "border-slate-100 bg-white text-slate-700 hover:bg-slate-50"}`}
                                                type="button"
                                            >
                                                <Car className="w-5 h-5" />
                                                🚗 Outdoor
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        {serviceType === "indoor" ? (
                                            <div className="space-y-2">
                                                <Label className="text-slate-700 font-bold text-sm">Room Number</Label>
                                                <Input
                                                    placeholder="e.g. 402"
                                                    value={roomNumber}
                                                    onChange={(e) => setRoomNumber(e.target.value)}
                                                    className="h-12 rounded-xl border-slate-200"
                                                />
                                                <div className="text-xs text-slate-400">Indoor checkout only requires a room number.</div>
                                            </div>
                                        ) : (
                                            <>
                                                {status !== "authenticated" && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-700 font-bold text-sm">Your Name</Label>
                                                            <Input
                                                                placeholder="Guest Name"
                                                                value={guestName}
                                                                onChange={(e) => setGuestName(e.target.value)}
                                                                className="h-12 rounded-xl border-slate-200"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-700 font-bold text-sm">Phone No.</Label>
                                                            <Input
                                                                placeholder="Phone"
                                                                value={guestPhone}
                                                                onChange={(e) => setGuestPhone(e.target.value)}
                                                                className="h-12 rounded-xl border-slate-200"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <Label className="text-slate-700 font-bold text-sm">Google Maps URL</Label>
                                                    <Input
                                                        placeholder="https://maps.google.com/..."
                                                        value={mapsUrl}
                                                        onChange={(e) => setMapsUrl(e.target.value)}
                                                        className="h-12 rounded-xl border-slate-200"
                                                    />
                                                    <div className="text-xs text-slate-400">Required for outdoor delivery.</div>
                                                </div>

                                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-blue-900 font-bold text-sm">Required Verification Files</Label>
                                                        <p className="text-[10px] text-blue-600 uppercase font-bold tracking-tight">Upload both Identification and Payment Receipt</p>
                                                    </div>

                                                    {!identityVerified && (
                                                        <div className="space-y-2">
                                                            <Label className="text-slate-700 font-bold text-xs">1. Identity Document</Label>
                                                            <FileUploadInline file={govtIdFile} onChange={setGovtIdFile} />
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label className="text-slate-700 font-bold text-xs">{identityVerified ? "1. Payment Receipt" : "2. Payment Receipt"}</Label>
                                                        <FileUploadInline file={receiptFile} onChange={setReceiptFile} />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 border-t border-slate-100 flex-shrink-0">
                                    <Button
                                        luxury
                                        className={`w-full h-14 rounded-2xl text-base shadow-xl ${serviceType === "outdoor" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20" : "bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-amber-500/20"}`}
                                        onClick={submitOrder}
                                        disabled={submitting}
                                        type="button"
                                    >
                                        {submitting ? "Placing Order…" : `Order Now (${totalCartPrice} ETB)`}
                                    </Button>
                                    <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
                                        Secure Palace Verification
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* order success overlay */}
            <AnimatePresence>
                {orderSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md"
                        onClick={() => setOrderSuccess(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-serif font-bold mb-4">Congratulations!</h2>
                            <p className="text-lg text-slate-700 mb-6">
                                {serviceType === "outdoor"
                                    ? "Wait for manual check. We will contact you shortly."
                                    : "Congratulations! Your order was successfully placed."}
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setOrderSuccess(null)}
                                    className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                                >
                                    Close Menu
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}

function FileUploadInline({ file, onChange }: { file: File | null; onChange: (f: File | null) => void; }) {
    return (
        <div className="relative">
            <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => onChange(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
            />
            {file && (
                <div className="mt-2 text-xs text-slate-500 font-semibold">Selected: {file.name}</div>
            )}
        </div>
    );
}
