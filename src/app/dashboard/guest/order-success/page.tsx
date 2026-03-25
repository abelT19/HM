import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Success | Palais Portal",
  description: "Your order has been captured",
};

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Order Captured!</h1>
        <p className="text-slate-600 mb-6">
          Order captured locally! Our team will verify your receipt shortly.
        </p>
        <div className="space-y-3">
          <a
            href="/dashboard/guest"
            className="block w-full bg-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
          >
            Back to Palais Portal
          </a>
          <a
            href="/order-food"
            className="block w-full bg-slate-100 text-slate-800 py-3 px-6 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Order More Food
          </a>
        </div>
      </div>
    </div>
  );
}
