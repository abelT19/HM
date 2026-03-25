"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Save, Building2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import Link from "next/link";

export default function EditRoomPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        roomNumber: "",
        type: "SINGLE",
        price: 0,
        capacity: 2,
        status: "AVAILABLE"
    });

    useEffect(() => {
        if (authStatus === "loading") return;
        if (!session || (session.user as any)?.role !== "ADMIN") {
            router.push("/dashboard");
            return;
        }

        fetch(`/api/rooms/${params.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    toast.error(data.error);
                    router.push("/dashboard/rooms");
                } else {
                    setFormData({
                        roomNumber: data.roomNumber,
                        type: data.type,
                        price: data.price,
                        capacity: data.capacity || 2,
                        status: data.status
                    });
                }
            })
            .catch(err => {
                console.error("Fetch error:", err);
                toast.error("Failed to load room details");
            })
            .finally(() => setIsLoading(false));
    }, [session, authStatus, params.id, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const response = await fetch("/api/rooms", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: params.id,
                    ...formData
                })
            });

            if (response.ok) {
                toast.success("Room configuration updated!");
                router.push("/dashboard/rooms");
                router.refresh();
            } else {
                const err = await response.json();
                toast.error(err.error || "Update failed");
            }
        } catch (error) {
            toast.error("Network error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Link href="/dashboard/rooms" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Registry</span>
            </Link>

            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/20">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-4xl font-serif font-bold text-slate-900">Edit Suite {formData.roomNumber}</h1>
                            <Sparkles className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-slate-500 font-medium tracking-wide">Adjusting the configuration for our premium unit</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden glass-card">
                        <CardHeader className="bg-slate-900 text-white p-8">
                            <CardTitle className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-amber-500" />
                                <span className="text-sm font-bold uppercase tracking-[0.2em]">Management Access Only</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Room Number</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif text-xl font-bold"
                                            value={formData.roomNumber}
                                            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Price per Night (ETB)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif text-xl font-bold"
                                            value={isNaN(formData.price) ? "" : formData.price}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, price: val === "" ? 0 : parseFloat(val) });
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Room Category</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold text-sm tracking-widest appearance-none cursor-pointer"
                                            value={formData.type}
                                            onChange={(e) => {
                                                const newType = e.target.value;
                                                const capacityMap: Record<string, number> = {
                                                    'SINGLE': 2,
                                                    'DOUBLE': 4,
                                                    'FAMILY': 5,
                                                    'PRESIDENTIAL': 6
                                                };
                                                const priceMap: Record<string, number> = {
                                                    'SINGLE': 2000,
                                                    'DOUBLE': 4000,
                                                    'FAMILY': 4500,
                                                    'PRESIDENTIAL': 6000
                                                };
                                                setFormData({ 
                                                    ...formData, 
                                                    type: newType, 
                                                    capacity: capacityMap[newType] || formData.capacity,
                                                    price: priceMap[newType] || formData.price
                                                });
                                            }}
                                        >
                                            <option value="SINGLE">SINGLE SUITE</option>
                                            <option value="DOUBLE">DOUBLE LUXE</option>
                                            <option value="FAMILY">FAMILY PALACE</option>
                                            <option value="PRESIDENTIAL">PRESIDENTIAL</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Max Occupancy (Guests)</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="10"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif text-xl font-bold"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Current Status</label>
                                        <select
                                            className={`w-full border rounded-2xl p-4 focus:outline-none focus:ring-2 transition-all font-bold text-sm tracking-widest appearance-none cursor-pointer ${formData.status === 'AVAILABLE'
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-500/20'
                                                : 'bg-rose-50 border-rose-200 text-rose-700 focus:ring-rose-500/20'
                                                }`}
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="AVAILABLE">AVAILABLE FOR BOOKING</option>
                                            <option value="OCCUPIED">OCCUPIED / MAINTENANCE</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end pb-2">
                                        <p className="text-[10px] text-slate-400 italic">
                                            * Policy Rules: Single=2, Double=4, Family=5, Presidential=6
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    disabled={isSaving}
                                    type="submit"
                                    className="w-full py-8 mt-4 rounded-[1.5rem] bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest shadow-2xl transition-all active:scale-95 shadow-slate-900/20"
                                >
                                    {isSaving ? "Updating Inventory..." : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Update Configuration
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-xl rounded-2xl bg-amber-50/50 p-6 border-amber-100 flex flex-col gap-4">
                        <div className="w-10 h-10 bg-amber-600/10 rounded-full flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900">Premium Standard</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Updates reflect instantly in the public hotel catalog. Ensure pricing and availability match real-time operations.
                        </p>
                    </Card>

                    <div className="rounded-2xl overflow-hidden relative group aspect-square">
                        <img
                            src="https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=1974&auto=format&fit=crop"
                            alt="Luxury Interior"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
                            <p className="text-white text-[10px] font-bold uppercase tracking-widest opacity-80">Palace Standard Interior</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
