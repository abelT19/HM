import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ConciergeBell, Dumbbell, Waves } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 pt-24 font-sans">
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4">Guest Services</h1>
                    <p className="text-slate-600 text-lg">Exquisite amenities tailored for your comfort.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="hover:shadow-xl transition-shadow border-amber-100">
                        <CardHeader className="text-center">
                            <ConciergeBell className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                            <CardTitle>Gourmet Dining</CardTitle>
                            <CardDescription>Order from our curated menu</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-slate-500 mb-6">Experience world-class cuisine delivered directly to your suite.</p>
                            <Button luxury className="w-full">Open Menu</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-xl transition-shadow border-amber-100">
                        <CardHeader className="text-center">
                            <Dumbbell className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                            <CardTitle>Wellness Center</CardTitle>
                            <CardDescription>Professional fitness facilities</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-slate-500 mb-6">State-of-the-art equipment and personal training services.</p>
                            <Button variant="outline" className="w-full">Reserve Time</Button>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-xl transition-shadow border-amber-100">
                        <CardHeader className="text-center">
                            <Waves className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                            <CardTitle>Azure Pool</CardTitle>
                            <CardDescription>Rooftop infinity pool</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-slate-500 mb-6">Enjoy a refreshing dip with panoramic city views.</p>
                            <Button variant="outline" className="w-full">Pool Bookings</Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-20 text-center bg-slate-900 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <h2 className="text-3xl font-serif font-bold mb-4 relative z-10">Membership Exclusive</h2>
                    <p className="text-slate-300 mb-8 max-w-2xl mx-auto relative z-10">
                        Join the Gold Circle to receive complimentary access to all wellness facilities and 20% off gourmet dining.
                    </p>
                    <Button luxury size="lg" className="relative z-10">Apply for Membership</Button>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/dashboard">
                        <Button variant="link" className="text-slate-500 italic">Return to Dashboard</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
