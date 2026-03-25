import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAuditReport, getDetailedAudit, getAllTransactionsDetail } from "@/lib/audit";

export async function GET(req: NextRequest) {
    try {
        const isProd = process.env.NODE_ENV === "production";
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token"
        });

        if (!token || token.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const url = new URL(req.url);
        const interval = url.searchParams.get("interval") || "day";
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const type = url.searchParams.get("type") as 'ROOM' | 'FOOD' | 'MEMBERSHIP' | 'ALL' | null;

        if (type === 'ALL') {
            const report = await getAllTransactionsDetail(startDate || undefined, endDate || undefined);
            return NextResponse.json(report);
        }

        if (type) {
            const report = await getDetailedAudit(type, startDate || undefined, endDate || undefined);
            return NextResponse.json(report);
        }

        const result = await getAuditReport(interval, startDate || undefined, endDate || undefined);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("GET Audit Report Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
