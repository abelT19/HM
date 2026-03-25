"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Wifi, Tv, Coffee, Wind, ArrowRight, Star, Heart, Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/Carousel";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("/api/rooms");
        const data = await res.json();
        if (res.ok) {
          setRooms(data);
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const getRoomImages = (type: string) => {
    switch (type?.toUpperCase()) {
      case "SUITE":
        return [
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590490360182-c87295ecc059?q=80&w=1000&auto=format&fit=crop"
        ];
      case "DELUXE":
        return [
          "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop"
        ];
      default:
        return [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590073242678-cfea53382e52?q=80&w=1000&auto=format&fit=crop"
        ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        {/* Loading Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.8) contrast(1.2)"
          }}
        />
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)"
          }}
        />
        
        <div className="relative z-20 max-w-7xl mx-auto py-20 px-6">
          <Skeleton className="h-20 w-3/4 mx-auto mb-16 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-80 w-full rounded-3xl" />
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Enhanced Header Section with Luxury Background */}
      <div className="relative py-32 mb-16 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.8) contrast(1.2)"
          }}
        />
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)"
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-20 text-center max-w-6xl mx-auto px-6"
        >
          {/* Floating Badge */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="text-amber-300 text-sm font-bold uppercase tracking-widest">World Class Comfort</span>
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </motion.div>
          
          {/* Enhanced Title */}
          <motion.h1 
            className="text-6xl md:text-8xl font-serif font-bold text-white mb-8 leading-tight"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
          >
            <span className="block bg-gradient-to-b from-white via-amber-50 to-amber-100 bg-clip-text text-transparent">
              Our Luxury Collection
            </span>
          </motion.h1>
          
          {/* Enhanced Description */}
          <motion.p 
            className="text-xl md:text-2xl font-light text-white/90 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Discover a sanctuary of elegance and tranquility.
            <span className="block mt-3 text-2xl md:text-3xl font-serif text-amber-200 italic">
              Each suite is designed to provide an unforgettable experience.
            </span>
          </motion.p>
        </motion.div>
      </div>

      <div className="relative z-30 bg-gradient-to-b from-background via-background to-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {rooms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center p-24 bg-card/50 backdrop-blur-xl rounded-3xl border border-dashed border-muted shadow-xl"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-8xl mb-8 opacity-30"
              >
                🛏️
              </motion.div>
              <h3 className="text-3xl font-bold mb-4 text-amber-600">No Rooms Available</h3>
              <p className="text-muted-foreground text-lg">We seem to be fully booked. Please check back later for our luxury suites.</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {rooms.map((room: any) => (
                <motion.div 
                  key={room.id} 
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                >
                  <Card className="h-full bg-card border-none shadow-xl hover:shadow-2xl transition-all duration-700 group overflow-hidden flex flex-col rounded-3xl hover:-translate-y-2 relative">
                    
                    {/* Favorite Button */}
                    <motion.button
                      onClick={() => toggleFavorite(room.id)}
                      className="absolute top-4 left-4 z-30 p-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-white transition-all duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart 
                        className={`w-6 h-6 transition-colors duration-300 ${
                          favorites.has(room.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-600 hover:text-red-500'
                        }`}
                      />
                    </motion.button>

                    {/* Enhanced Carousel Container */}
                    <div className="relative h-96 overflow-hidden bg-slate-100">
                      <Carousel className="w-full h-full">
                        <CarouselContent>
                          {getRoomImages(room.type).map((img, index) => (
                            <CarouselItem key={index} className="h-full">
                              <motion.div
                                className="h-96 w-full bg-cover bg-center transition-transform duration-1000 hover:scale-110"
                                style={{ backgroundImage: `url('${img}')` }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.6 }}
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        
                        {/* Enhanced Carousel Controls */}
                        <AnimatePresence>
                          {hoveredRoom === room.id && (
                            <>
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="absolute top-1/2 left-4 z-20 -translate-y-1/2"
                              >
                                <CarouselPrevious className="relative left-0 top-0 translate-y-0 h-12 w-12 bg-white/90 backdrop-blur-md border-0 text-slate-900 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg" />
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="absolute top-1/2 right-4 z-20 -translate-y-1/2"
                              >
                                <CarouselNext className="relative right-0 top-0 translate-y-0 h-12 w-12 bg-white/90 backdrop-blur-md border-0 text-slate-900 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg" />
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </Carousel>

                      {/* Enhanced Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 pointer-events-none" />

                      {/* Enhanced Room Type Badge */}
                      <motion.div 
                        className="absolute top-4 right-4 z-10 pointer-events-none"
                        animate={{ scale: hoveredRoom === room.id ? 1.05 : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white backdrop-blur-md shadow-lg font-bold uppercase tracking-wider text-sm px-4 py-2 border-0">
                          {room.type}
                        </Badge>
                      </motion.div>

                      {/* Enhanced Price Display */}
                      <motion.div 
                        className="absolute bottom-6 left-6 z-10 text-white pointer-events-none"
                        animate={{ y: hoveredRoom === room.id ? -8 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-5xl font-serif font-bold drop-shadow-lg">${room.price}</div>
                        <div className="text-sm text-white/90 font-medium uppercase tracking-widest">Per Night</div>
                      </motion.div>
                    </div>

                    <CardContent className="flex-grow pt-10 px-8 pb-6 relative z-20 bg-card">
                      <motion.div
                        animate={{ y: hoveredRoom === room.id ? -4 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardTitle className="text-2xl font-serif mb-4 group-hover:text-amber-600 transition-colors duration-300 font-bold">
                          Suite {room.roomNumber}
                        </CardTitle>
                        <motion.div 
                          className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mb-8"
                          animate={{ width: hoveredRoom === room.id ? "5rem" : "3rem" }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Enhanced Amenities */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          {[
                            { icon: Wifi, label: "Free Wi-Fi" },
                            { icon: Tv, label: "Smart TV" },
                            { icon: Coffee, label: "Coffee Maker" },
                            { icon: Wind, label: "Climate Control" }
                          ].map((amenity, index) => (
                            <motion.div
                              key={amenity.label}
                              className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-xl hover:bg-amber-50/50 transition-colors duration-300"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="p-2 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl text-amber-700 shadow-sm">
                                <amenity.icon className="w-5 h-5" />
                              </div>
                              <span className="font-medium">{amenity.label}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </CardContent>

                    <CardFooter className="px-8 pb-8 pt-0">
                      <Link href={`/dashboard/bookings/new?roomId=${room.id}&price=${room.price}`} className="w-full">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button className="w-full h-16 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white border-0 rounded-2xl shadow-lg hover:shadow-amber-500/30 transition-all duration-300 text-lg font-bold group">
                            <span className="flex items-center justify-center">
                              Book This Suite
                              <ArrowRight className="ml-3 w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                            </span>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                              initial={{ x: "-100%" }}
                              whileHover={{ x: "0%" }}
                              transition={{ duration: 0.4 }}
                            />
                          </Button>
                        </motion.div>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
