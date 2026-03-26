import Image from "next/image";
import { pool } from "@/lib/db";
import RoomsGrid from "./RoomsGrid";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

type Room = {
  id: string;
  roomNumber: string;
  type: string;
  price: number;
  capacity?: number;
  isAvailable: boolean;
  status: string;
};

async function getRooms() {
  try {
    const [rooms]: any = await pool.execute(
      "SELECT id, roomNumber, type, price, isAvailable, status FROM Room"
    );
    return rooms as Room[];
  } catch (error) {
    console.error("DB Fetch Error (Rooms):", error);
    return [];
  }
}

export default async function ManageRooms() {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect("/login");

  const role = (session as any)?.user?.role;
  const isCustomer = role === "CUSTOMER";
  const isAdmin = role === "ADMIN";
  const rooms = await getRooms();

  return (
    <div className="relative min-h-screen overflow-hidden font-sans">
      <div className="fixed inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
          alt="Rooms Management Background"
          fill
          unoptimized={true}
          className="object-cover opacity-10 scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/50" />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
              {isCustomer ? "Luxurious Collection" : "Room Inventory"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isCustomer
                ? "Experience the epitome of comfort and elegance in our curated suites."
                : "Manage your property's collection of luxury units."}
            </p>
          </div>
          {isAdmin && (
            <Link href="/dashboard/rooms/add">
              <Button className="rounded-full px-6 shadow-lg hover:shadow-primary/20 transition-all">
                + Add New Room
              </Button>
            </Link>
          )}
        </div>

        <RoomsGrid rooms={rooms} isAdmin={isAdmin} isCustomer={isCustomer} />
      </div>
    </div>
  );
}
