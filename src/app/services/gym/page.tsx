"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Upload, Waves, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const MEMBERSHIP_TYPES = [
    { id: "Monthly", label: "Monthly Pass", price: "$49", description: "Perfect for a quick fitness boost" },
    { id: "Quarterly", label: "Quarterly Pass", price: "$129", description: "Best value for seasonal training" },
    { id: "Yearly", label: "Annual Excellence", price: "$449", description: "Full access to all luxury wellness facilities" },
];

export default function MembershipFormPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: "Monthly",
        receipt_image: null as File | null
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== "authenticated") return;
        if (!formData.receipt_image) {
            alert("Please upload your bank receipt to proceed.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("type", formData.type);
            data.append("receipt_image", formData.receipt_image);

            const res = await fetch("/api/memberships", {
                method: "POST",
                credentials: "include",
                body: data
            });

            if (res.ok) {
                const result = await res.json();
                router.push(`/services/gym/success?id=${result.membershipId}`);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to submit application");
            }
        } catch (error) {
            console.error("Membership Error:", error);
            alert("An error occurred while submitting your application.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-0 shadow-2xl rounded-[2.5rem] p-10 text-center bg-white">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Lock className="w-10 h-10 text-amber-600" />
                    </div>
                    <CardTitle className="text-3xl font-serif font-bold text-slate-900 mb-2">Login Required</CardTitle>
                    <p className="text-slate-500 mb-10 italic">Please sign in to apply for a Gym & Swim membership.</p>
                    <Button
                        luxury
                        className="w-full h-14 rounded-2xl text-lg shadow-xl shadow-amber-500/20"
                        onClick={() => router.push("/login?callbackUrl=/services/gym")}
                    >
                        Go to Login
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-slate-400 hover:text-amber-600 mb-8 transition-colors group">
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Left: Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                            <Waves className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5" />
                            <h2 className="text-3xl font-serif font-bold mb-4">Wellness Pass</h2>
                            <p className="text-slate-300 mb-8 leading-relaxed">
                                Join our exclusive wellness community. Experience the peak of physical and mental rejuvenation.
                            </p>
                            <ul className="space-y-4">
                                {["Infinity Pool Access", "Modern TechnoGym Equipment", "Traditional Sauna & Steam", "Luxury Locker Rooms"].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <Card className="lg:col-span-3 border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="p-10 text-center bg-slate-50/50">
                            <CardTitle className="text-3xl font-serif font-bold text-slate-900">Membership Application</CardTitle>
                            <p className="text-slate-500 mt-2 italic">Select your plan and verify payment</p>
                        </CardHeader>
                        <CardContent className="p-10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-slate-700 font-bold block mb-4">Membership Type</Label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {MEMBERSHIP_TYPES.map((type) => (
                                            <div
                                                key={type.id}
                                                onClick={() => setFormData({ ...formData, type: type.id })}
                                                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative group ${formData.type === type.id
                                                        ? "border-amber-500 bg-amber-50/50"
                                                        : "border-slate-100 hover:border-amber-200 bg-white"
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-slate-900">{type.label}</h3>
                                                    <span className="text-amber-600 font-bold font-serif">{type.price}</span>
                                                </div>
                                                <p className="text-slate-500 text-xs">{type.description}</p>
                                                {formData.type === type.id && (
                                                    <div className="absolute top-4 right-4 text-amber-500">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-slate-700 font-bold">Bank Receipt (Screenshot)</Label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-amber-500 transition-colors cursor-pointer relative bg-slate-50">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({ ...formData, receipt_image: e.target.files?.[0] || null })}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            required
                                        />
                                        {formData.receipt_image ? (
                                            <div className="flex items-center justify-center gap-3 text-emerald-600 font-bold">
                                                <CheckCircle2 className="w-6 h-6" />
                                                {formData.receipt_image.name}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                                    <Upload className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p className="text-slate-500 text-sm">Upload payment confirmation</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 text-center">Your Membership ID will be generated upon submission.</p>
                                </div>

                                <Button luxury className="w-full h-16 rounded-2xl text-xl shadow-xl shadow-amber-500/20" disabled={loading}>
                                    {loading ? "Processing..." : "Join the Wellness Club"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
