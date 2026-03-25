"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ConciergeBell,
  Waves,
  ArrowRight,
  Sparkles,
  ChefHat,
  History,
  MapPin,
  Clock,
  Utensils,
  Dumbbell,
  ShieldCheck,
  Plane,
} from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const starParticles = useMemo(() => {
    if (!mounted) return [];
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: `${(Math.random() * 100).toFixed(2)}%`,
      top: `${(Math.random() * 100).toFixed(2)}%`,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5
    }));
  }, [mounted]);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-amber-200 selection:text-amber-900">
      {/* Header / Top Bar */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/80 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
            <ConciergeBell className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-xl font-serif font-bold text-slate-900 tracking-tight">The Africa</span>
        </div>

        <Link href="/login">
          <Button
            variant="secondary"
            className="rounded-full px-8 bg-slate-900 text-white hover:bg-slate-800 shadow-md"
          >
            Login to Portal
          </Button>
        </Link>
      </header>


      {/* Hero Section */}
      <main>
        <section className="relative h-[85vh] flex items-center justify-center pt-20">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 1, 0]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="absolute inset-0 z-0"
            >
              <Image
                src="/images/facade.png"
                alt="The Africa Hotel Facade"
                fill
                className="object-cover"
                loading="eager"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-slate-950/40" />
            {/* Animated Gradient Blob for Hero */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, -30, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full z-1"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-amber-500 text-slate-900 border-0 px-6 py-2 rounded-full font-bold mb-8 shadow-xl shadow-amber-500/20">
                <Sparkles className="w-4 h-4 mr-2" />
                PREMIUM HOSPITALITY
              </Badge>
              <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-[1.1] tracking-tight">
                Refined Luxury,<br />
                <span className="text-amber-500 italic">Redefined.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-200 font-light max-w-2xl mx-auto mb-12 opacity-90 leading-relaxed">
                Experience the pinnacle of hospitality at Africa's most prestigious urban sanctuary.
              </p>

              <Link href="/rooms">
                <Button luxury size="lg" className="h-16 px-12 text-xl rounded-full shadow-2xl">
                  Explore Luxury Suites
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
          {/* Animated Background Blobs for About */}
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/50 blur-[120px] rounded-full -z-10"
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/50 blur-[100px] rounded-full -z-10"
          />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <Image src="/images/lobby.png" alt="Luxury Lobby" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <p className="text-sm font-bold uppercase tracking-widest text-amber-500 mb-2">Our Sanctuary</p>
                <h3 className="text-3xl font-serif font-bold">The Main Lobby</h3>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <span className="text-amber-600 font-bold uppercase tracking-[0.3em] text-sm">About The Africa</span>
              <h2 className="text-5xl font-serif font-bold text-slate-900 leading-tight">A Sanctuary of Timeless Elegance</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Founded on the principles of grace, privacy, and impeccable service, The Africa has stood as a beacon of luxury in Addis Ababa for over two decades. Our mission is to provide an unparalleled sanctuary for the global traveler, blending modern sophistication with the warm, historic hospitality of Ethiopia.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <h4 className="text-3xl font-serif font-bold text-amber-600 mb-1">20+</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Years of Excellence</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <h4 className="text-3xl font-serif font-bold text-amber-600 mb-1">100%</h4>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Guest Satisfaction</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* History Section */}
        <section id="history" className="py-24 px-6 text-white bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <Sparkles className="w-full h-full text-amber-500 rotate-12" />
          </div>
          {/* Parallax Star Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {mounted && starParticles.map((star) => (
              <motion.div
                key={star.id}
                initial={{ opacity: 0.1, scale: 0.5 }}
                animate={{ 
                  opacity: [0.1, 0.4, 0.1],
                  scale: [0.5, 0.8, 0.5],
                  y: [0, -20, 0]
                }}
                transition={{ 
                  duration: star.duration, 
                  repeat: Infinity,
                  delay: star.delay
                }}
                className="absolute bg-amber-400 w-1 h-1 rounded-full"
                style={{ 
                  left: star.left, 
                  top: star.top 
                }}
              />
            ))}
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <History className="w-12 h-12 text-amber-500 mx-auto mb-8" />
              <h2 className="text-5xl font-serif font-bold mb-8">Established in 2005</h2>
              <p className="text-xl text-slate-300 font-light leading-relaxed mb-12">
                "The Africa" began as a dream to bring international standard luxury to the heart of Ethiopia. Since our grand opening in 2005, we have hosted royalty, heads of state, and legendary artists, becoming a living landmark in the vibrant tapestry of Addis Ababa.
              </p>
              <div className="w-1 h-20 bg-gradient-to-b from-amber-500 to-transparent mx-auto" />
            </motion.div>
          </div>
        </section>

        {/* Location Section */}
        <section id="location" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full md:w-1/2"
              >
                <div className="inline-flex items-center gap-2 mb-6 text-amber-600 font-bold uppercase tracking-widest text-xs">
                  <MapPin className="w-4 h-4" />
                  Prime Location
                </div>
                <h2 className="text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                  In the Vibrant Heart <br />
                  <span className="text-amber-600 italic">of Bole Area</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Plane className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">10 Minutes from Bole International</h4>
                      <p className="text-sm text-slate-500">Perfect for the international business traveler.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <ConciergeBell className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Bole Business District</h4>
                      <p className="text-sm text-slate-500">Walk to luxury shopping, fine dining, and major corporate hubs.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="w-full md:w-1/2 h-[450px] relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-50">
                <Image src="/images/facade.png" alt="Hotel Location" fill className="object-cover" />
                <div className="absolute inset-0 bg-slate-900/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Our Services</h2>
            <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Order Food */}
            <motion.div whileHover={{ y: -12 }} className="h-full">
              <Card className="h-full border-0 shadow-2xl bg-white rounded-3xl overflow-hidden group">
                <div className="h-64 relative overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600&fit=crop" alt="Food" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-slate-900/20" />
                  <div className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur rounded-2xl shadow-lg">
                    <Utensils className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl font-serif font-bold text-slate-900">Signature Dining</CardTitle>
                  <CardDescription className="text-slate-500 italic">Exquisite Room Service</CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-10 px-8 space-y-6">
                  <p className="text-slate-600 text-sm leading-relaxed">Savor our curated gourmet menu delivered directly to your door at any hour, featuring both Ethiopian classics and international fusion.</p>
                  <Link href="/order-food">
                    <Button variant="secondary" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold border-0 h-14 rounded-2xl shadow-xl transition-all">
                      Explore Full Menu
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Wellness (Gym & Swim) */}
            <motion.div whileHover={{ y: -12 }} className="h-full">
              <Card className="h-full border-0 shadow-2xl bg-white rounded-3xl overflow-hidden group">
                <div className="h-64 relative overflow-hidden">
                  <Image src="/images/pool.png" alt="Wellness" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-slate-900/20" />
                  <div className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur rounded-2xl shadow-lg">
                    <Dumbbell className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl font-serif font-bold text-slate-900">Rooftop Pool & Spa</CardTitle>
                  <CardDescription className="text-slate-500 italic">The Wellness Center</CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-10 px-8 space-y-6">
                  <p className="text-slate-600 text-sm leading-relaxed">Access our heated infinity pool and state-of-the-art fitness center with panoramic views of the Addis Ababa skyline.</p>
                  <Button
                    variant="secondary"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold border-0 h-14 rounded-2xl shadow-xl transition-all"
                    onClick={() => {
                      if (!session) {
                        router.push("/signup?callbackUrl=/services/gym");
                      } else {
                        router.push("/services/gym");
                      }
                    }}
                  >
                    View Wellness Center
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 px-6 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ConciergeBell className="w-6 h-6 text-amber-500" />
              <span className="text-2xl font-serif font-bold">The Africa Hotel</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm">Premium Luxury Suites & Urban Sanctuary in the heart of Bole Area.</p>
            <div className="flex items-start gap-2 text-slate-500 text-xs mt-4">
              <MapPin className="w-4 h-4 text-amber-500 mt-1" />
              <p>Bole Road, Near Square <br /> Addis Ababa, Ethiopia</p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-8 text-sm text-slate-400 font-medium">
              <Link href="/rooms" className="hover:text-amber-500 transition-colors">Rooms</Link>
              <Link href="/services" className="hover:text-amber-500 transition-colors">Services</Link>
              <Link href="/about" className="hover:text-amber-500 transition-colors">About</Link>
            </div>
            <div className="flex gap-4">
              <Link href="/login" className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-amber-500 transition-colors">Staff Login</Link>
            </div>
            <p className="text-xs text-slate-600 mt-4">© 2026 The Africa Luxury. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
