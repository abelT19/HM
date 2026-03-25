"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import BookingModal from "@/components/BookingModal";
import { Lock } from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Wifi, Tv, Coffee, Wind, ArrowRight, Star, Heart, Sparkles, Bed } from "lucide-react";


// Dynamic imports for performance
const Button = dynamic(() => import("@/components/ui/Button").then(mod => ({ default: mod.Button })), {
  loading: () => <div className="w-16 h-8 bg-gray-200 animate-pulse rounded" />
});

// Import Carousel components normally for now to avoid TypeScript issues
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/Carousel";

export default function RoomsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();


  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  // Modal State
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchRooms() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch("/api/rooms", { signal: controller.signal });
        const data = await res.json();
        if (res.ok) {
          setRooms(data);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error("Fetch Rooms Timeout");
        } else {
          console.error("Failed to fetch rooms:", error);
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);


  const toggleFavorite = (roomId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(roomId)) {
        newFavorites.delete(roomId);
      } else {
        newFavorites.add(roomId);
      }
      return newFavorites;
    });
  };

  const handleButtonClick = (buttonName: string) => {
    setClickedButton(buttonName);
    setTimeout(() => setClickedButton(null), 300);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Real hotel room images with bed focus from different hotels
  const getRoomImages = useMemo(() => (roomType: string) => {
    // Memoized image URLs for better performance
    switch (roomType) {
      case 'SINGLE':
        return [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop", 
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop"
        ];
      case 'DOUBLE':
        return [
          "https://images.unsplash.com/photo-1611892446775-c71a5db8c888?q=80&w=1000&auto=format&fit=crop", 
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000&auto=format&fit=crop"
        ];
      case 'FAMILY':
      case 'PRESIDENTIAL':
        return [
          "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1000&auto=format&fit=crop", 
          "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop"
        ];
      default:
        return [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop", // Luxury suite with king bed
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop" // Presidential suite bed
        ];
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative">
        {/* Loading Background - Optimized */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
            alt="Luxury Hotel Loading Background"
            fill
            unoptimized={true}
            className="object-cover"

            style={{
              filter: "brightness(0.7) contrast(1.3)"
            }}
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.75) 100%)"
          }}
        />

        <div className="relative z-20 max-w-7xl mx-auto py-20 px-6">
          <div className="flex flex-col items-center justify-center">
            <Skeleton className="h-24 w-3/4 mb-20 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-8">
                  <Skeleton className="h-96 w-full rounded-3xl" />
                  <Skeleton className="h-16 w-3/4 mx-auto" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Enhanced Header Section with Perfect Centering - Optimized */}
      <div className="relative py-40 mb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop"
            alt="Luxury Hotel Header Background"
            fill
            unoptimized={true}
            className="object-cover"

            style={{
              filter: "brightness(0.7) contrast(1.3)"
            }}
            sizes="100vw"
          />
        </div>
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.75) 100%)"
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-20 flex flex-col items-center justify-center text-center max-w-6xl mx-auto px-6"
        >
          {/* Floating Badge - Perfectly Centered */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-4 mb-16 px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-300"
          >
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            <span className="text-amber-300 text-base font-bold uppercase tracking-widest">World Class Comfort</span>
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </motion.div>

          {/* Enhanced Title - Perfectly Centered */}
          <motion.h1
            className="text-7xl md:text-9xl font-serif font-bold text-white mb-12 leading-tight text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
          >
            <span className="block bg-gradient-to-b from-white via-amber-50 to-amber-100 bg-clip-text text-transparent hover:from-amber-50 hover:via-white hover:to-amber-50 transition-all duration-500 cursor-default">
              Our Luxury Collection
            </span>
          </motion.h1>

          {/* Enhanced Description - Perfectly Centered */}
          <motion.p
            className="text-2xl md:text-4xl font-light text-white/95 max-w-5xl mx-auto leading-relaxed text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Discover a sanctuary of elegance and tranquility.
            <span className="block mt-6 text-3xl md:text-5xl font-serif text-amber-200 italic hover:text-amber-100 transition-colors duration-300 cursor-default">
              Each suite is designed to provide an unforgettable experience.
            </span>
          </motion.p>
        </motion.div>
      </div>

      <div className="relative z-30 bg-gradient-to-b from-background via-background to-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {rooms.filter((r: any) => r.isAvailable).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-9xl mb-12 opacity-30 cursor-pointer hover:opacity-50 transition-opacity duration-300"
              >
                🛏️
              </motion.div>
              <h3 className="text-4xl font-bold mb-6 text-amber-600 text-center">No Rooms Available</h3>
              <p className="text-muted-foreground text-xl text-center max-w-2xl">We seem to be fully booked. Please check back later for our luxury suites.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
              {rooms.filter((r: any) => r.isAvailable).map((room: any) => (
                <motion.div
                  key={room.id}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  whileHover={{
                    y: -20,
                    scale: 1.03,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    boxShadow: { duration: 0.3 }
                  }}
                >
                  <Card className={`h-full bg-card border-none shadow-xl hover:shadow-2xl transition-all duration-700 group overflow-hidden flex flex-col rounded-3xl relative ${hoveredRoom === room.id ? 'scale-105' : ''
                    } ${clickedButton === room.id ? 'scale-95' : ''}`}>

                    {/* Enhanced Favorite Button */}
                    <motion.button
                      onClick={() => toggleFavorite(room.id)}
                      className="absolute top-6 left-6 z-30 p-4 bg-white/95 backdrop-blur-md rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      whileHover={{
                        scale: 1.15,
                        rotate: 15,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)"
                      }}
                      whileTap={{ scale: 0.85 }}
                    >
                      <Heart
                        className={`w-7 h-7 transition-all duration-300 ${favorites.has(room.id)
                          ? 'fill-red-500 text-red-500 scale-110'
                          : 'text-gray-600 hover:text-red-500'
                          }`}
                      />
                    </motion.button>

                    {/* Enhanced Carousel Container with Better Bed Images - Optimized */}
                    <div className="relative h-96 overflow-hidden bg-slate-100 rounded-t-3xl">
                      <Carousel className="w-full h-full">
                        <CarouselContent>
                          {getRoomImages(room.type).map((img, index) => (
                            <CarouselItem key={index} className="h-full">
                              <div className="relative h-96 w-full">
                                <Image
                                  src={img}
                                  alt={`${room.name} - Image ${index + 1}`}
                                  fill
                                  unoptimized={true}
                                  className="object-cover transition-all duration-300 hover:scale-105"

                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <motion.div
                                  className="absolute inset-0 pointer-events-none"
                                  whileHover={{
                                    backgroundColor: "rgba(0,0,0,0.1)"
                                  }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>

                      {/* Enhanced Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 pointer-events-none rounded-t-3xl" />

                      {/* Enhanced Room Type Badge */}
                      <motion.div
                        className="absolute top-6 right-6 z-10 pointer-events-none"
                        animate={{
                          scale: hoveredRoom === room.id ? 1.08 : 1,
                          y: hoveredRoom === room.id ? -3 : 0
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white backdrop-blur-md shadow-xl font-bold uppercase tracking-wider text-sm px-6 py-3 border-0 cursor-pointer hover:scale-105 transition-all duration-300">
                          {room.type}
                        </Badge>
                      </motion.div>

                      {/* Enhanced Price Display - Perfectly Centered */}
                      <motion.div
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white pointer-events-none text-center"
                        animate={{
                          y: hoveredRoom === room.id ? -12 : 0,
                          scale: hoveredRoom === room.id ? 1.05 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-6xl font-serif font-bold drop-shadow-2xl">{room.price.toLocaleString()} ETB</div>
                        <div className="text-base text-white/95 font-medium uppercase tracking-widest mt-1">Per Night • {room.capacity} Guests Max</div>
                        <motion.div
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="mt-4 bg-red-600/90 text-white px-4 py-1 rounded-full text-[10px] font-black tracking-tighter shadow-lg"
                        >
                          STRICT 11:00 AM CHECK-OUT CUTOFF
                        </motion.div>
                      </motion.div>
                    </div>

                    <CardContent className="flex-grow pt-12 px-10 pb-8 relative z-20 bg-card">
                      <motion.div
                        animate={{
                          y: hoveredRoom === room.id ? -8 : 0,
                          scale: hoveredRoom === room.id ? 1.02 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className="text-center"
                      >
                        {/* Room Title - Perfectly Centered */}
                        <CardTitle className="text-3xl font-serif mb-6 group-hover:text-amber-600 transition-all duration-300 font-bold text-center mx-auto">
                          Suite {room.roomNumber}
                        </CardTitle>

                        {/* Enhanced Divider */}
                        <motion.div
                          className="w-32 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mb-10 mx-auto"
                          animate={{
                            width: hoveredRoom === room.id ? "8rem" : "5rem",
                            opacity: hoveredRoom === room.id ? 1 : 0.7
                          }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Enhanced Amenities - Perfectly Centered */}
                        <div className="flex justify-center gap-8 mb-10">
                          {(room.amenities || (room.type === 'deluxe' ? ['wifi', 'tv', 'coffee', 'ac'] : room.type === 'executive' ? ['wifi', 'tv', 'coffee'] : ['wifi', 'tv'])).map((amenity: string, index: number) => (
                            <motion.div
                              key={index}
                              className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
                              whileHover={{
                                scale: 1.05,
                                backgroundColor: "rgba(255,255,255,0.2)"
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              {amenity === 'wifi' && <Wifi className="w-6 h-6 text-amber-600" />}
                              {amenity === 'tv' && <Tv className="w-6 h-6 text-amber-600" />}
                              {amenity === 'coffee' && <Coffee className="w-6 h-6 text-amber-600" />}
                              {amenity === 'ac' && <Wind className="w-6 h-6 text-amber-600" />}
                            </motion.div>
                          ))}
                        </div>

                        {/* Enhanced Booking Button - Perfectly Centered */}
                        <motion.div
                          className="text-center"
                          animate={{
                            y: hoveredRoom === room.id ? -4 : 0,
                            scale: hoveredRoom === room.id ? 1.02 : 1
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Button
                            size="lg"
                            className="group relative overflow-hidden rounded-full px-12 py-6 text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white border-0 shadow-xl shadow-amber-900/40 transition-all duration-300 hover:scale-105 hover:shadow-amber-500/60"
                            onClick={() => {
                              setClickedButton(room.id);
                              setTimeout(() => setClickedButton(null), 300);
                              if (authStatus !== "authenticated") {
                                // Strict auth gate — redirect immediately, never open modal
                                router.push(`/login?callbackUrl=${encodeURIComponent("/rooms")}`);
                                return;
                              }
                              setSelectedRoom(room);
                              setIsModalOpen(true);
                            }}
                          >
                            <span className="relative z-10 flex items-center">
                              {authStatus === "authenticated" ? "Book Now" : "Login to Book"}
                              {authStatus === "authenticated"
                                ? <ArrowRight className="ml-3 w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-200" />
                                : <Lock className="ml-3 w-5 h-5" />}
                            </span>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "0%" }}
                              transition={{ duration: 0.2 }}
                            />
                          </Button>
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={selectedRoom}
      />
    </div>

  );
}
