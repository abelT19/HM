"use client";

// The component at the end of the file will wrap the newly created DeliverySignupContent:


import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, Car, MapPin, User, Phone, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function FileUploadZone({ file, onChange, label, hint }: {
    file: File | null;
    onChange: (f: File) => void;
    label: string;
    hint: string;
}) {
    return (
        <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-7 text-center transition-colors cursor-pointer relative bg-slate-50">
            <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => { if (e.target.files?.[0]) onChange(e.target.files[0]); }}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
            />
            {file ? (
                <div className="flex items-center justify-center gap-3 text-blue-600 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    {file.name}
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Upload className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-slate-700 font-semibold text-sm">{label}</p>
                    <p className="text-slate-400 text-xs">{hint}</p>
                </div>
            )}
        </div>
    );
}

function DeliverySignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dish = searchParams.get("dish") || "";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        guest_name: "",
        guest_phone: "",
        quantity: 1,
        maps_url: "",
        govt_id: null as File | null,
        receipt_image: null as File | null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.govt_id || !formData.receipt_image) {
            setError("Please upload both your Government ID and Payment Receipt.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("guest_name", formData.guest_name);
            data.append("guest_phone", formData.guest_phone);
            data.append("dishName", dish);
            data.append("quantity", formData.quantity.toString());
            data.append("maps_url", formData.maps_url);
            data.append("govt_id", formData.govt_id);
            data.append("receipt_image", formData.receipt_image);

            const res = await fetch("/api/orders/delivery-request", {
                method: "POST",
                body: data,
            });

            if (res.ok) {
                router.push("/order-food/success?type=outdoor");
            } else {
                const err = await res.json();
                setError(err.error || "Failed to submit your order. Please try again.");
            }
        } catch {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-16 px-6">
            <div className="max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Security Gate Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">Delivery Verification</h1>
                        <p className="text-slate-500 mt-2 text-sm">
                            Ordering: <span className="text-blue-600 font-bold">{dish || "Selected Dish"}</span>
                        </p>
                    </div>

                    {/* Info Banner */}
                    <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 mb-8">
                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="text-blue-800 text-sm leading-relaxed">
                            <strong>Outdoor Delivery Security Gate.</strong> For your safety and ours, we verify all outdoor delivery orders. Your details will be reviewed by our receptionist before dispatch.
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-[2rem] shadow-xl p-8 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Name + Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-bold text-sm">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="Your full name"
                                            value={formData.guest_name}
                                            onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                                            className="pl-10 h-12 rounded-xl border-slate-200"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-bold text-sm">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="+251 9..."
                                            value={formData.guest_phone}
                                            onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                                            className="pl-10 h-12 rounded-xl border-slate-200"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold text-sm">Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    className="h-12 rounded-xl border-slate-200"
                                />
                            </div>

                            {/* Google Maps */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold text-sm">Google Maps Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="https://maps.google.com/... or your address"
                                        value={formData.maps_url}
                                        onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
                                        className="pl-10 h-12 rounded-xl border-slate-200"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-slate-400">Share your Google Maps link or type your full delivery address.</p>
                            </div>

                            {/* Government ID */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold text-sm">Government ID <span className="text-rose-500">*</span></Label>
                                <FileUploadZone
                                    file={formData.govt_id}
                                    onChange={(f) => setFormData({ ...formData, govt_id: f })}
                                    label="Upload Government ID"
                                    hint="National ID, Passport, or Driver's License"
                                />
                            </div>

                            {/* Payment Receipt */}
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold text-sm">Payment Receipt <span className="text-rose-500">*</span></Label>
                                <FileUploadZone
                                    file={formData.receipt_image}
                                    onChange={(f) => setFormData({ ...formData, receipt_image: f })}
                                    label="Upload Bank Transfer Receipt"
                                    hint="CBE, Awash Bank, Telebirr — screenshot of transfer"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        <Car className="w-5 h-5" /> Submit Delivery Request
                                    </>
                                )}
                            </button>

                            <p className="text-center">
                                <Link href="/order-food" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                                    ← Back to Menu
                                </Link>
                            </p>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function DeliverySignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen py-16 text-center text-slate-500">Loading delivery form...</div>}>
            <DeliverySignupContent />
        </Suspense>
    );
}
