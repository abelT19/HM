import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const dynamic = 'force-dynamic';

let cachedMenuItems: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Hardcoded fallback for when DB is down or times out
// Minimal list so guests always see at least two core items
const FALLBACK_MENU = [
  {
    id: "fallback-signature-doro-wat",
    name: "Doro Wat",
    description: "Spicy Ethiopian chicken stew served with injera",
    price: 15.0,
    category: "Signature Platters",
    image_url: null,
    is_active: true,
  },
  {
    id: "fallback-meat-special-kitfo",
    name: "Special Kitfo",
    description: "Minced beef seasoned with mitmita and niter kibbeh",
    price: 20.0,
    category: "Meat Dishes",
    image_url: null,
    is_active: true,
  },
];

export async function GET() {
  try {
    // Give the DB 5 seconds to respond
    const [menuItems]: any = await Promise.race([
      pool.execute("SELECT * FROM Menu WHERE is_active = 1 ORDER BY category ASC, name ASC"),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000)),
    ]);

    cachedMenuItems = menuItems;
    cacheTimestamp = Date.now();
    return NextResponse.json(menuItems);
  } catch (error) {
    const err = error as any;
    console.error("GET Menu Error:", {
      message: err?.message,
      code: err?.code,
      errno: err?.errno,
      sqlState: err?.sqlState,
      sqlMessage: err?.sqlMessage,
    });

    // Fallback to cache if available and not too old
    if (cachedMenuItems && (Date.now() - cacheTimestamp) < CACHE_TTL_MS) {
      console.warn("[MENU] Serving stale cache due to DB error");
      return NextResponse.json(cachedMenuItems);
    }

    // Final fallback: hardcoded menu
    console.warn("[MENU] Serving hardcoded fallback menu due to DB failure");
    return NextResponse.json(FALLBACK_MENU);
  }
}
