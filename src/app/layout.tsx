import './globals.css';
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Providers } from '@/components/Providers';
import { Toaster } from "@/components/ui/Toaster";

// Luxury serif font for headings
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// Clean sans-serif for body text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Africa Hotel - Luxury Accommodations",
  description: "Experience world-class luxury in the heart of the city",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-sans antialiased min-h-screen bg-background selection:bg-amber-200 selection:text-amber-900">
        {/* Wrapping children in Providers allows NextAuth to work everywhere */}
        <Providers>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}