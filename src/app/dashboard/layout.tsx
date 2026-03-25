"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login", redirect: true });
  };

  // --- LOADING GUARD ---
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 animate-pulse">Initializing Luxury Experience...</p>
        </div>
      </div>
    );
  }

  // 1. Get the role (Default to GUEST if not specified)
  const role = (session?.user as any)?.role || "GUEST";

  // 2. Define which paths are "Guest Paths" where the sidebar should BE HIDDEN
  // include any locations related to guest ordering/success so we never show reception sidebar
  const guestPaths = [
    "/dashboard/my-bookings",
    "/dashboard/bookings/new",
    "/dashboard/guest",
    "/dashboard/guest/order-success",
  ];

  // Check if current path is a guest path OR if the user is a GUEST role
  const isGuestView = role === "GUEST" || guestPaths.some(path => pathname.includes(path));

  // 3. CLEAN VIEW (No Sidebar)
  if (isGuestView) {
    return (
      <div className="min-h-screen relative font-sans">
        {/* Guest View Background */}
        <div
          className="fixed inset-0 z-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-100" />

        {/* Simple Top Navigation for Guests */}
        <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 px-8 flex justify-between items-center sticky top-0">
          <span className="font-serif text-xl font-bold tracking-tighter text-slate-900 uppercase">Africa Hotel</span>
          <div className="flex items-center gap-6">
            <Link href="/dashboard/my-bookings" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-amber-600 transition-colors">
              My Reservations
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-rose-100 bg-rose-50/50 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-sm active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </nav>

        <main className="relative z-10 max-w-6xl mx-auto p-4 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // 4. STAFF VIEW (With Receptionist Sidebar)
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-72 h-screen bg-slate-900 text-white flex flex-col shadow-2xl z-20 shrink-0 relative overflow-hidden">
        {/* Sidebar Background Texture */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop')" }}
        />

        <div className="relative z-10 p-8 pb-10 border-b border-white/5 shrink-0">
          <h1 className="text-xl font-serif font-bold tracking-tighter uppercase text-white">Africa Hotel</h1>
          <p className="text-[9px] text-amber-500 font-bold tracking-[0.3em] uppercase mt-1 opacity-80">
            {role === "ADMIN" ? "Admin Portal" : "Receptionist Desk"}
          </p>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="relative z-10 flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
          <Link href="/dashboard" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname === '/dashboard' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <span className="text-lg group-hover:scale-110 transition-transform">🏠</span>
            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </Link>

          {role === "CUSTOMER" ? (
            <>
              <Link href="/dashboard/my-reservations" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/my-reservations') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span className="text-lg group-hover:scale-110 transition-transform">📋</span>
                <span className="text-xs font-bold uppercase tracking-widest">My Reservations</span>
              </Link>
              <Link href="/dashboard/profile" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/profile') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span className="text-lg group-hover:scale-110 transition-transform">👤</span>
                <span className="text-xs font-bold uppercase tracking-widest">Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard/rooms" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/rooms') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span className="text-lg group-hover:scale-110 transition-transform">🛏️</span>
                <span className="text-xs font-bold uppercase tracking-widest">Room Collection</span>
              </Link>

              <Link href="/dashboard/reception" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/reception') && !pathname.includes('/orders') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span className="text-lg group-hover:scale-110 transition-transform">⚜️</span>
                <span className="text-xs font-bold uppercase tracking-widest">Guest Registry</span>
              </Link>

              <Link href="/dashboard/reception/orders" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/reception/orders') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span className="text-lg group-hover:scale-110 transition-transform">🥡</span>
                <span className="text-xs font-bold uppercase tracking-widest">Food Orders</span>
              </Link>

              {role === "ADMIN" && (
                <Link href="/dashboard/admin/menu" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/admin/menu') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  <span className="text-lg group-hover:scale-110 transition-transform">🍽️</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Manage Menus</span>
                </Link>
              )}

              <Link href="/dashboard/reception/memberships" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/reception/memberships') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span className="text-lg group-hover:scale-110 transition-transform">🌊</span>
                <span className="text-xs font-bold uppercase tracking-widest">Membership Registry</span>
              </Link>

              <Link href="/dashboard/bookings" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/bookings') && !pathname.includes('/reception') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                <span className="text-lg group-hover:scale-110 transition-transform">📅</span>
                <span className="text-xs font-bold uppercase tracking-widest">All Bookings</span>
              </Link>

              {role === "ADMIN" && (
                <>
                  <Link href="/dashboard/users" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/users') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <span className="text-lg group-hover:scale-110 transition-transform">👥</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Staff Mgmt</span>
                  </Link>

                  <Link href="/dashboard/admin/audit" className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${pathname.includes('/admin/audit') ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <span className="text-lg group-hover:scale-110 transition-transform">📊</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Audit Log</span>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* Sticky Logout Footer */}
        <div className="relative z-10 p-6 border-t border-white/10 mt-auto bg-slate-900 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] shrink-0">
          <button
            onClick={handleLogout}
            className="w-full group flex items-center gap-4 p-4 rounded-2xl text-rose-400 hover:text-white hover:bg-rose-600 transition-all duration-500 shadow-lg hover:shadow-rose-900/20 active:scale-95 border border-rose-500/20"
          >
            <div className="p-2 rounded-lg bg-rose-500/10 group-hover:bg-white/20 transition-colors">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">End Session</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="min-h-full relative z-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
