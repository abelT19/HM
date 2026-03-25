"use client";

import { signOut } from "next-auth/react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect } from "react";

export default function AccessDenied() {
    // Automatically sign out the user when they hit this page
    useEffect(() => {
        signOut({ callbackUrl: "/login", redirect: true });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center space-y-8 border-t-8 border-red-500">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <ShieldAlert className="w-12 h-12" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-serif font-bold text-slate-900">Access Denied</h1>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        Your account has been <span className="font-bold text-red-600 uppercase">revoked</span>.
                        You no longer have access to this website.
                    </p>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-400 mb-8">
                        If you believe this is a mistake, please contact your system administrator or management immediately.
                    </p>

                    <Button
                        onClick={() => window.location.href = "/login"}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-2xl text-lg font-bold"
                    >
                        Return to Login
                    </Button>
                </div>
            </div>
        </div>
    );
}
