"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Mail, Shield, ShieldCheck, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function GuestProfile() {
    const { data: session } = useSession();
    const user = session?.user as any;

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
            <header>
                <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight mb-2">My Profile</h1>
                <p className="text-slate-500">Manage your personal palatial details and preferences.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1 glass-card border-none shadow-xl rounded-[2rem] overflow-hidden">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <User className="w-16 h-16 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.name || "Guest"}</h2>
                        <Badge variant="success" className="uppercase tracking-widest text-[10px] py-1 px-4 rounded-full shadow-sm">
                            {user?.role || "CUSTOMER"}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 glass-card border-none shadow-xl rounded-[2rem] overflow-hidden">
                    <CardHeader className="border-b border-slate-50 pb-6">
                        <CardTitle className="text-xl font-serif flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            Account Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <Mail className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address</p>
                                <p className="text-slate-900 font-semibold">{user?.email || "N/A"}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-xl">
                                <MapPin className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Residence</p>
                                <p className="text-slate-900 font-semibold italic text-slate-400">Not provided</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-amber-600">
                                <Shield className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Identity Member</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
