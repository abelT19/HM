"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, Variants, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Lock, ConciergeBell, BedDouble, ArrowRight, Star, Sparkles, Crown } from "lucide-react";

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState<string | null>(null);

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
    hidden: { y: 30, opacity: 0 },
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
    <div className="min-h-screen relative">
      {/* Hero Section with Luxury Background */}
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* High-Quality Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.8) contrast(1.2)"
          }}
        />
        
        {/* Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)"
          }}
        />

        {/* Hero Content */}
        <div className="relative z-20 text-center text-white p-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          >
            {/* Floating Crown Icon */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex justify-center mb-8"
            >
              <div className="p-6 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-2xl">
                <Crown className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
            </motion.div>

            {/* Professional Star Rating */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-8"
            >
              <div className="flex gap-3 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full">
                {[1, 2, 3, 4, 5].map((i, index) => (
                  <motion.div
                    key={i}
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.15, duration: 0.6 }}
                  >
                    <Star className="w-8 h-8 text-amber-400 fill-amber-400 drop-shadow-lg" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Luxury Badge */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex justify-center mb-10"
            >
              <Badge className="bg-gradient-to-r from-amber-600/90 to-amber-500/90 text-white border-2 border-amber-400/50 backdrop-blur-md px-8 py-4 text-sm font-bold uppercase tracking-widest shadow-2xl">
                <Sparkles className="w-5 h-5 mr-3 animate-pulse" />
                The Ultimate Luxury Experience
                <Sparkles className="w-5 h-5 ml-3 animate-pulse" />
              </Badge>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              className="text-7xl md:text-9xl font-serif font-bold mb-8 tracking-tight leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
            >
              <span className="block bg-gradient-to-b from-white via-amber-50 to-amber-100 bg-clip-text text-transparent drop-shadow-2xl">
                Africa Hotel
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              className="text-xl md:text-3xl font-light text-white/95 max-w-4xl mx-auto leading-relaxed mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 1 }}
            >
              Experience world-class luxury in the heart of the city.
              <span className="block mt-4 text-2xl md:text-4xl font-serif text-amber-200 italic">
                Where tradition meets elegance.
              </span>
            </motion.p>

            {/* Enhanced CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.8 }}
              className="inline-block"
            >
              <Link href="/rooms">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden rounded-full px-16 py-8 text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white border-0 shadow-2xl shadow-amber-900/40 transition-all duration-500 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center">
                    Book Your Stay 
                    <ArrowRight className="ml-4 w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.4 }}
                  />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Cards Section */}
      <div className="relative z-30 -mt-32 bg-gradient-to-b from-background via-background to-muted/20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-6 py-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Admin Entry */}
            <motion.div 
              variants={itemVariants}
              onMouseEnter={() => setIsHovered("admin")}
              onMouseLeave={() => setIsHovered(null)}
            >
              <Link href="/login?role=ADMIN" className="block h-full">
                <Card className="h-full bg-card/95 backdrop-blur-xl border-white/10 hover:border-primary/50 hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden relative">
                  <AnimatePresence>
                    {isHovered === "admin" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-0"
                      />
                    )}
                  </AnimatePresence>
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')" }}
                  />
                  <CardHeader className="text-center pt-12 relative z-10">
                    <motion.div 
                      className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary"
                      animate={{ 
                        rotate: isHovered === "admin" ? 360 : 0,
                        scale: isHovered === "admin" ? 1.1 : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <Lock className="w-10 h-10" />
                    </motion.div>
                    <CardTitle className="text-2xl font-serif font-bold group-hover:text-primary transition-colors duration-300">Admin Access</CardTitle>
                    <CardDescription className="text-sm font-medium">System Control & Analytics</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-12 relative z-10">
                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                      Configure rooms, manage staff, and view financial reports.
                    </p>
                    <Button variant="ghost" className="w-full group-hover:bg-primary/10 transition-all duration-300 text-base font-medium py-3">
                      Secure Login
                      <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
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
                <Card className="h-full bg-card/95 backdrop-blur-xl border-white/10 hover:border-purple-500/50 hover:shadow-2xl transition-all duration-500 cursor-pointer group overflow-hidden relative">
                  <AnimatePresence>
                    {isHovered === "receptionist" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent z-0"
                      />
                    )}
                  </AnimatePresence>
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 bg-cover bg-center"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2072&auto=format&fit=crop')" }}
                  />
                  <CardHeader className="text-center pt-12 relative z-10">
                    <motion.div 
                      className="w-20 h-20 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-600"
                      animate={{ 
                        rotate: isHovered === "receptionist" ? -360 : 0,
                        scale: isHovered === "receptionist" ? 1.1 : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <ConciergeBell className="w-10 h-10" />
                    </motion.div>
                    <CardTitle className="text-2xl font-serif font-bold group-hover:text-purple-600 transition-colors duration-300">Reception Desk</CardTitle>
                    <CardDescription className="text-sm font-medium">Guest Management</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-12 relative z-10">
                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                      Check-in guests, handle reservations, and concierge duties.
                    </p>
                    <Button variant="ghost" className="w-full group-hover:bg-purple-500/10 text-purple-600 transition-all duration-300 text-base font-medium py-3">
                      Staff Portal
                      <ArrowRight className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* Guest Entry - Enhanced */}
            <motion.div 
              variants={itemVariants}
              className="md:scale-105 z-10"
              onMouseEnter={() => setIsHovered("guest")}
              onMouseLeave={() => setIsHovered(null)}
            >
              <Link href="/rooms" className="block h-full">
                <Card className="h-full bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-2xl hover:shadow-amber-500/40 hover:scale-105 transition-all duration-500 cursor-pointer group relative overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold uppercase px-6 py-3 rounded-bl-2xl shadow-lg z-20"
                    animate={{ x: isHovered === "guest" ? 0 : 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    Guest Experience
                  </motion.div>
                  <div
                    className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity duration-700 bg-cover bg-center"
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
                      className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-8 text-white shadow-2xl shadow-amber-500/30"
                      animate={{ 
                        scale: isHovered === "guest" ? 1.15 : 1,
                        rotate: isHovered === "guest" ? 5 : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <BedDouble className="w-12 h-12" />
                    </motion.div>
                    <CardTitle className="text-3xl font-serif font-bold text-amber-700 dark:text-amber-500 group-hover:text-amber-600 transition-colors duration-300">Book A Stay</CardTitle>
                    <CardDescription className="text-amber-600/80 uppercase tracking-widest text-xs font-bold">Best Rates Guaranteed</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-12 relative z-10">
                    <p className="text-sm text-muted-foreground mb-8 max-w-[220px] mx-auto leading-relaxed">
                      Discover our selection of luxury rooms and suites.
                    </p>
                    <Button className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white border-0 py-6 text-lg font-bold shadow-lg group-hover:shadow-amber-500/30 transition-all duration-300">
                      <span className="flex items-center justify-center">
                        View Rooms
                        <ArrowRight className="ml-3 w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "0%" }}
                        transition={{ duration: 0.4 }}
                      />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
