import pool from '@/lib/db';

export default async function LoginPage() {
  try {
    // Tests connection to your active Aiven service
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">The Africa Portal</h1>
        <p className="text-green-500">Antigravity Status: Connected to Aiven</p>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <p className="text-red-500">Connection Fault: Check Vercel Environment Variables</p>
      </div>
    );
  }
}