import { pool } from "@/lib/db";
import UsersClient from "./UsersClient";

export const dynamic = 'force-dynamic';

async function getUsers() {
  try {
    const [users]: any = await pool.execute(
      "SELECT id, name, email, role, status FROM User WHERE role IN ('ADMIN', 'RECEPTIONIST')"
    );
    return users;
  } catch (error) {
    console.error("DB Fetch Error (Users):", error);
    return [];
  }
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="min-h-screen relative font-sans">
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/95 via-white/80 to-slate-200/90" />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <UsersClient initialUsers={users} />
      </div>
    </div>
  );
}

