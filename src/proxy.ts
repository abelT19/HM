import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProd = process.env.NODE_ENV === "production";
  const token: any = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isProd
  });

  // 1. Auth Guard: Redirect unauthenticated users to login
  if (path.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Role Guard: Prevent CUSTOMERs from accessing staff/admin areas
  if (token?.role === "CUSTOMER") {
    const restrictedPaths = ["/dashboard/reception", "/dashboard/admin", "/dashboard/users", "/dashboard/bookings", "/dashboard/staff"];
    if (restrictedPaths.some(prefix => path.startsWith(prefix))) {
      return NextResponse.redirect(new URL("/dashboard/guest", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
