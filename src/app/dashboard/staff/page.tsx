"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LayoutDashboard, BedDouble, ConciergeBell, PlusCircle, Users } from "lucide-react";

export default function StaffDashboard() {
    const { data: session } = useSession();

    // Force TypeScript to treat user as 'any' to allow the .role property
    const user = session?.user as any;
    // Role checks
    const isAdmin = user?.role === "ADMIN";

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
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

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Premium Background Layer */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop"
                    alt="Dashboard Background"
                    fill
                    loading="lazy"
                    className="object-cover opacity-10 scale-105"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/50" />
            </div>

            <div className="relative z-10 p-8 max-w-7xl mx-auto min-h-screen">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <LayoutDashboard className="w-6 h-6 text-primary" />
                            </div>
                            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
                                Management Hub
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-lg">
                            Welcome back, <span className="font-semibold text-slate-900">{user?.name || 'Staff Member'}</span>
                        </p>
                    </div>
                    <Badge variant={isAdmin ? "destructive" : "success"} className="px-4 py-1.5 text-sm uppercase tracking-widest shadow-sm">
                        {user?.role || "Active"}
                    </Badge>
                </motion.header>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {/* STAFF CARDS */}
                    <motion.div variants={itemVariants}>
                        <Link href="/dashboard/rooms" className="block h-full">
                            <Card className="h-full glass-card hover:shadow-2xl transition-all duration-500 cursor-pointer border-l-4 border-l-primary hover:border-l-8 hover:-translate-y-2 group relative overflow-hidden">
                                <CardHeader>
                                    <div className="text-4xl mb-4 p-3 bg-primary/10 w-fit rounded-xl text-primary group-hover:scale-110 transition-transform duration-500">
                                        <BedDouble className="w-8 h-8" />
                                    </div>
                                    <CardTitle className="text-xl">Room Collection</CardTitle>
                                    <CardDescription>Inventory & Suite Management</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                        View and update room availability, pricing, and details.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Link href="/dashboard/reception" className="block h-full">
                            <Card className="h-full glass-card hover:shadow-2xl transition-all duration-500 cursor-pointer border-l-4 border-l-purple-500 hover:border-l-8 hover:-translate-y-2 group relative overflow-hidden">
                                <CardHeader>
                                    <div className="text-4xl mb-4 p-3 bg-purple-500/10 w-fit rounded-xl text-purple-600 group-hover:scale-110 transition-transform duration-500">
                                        <ConciergeBell className="w-8 h-8" />
                                    </div>
                                    <CardTitle className="text-xl">Guest Registry</CardTitle>
                                    <CardDescription>Check-in & Departures</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                        Manage active bookings, guest check-ins, and billing.
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>

                    {isAdmin && (
                        <>
                            <motion.div variants={itemVariants}>
                                <Link href="/dashboard/rooms/add" className="block h-full">
                                    <Card className="h-full glass-card hover:shadow-2xl transition-all duration-500 cursor-pointer border-l-4 border-l-amber-500 hover:border-l-8 hover:-translate-y-2 group relative overflow-hidden">
                                        <CardHeader>
                                            <div className="text-4xl mb-4 p-3 bg-amber-500/10 w-fit rounded-xl text-amber-600 group-hover:scale-110 transition-transform duration-500">
                                                <PlusCircle className="w-8 h-8" />
                                            </div>
                                            <CardTitle className="text-xl">Property Growth</CardTitle>
                                            <CardDescription>Register New Units</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                                Add new rooms and suites to the property inventory.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Link href="/dashboard/users" className="block h-full">
                                    <Card className="h-full glass-card hover:shadow-2xl transition-all duration-500 cursor-pointer border-l-4 border-l-rose-500 hover:border-l-8 hover:-translate-y-2 group relative overflow-hidden">
                                        <CardHeader>
                                            <div className="text-4xl mb-4 p-3 bg-rose-500/10 w-fit rounded-xl text-rose-600 group-hover:scale-110 transition-transform duration-500">
                                                <Users className="w-8 h-8" />
                                            </div>
                                            <CardTitle className="text-xl">Staff Management</CardTitle>
                                            <CardDescription>User Roles & Access</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                                Manage employee accounts, roles, and system access.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
