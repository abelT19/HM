"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    Waves,
    Search,
    CheckCircle2,
    Receipt,
    Clock,
    User,
    ExternalLink,
    Filter,
    Trash2,
    Settings2
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function MembershipRegistryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "authenticated") {
            const role = (session?.user as any)?.role;
            if (role === "GUEST" || role === "USER") {
                router.push("/dashboard");
            } else {
                fetchMemberships();
            }
        } else if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, session]);

    const fetchMemberships = async () => {
        try {
            const res = await fetch("/api/memberships");
            if (res.ok) {
                const data = await res.json();
                setMemberships(data);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch("/api/memberships/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                setMemberships((prev: any) => prev.map((m: any) =>
                    m.id === id ? { ...m, status: 'APPROVED' } : m
                ));
            } else {
                alert("Approval failed");
            }
        } catch (error) {
            console.error("Approval Error:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this membership?")) return;
        try {
            const res = await fetch(`/api/memberships/delete?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setMemberships((prev) => prev.filter((m: any) => m.id !== id));
            } else {
                const err = await res.json();
                alert(err.error || "Deletions restricted to Administrators.");
            }
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-serif italic">Accessing Digital Registry...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <Badge className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold border-0 text-xs">
                        {memberships.filter((m: any) => m.status === 'PENDING').length} PENDING APPLICATIONS
                    </Badge>
                    <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight">Membership Registry</h1>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            placeholder="Search Member ID or Name..."
                            className="h-14 pl-12 pr-6 bg-white border-0 shadow-sm rounded-2xl w-80 text-sm focus:ring-2 focus:ring-amber-500 transition-all"
                        />
                    </div>
                    <Button variant="outline" className="h-14 w-14 rounded-2xl bg-white border-0 shadow-sm hover:bg-slate-50">
                        <Filter className="w-5 h-5 text-slate-600" />
                    </Button>
                </div>
            </header>

            {memberships.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-32 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Waves className="w-10 h-10 text-slate-200" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900">Digital Registry Empty</h2>
                    <p className="text-slate-400 mt-2">No membership applications recorded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {memberships.map((member: any) => (
                        <Card key={member.id} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] overflow-hidden bg-white">
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <Badge className={`px-4 py-1.5 rounded-full font-bold text-[10px] tracking-widest border-0 ${member.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-500 text-white'
                                        }`}>
                                        {member.status}
                                    </Badge>
                                    <span className="text-amber-600 font-bold font-mono text-sm">{member.membershipId}</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
                                            <User className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{member.user_name}</h3>
                                            <p className="text-slate-400 text-sm">{member.user_email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Plan Type</p>
                                            <p className="text-slate-700 font-bold">{member.type}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Applied On</p>
                                            <p className="text-slate-700 font-bold">{new Date(member.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <a
                                            href={member.receipt_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-amber-50 group transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Receipt className="w-5 h-5 text-amber-500" />
                                                <span className="text-slate-600 font-bold text-sm">View Bank Receipt</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                                        </a>

                                        {member.status === 'PENDING' ? (
                                            <Button
                                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-sm"
                                                onClick={() => handleApprove(member.id)}
                                            >
                                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                                Approve Membership
                                            </Button>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold italic text-sm">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Identity Document Verified
                                                </div>

                                                {/* Admin Only Actions */}
                                                {(session?.user as any)?.role === "ADMIN" && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
                                                            onClick={() => alert("Membership Level Change Coming Soon...")}
                                                        >
                                                            <Settings2 className="w-4 h-4 mr-2" />
                                                            Level Up
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="h-12 w-12 border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-xl"
                                                            onClick={() => handleDelete(member.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
