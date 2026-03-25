"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Shield, Mail, UserCog, Users2, PowerOff, Plus, X, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "ACTIVE" | "REVOKED";
};

interface UsersClientProps {
    initialUsers: User[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "RECEPTIONIST"
    });

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch("/api/admin/staff/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                signal: controller.signal
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Staff member added successfully");
                // Update local state instead of full refresh for speed
                const newUser = {
                    id: data.userId || Math.random().toString(),
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    status: "ACTIVE" as const
                };
                setUsers([newUser, ...users]);
                setShowAddModal(false);
                setFormData({ name: "", email: "", password: "", role: "RECEPTIONIST" });
            } else {
                toast.error(data.error || "Failed to add staff");
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                toast.error("Request Timeout", { description: "Staff registration is taking too long." });
            } else {
                toast.error("An error occurred. Please try again.");
            }
        } finally {
            clearTimeout(timeoutId);
            setIsSubmitting(false);
        }
    };

    const handleRevokeAccess = async (userId: string) => {
        if (!confirm("Are you sure you want to REVOKE access?")) return;

        try {
            const res = await fetch("/api/admin/staff/revoke", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            });
            if (res.ok) {
                toast.success("Access Revoked Successfully");
                setUsers(users.map(u => u.id === userId ? { ...u, status: "REVOKED" as const } : u));
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to revoke access");
            }
        } catch {
            toast.error("Failed to revoke access");
        }
    };

    const handleRestoreAccess = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to restore access for ${userName}?`)) return;

        try {
            const res = await fetch("/api/admin/users/toggle-access", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, targetStatus: "ACTIVE" })
            });

            if (res.ok) {
                toast.success("Access Restored Successfully");
                setUsers(users.map(u => u.id === userId ? { ...u, status: "ACTIVE" as const } : u));
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to restore access");
            }
        } catch {
            toast.error("Failed to restore access");
        }
    };

    const activeAdmins = users.filter(u => u.role === "ADMIN" && u.status === "ACTIVE");
    const activeStaff = users.filter(u => u.role === "RECEPTIONIST" && u.status === "ACTIVE");
    const revokedUsers = users.filter(u => u.status === "REVOKED");

    return (
        <>
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Users2 className="w-10 h-10 text-indigo-600" />
                        <h1 className="text-4xl font-serif font-bold text-slate-900">Staff Management</h1>
                    </div>
                    <p className="text-slate-600 text-lg">Manage user accounts, roles, and system access</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="rounded-full px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 transition-all flex items-center gap-2 text-lg font-bold"
                >
                    <Plus className="w-6 h-6" />
                    Add Staff Member
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatsCard label="Administrators" count={activeAdmins.length} color="red" icon={Shield} />
                <StatsCard label="Receptionists" count={activeStaff.length} color="blue" icon={UserCog} />
                <StatsCard label="Revoked Access" count={revokedUsers.length} color="slate" icon={PowerOff} />
            </div>

            <div className="space-y-16">
                <StaffSection title="Administrators" color="red" members={activeAdmins} onRevoke={handleRevokeAccess} onRestore={handleRestoreAccess} />
                <StaffSection title="Receptionist Access" color="blue" members={activeStaff} onRevoke={handleRevokeAccess} onRestore={handleRestoreAccess} />
                {revokedUsers.length > 0 && (
                    <StaffSection title="Access Revoked" color="slate" members={revokedUsers} onRevoke={handleRevokeAccess} onRestore={handleRestoreAccess} isRevoked />
                )}
            </div>

            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
                            <div className="bg-indigo-600 p-8 text-white relative">
                                <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3 mb-2">
                                    <UserCog className="w-5 h-5 text-indigo-200" />
                                    <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Administration</span>
                                </div>
                                <h2 className="text-3xl font-serif font-bold">Add Staff</h2>
                            </div>

                            <form onSubmit={handleAddStaff} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <InputWithIcon icon={Users2} placeholder="Full Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                                    <InputWithIcon icon={Mail} type="email" placeholder="Email Address" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} />
                                    <InputWithIcon icon={Lock} type="password" placeholder="Temporary Password" value={formData.password} onChange={v => setFormData({ ...formData, password: v })} />
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <select
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none bg-white text-slate-700 font-sans font-medium"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="RECEPTIONIST">Receptionist</option>
                                            <option value="ADMIN">Administrator</option>
                                        </select>
                                    </div>
                                </div>
                                <Button disabled={isSubmitting} type="submit" className="w-full py-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-3 text-lg font-bold shadow-xl transition-all">
                                    {isSubmitting ? "Processing..." : "Create Account"}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function StatsCard({ label, count, color, icon: Icon }: any) {
    const gradients: any = {
        red: "from-red-500 to-rose-600",
        blue: "from-blue-500 to-cyan-600",
        slate: "from-slate-600 to-slate-800"
    };
    return (
        <Card className={`bg-gradient-to-br ${gradients[color]} text-white border-0 shadow-xl`}>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">{label}</p>
                        <p className="text-5xl font-bold">{count}</p>
                    </div>
                    <Icon className="w-12 h-12 opacity-30" />
                </div>
            </CardContent>
        </Card>
    );
}

function StaffSection({ title, color, members, onRevoke, onRestore, isRevoked }: any) {
    const bgColors: any = { red: "bg-red-500", blue: "bg-blue-500", slate: "bg-slate-300" };
    return (
        <section className={isRevoked ? "opacity-90" : ""}>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className={`h-8 w-1 ${bgColors[color]} rounded-full`} />
                {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {members.map((user: any) => (
                    <StaffCard key={user.id} user={user} onRevoke={onRevoke} onRestore={onRestore} />
                ))}
            </div>
        </section>
    );
}

function StaffCard({ user, onRevoke, onRestore }: { user: User, onRevoke: (id: string) => void, onRestore: (id: string, name: string) => void }) {
    const { data: session } = useSession();
    const isAdmin = (session as any)?.user?.role === "ADMIN";
    const isActive = user.status === "ACTIVE";
    const colorClass = user.role === "ADMIN" ? "red" : "blue";

    return (
        <Card className={`bg-white shadow-xl border-none overflow-hidden hover:shadow-2xl transition-all duration-300 relative group`}>
            <div className={`h-2 ${user.role === 'ADMIN' ? 'bg-red-500' : 'bg-blue-500'} w-full`} />
            <CardHeader className="pt-8">
                <div className="flex items-start justify-between mb-4">
                    <div className={`h-16 w-16 rounded-2xl ${user.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'} flex items-center justify-center font-bold text-3xl border-2 shadow-sm`}>
                        {user.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Badge className={`${user.role === 'ADMIN' ? 'bg-red-500' : 'bg-blue-500'} text-white px-3 py-1`}>
                            {user.role}
                        </Badge>
                        {isActive ? (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Active
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Revoked</Badge>
                        )}
                    </div>
                </div>
                <CardTitle className="text-2xl font-serif text-slate-900">{user.name}</CardTitle>
                <div className="flex items-center gap-2 text-base text-slate-500 mt-3 font-medium">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                </div>
            </CardHeader>
            <CardContent className="pb-8 pt-4">
                {isActive ? (
                    isAdmin && (
                        <Button
                            onClick={() => onRevoke(user.id)}
                            variant="outline"
                            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl py-6 font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <PowerOff className="w-4 h-4" />
                            Revoke Access
                        </Button>
                    )
                ) : (
                    isAdmin && (
                        <Button
                            onClick={() => onRestore(user.id, user.name)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-6 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Restore Access
                        </Button>
                    )
                )}
            </CardContent>
        </Card>
    );
}

function InputWithIcon({ icon: Icon, type = "text", placeholder, value, onChange }: any) {
    return (
        <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
                required
                type={type}
                placeholder={placeholder}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
