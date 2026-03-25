"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import BookingModal from "@/components/BookingModal";
import { Hotel } from "lucide-react";

type Room = {
    id: string;
    roomNumber: string;
    type: string;
    price: number;
    capacity?: number;
    isAvailable: boolean;
    status: string;
};

interface RoomsGridProps {
    rooms: Room[];
    isAdmin?: boolean;
    isCustomer?: boolean;
}

export default function RoomsGrid({ rooms, isAdmin, isCustomer }: RoomsGridProps) {
    const router = useRouter();
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const handleBookNow = (room: Room) => {
        setSelectedRoom(room);
        setIsBookingOpen(true);
    };

    if (!rooms || rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-2xl font-serif text-slate-400">No rooms found in the registry.</p>
                <p className="text-slate-500 mt-2">Add your first luxury unit to get started.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rooms.map((room) => (
                    <Card key={room?.id} className="hover:shadow-2xl transition-all duration-500 group overflow-hidden border-none glass-card relative h-full flex flex-col">
                        <div className="absolute top-0 right-0 p-3 z-20">
                            <Badge variant={room?.isAvailable ? "success" : "secondary"} className="shadow-sm uppercase tracking-wider text-[10px]">
                                {room?.isAvailable ? "Available" : "Occupied"}
                            </Badge>
                        </div>

                        <div className="h-4 w-full bg-primary/10 group-hover:bg-primary transition-colors duration-500" />

                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
                            <CardTitle className="text-2xl font-serif">Room {room?.roomNumber}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="text-4xl font-bold text-primary mb-1 flex items-baseline gap-1">
                                {room?.price.toLocaleString()} ETB
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1 italic">per night</span>
                            </div>

                            {/* Mandatory 11 AM Cutoff Notice */}
                            <div className="mb-6 bg-red-600/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black animate-pulse inline-block shadow-lg shadow-red-900/20">
                                STRICT 11:00 AM CHECK-OUT CUTOFF
                            </div>

                            {/* Staff Directly Booking */}
                            {room?.isAvailable && (
                                <div className="mb-4">
                                    <Button
                                        onClick={() => handleBookNow(room)}
                                        className="bg-amber-600 hover:bg-amber-700 text-white w-full rounded-xl py-6 shadow-lg shadow-amber-900/10 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px]"
                                    >
                                        <Hotel className="w-4 h-4" />
                                        Book Now
                                    </Button>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-auto">
                                <Badge variant="outline" className="bg-background/50">{room?.type}</Badge>
                                <Badge variant="outline" className="bg-background/50">{room?.capacity} Guests Max</Badge>
                            </div>
                        </CardContent>

                        {isAdmin && (
                            <CardFooter className="border-t border-slate-100 pt-6">
                                <Button
                                    onClick={() => router.push(`/dashboard/admin/rooms/edit/${room.id}`)}
                                    variant="ghost"
                                    size="lg"
                                    className="w-full group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 rounded-xl font-bold text-xs uppercase tracking-widest"
                                >
                                    Edit Configuration
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                ))}
            </div>

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                room={selectedRoom}
                isReceptionist={!isCustomer}
            />
        </>
    );
}
