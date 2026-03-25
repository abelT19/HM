"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, Variants, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Lock, ConciergeBell, BedDouble, ArrowRight, Star, Sparkles, Crown } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackgroundSimple";

export default function LandingPage() {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden relative">
      {/* Enhanced Hero Section with Animated Background */}
      <AnimatedBackground ref={ref} className="w-full h-[100vh] flex items-center justify-center">
        <motion.div
          style={{ y, opacity, scale }}
          className="relative z-10 text-center text-white p-6 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          >
            {/* Floating Crown Icon */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center mb-8"
            >
              <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-2xl animate-pulse-glow">
                <Crown className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Star Rating with Animation */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-8"
            >
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i, index) => (
                  <motion.div
                    key={i}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  >
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-lg" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Luxury Badge */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <Badge className="text-white border-white/30 backdrop-blur-md px-8 py-3 text-sm uppercase tracking-[0.3em] bg-gradient-to-r from-amber-600/20 to-amber-500/20 shadow-xl">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                The Ultimate Luxury Experience
                <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
              </Badge>
            </motion.div>

            {/* Main Title with Gradient Effect */}
            <motion.h1 
              className="text-7xl md:text-9xl font-serif mb-8 tracking-tighter drop-shadow-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
            >
              <span className="block bg-gradient-to-b from-white via-amber-50 to-amber-100 bg-clip-text text-transparent animate-shimmer">
                Africa Hotel
              </span>
            </motion.h1>

            {/* Description with Typewriter Effect */}
            <motion.p 
              className="text-xl md:text-3xl font-light text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              Experience world-class luxury in the heart of the city.
              <br />
              <span className="italic font-serif text-amber-200 text-2xl md:text-3xl block mt-2">
                Where tradition meets elegance.
              </span>
            </motion.p>

            {/* Enhanced CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link href="/rooms">
                <Button size="lg" className="group relative overflow-hidden rounded-full px-12 py-8 text-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white border-0 shadow-2xl shadow-amber-900/30 transition-all duration-300">
                  <span className="relative z-10 flex items-center">
                    Book Your Stay 
                    <ArrowRight className="ml-3 w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatedBackground>

      {/* Enhanced Interactive Cards Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 p-6 -mt-20 relative z-20 pb-20"
      >
        {/* Admin Entry */}
        <motion.div 
          variants={itemVariants}
          onMouseEnter={() => setIsHovered("admin")}
          onMouseLeave={() => setIsHovered(null)}
        >
          <Link href="/login?role=ADMIN" className="block h-full">
            <Card className="h-full bg-card/90 backdrop-blur-xl border-white/10 hover:border-primary/50 hover:shadow-2xl transition-all duration-700 cursor-pointer group overflow-hidden relative">
              <AnimatePresence>
                {isHovered === "admin" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent z-0"
                  />
                )}
              </AnimatePresence>
              <div
                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')" }}
              />
              <CardHeader className="text-center pt-12 relative z-10">
                <motion.div 
                  className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary"
                  animate={{ 
                    rotate: isHovered === "admin" ? 360 : 0,
                    scale: isHovered === "admin" ? 1.1 : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Lock className="w-8 h-8" />
                </motion.div>
                <CardTitle className="text-2xl font-serif group-hover:text-primary transition-colors duration-300">Admin Access</CardTitle>
                <CardDescription>System Control & Analytics</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-12 relative z-10">
                <p className="text-sm text-muted-foreground mb-8">
                  Configure rooms, manage staff, and view financial reports.
                </p>
                <Button variant="ghost" className="w-full group-hover:bg-primary/10 transition-all duration-300">
                  Secure Login
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Receptionist Entry */}
        <motion.div 
          variants={itemVariants}
          onMouseEnter={() => setIsHovered("receptionist")}
          onMouseLeave={() => setIsHovered(null)}
        >
          <Link href="/login?role=RECEPTIONIST" className="block h-full">
            <Card className="h-full bg-card/90 backdrop-blur-xl border-white/10 hover:border-purple-500/50 hover:shadow-2xl transition-all duration-700 cursor-pointer group overflow-hidden relative">
              <AnimatePresence>
                {isHovered === "receptionist" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent z-0"
                  />
                )}
              </AnimatePresence>
              <div
                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2072&auto=format&fit=crop')" }}
              />
              <CardHeader className="text-center pt-12 relative z-10">
                <motion.div 
                  className="w-16 h-16 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-600"
                  animate={{ 
                    rotate: isHovered === "receptionist" ? -360 : 0,
                    scale: isHovered === "receptionist" ? 1.1 : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <ConciergeBell className="w-8 h-8" />
                </motion.div>
                <CardTitle className="text-2xl font-serif group-hover:text-purple-600 transition-colors duration-300">Reception Desk</CardTitle>
                <CardDescription>Guest Management</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-12 relative z-10">
                <p className="text-sm text-muted-foreground mb-8">
                  Check-in guests, handle reservations, and concierge duties.
                </p>
                <Button variant="ghost" className="w-full group-hover:bg-purple-500/10 text-purple-600 transition-all duration-300">
                  Staff Portal
                  <ArrowRight className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Enhanced Client/User Entry */}
        <motion.div 
          variants={itemVariants} 
          className="md:scale-105 z-10"
          onMouseEnter={() => setIsHovered("guest")}
          onMouseLeave={() => setIsHovered(null)}
        >
          <Link href="/rooms" className="block h-full">
            <Card className="h-full bg-white dark:bg-slate-900 border-amber-500/30 shadow-2xl hover:shadow-amber-500/30 transition-all duration-700 cursor-pointer group relative overflow-hidden ring-1 ring-amber-500/20">
              <motion.div
                className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] uppercase font-bold px-4 py-2 rounded-bl-2xl shadow-lg z-20"
                animate={{ x: isHovered === "guest" ? 0 : 10 }}
                transition={{ duration: 0.3 }}
              >
                Guest Experience
              </motion.div>
              <div
                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')" }}
              />
              <AnimatePresence>
                {isHovered === "guest" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent z-0"
                  />
                )}
              </AnimatePresence>

              <CardHeader className="text-center pt-16 relative z-10">
                <motion.div 
                  className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-6 text-white shadow-lg shadow-amber-500/30"
                  animate={{ 
                    scale: isHovered === "guest" ? 1.15 : 1,
                    rotate: isHovered === "guest" ? 5 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <BedDouble className="w-10 h-10" />
                </motion.div>
                <CardTitle className="text-3xl font-serif text-amber-700 dark:text-amber-500 group-hover:text-amber-600 transition-colors duration-300">Book A Stay</CardTitle>
                <CardDescription className="text-amber-600/80 uppercase tracking-widest text-xs font-bold">Best Rates Guaranteed</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-12 relative z-10">
                <p className="text-sm text-muted-foreground mb-8 max-w-[200px] mx-auto">
                  Discover our selection of luxury rooms and suites.
                </p>
                <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white border-0 py-6 text-lg shadow-md group-hover:shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300">
                  View Rooms
                  <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}