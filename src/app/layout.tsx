import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Escapade | Mission Control",
  description: "Your personalized weekend adventure planner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen text-foreground relative overflow-x-hidden`}
      >
        {/* Background Atmosphere */}
        <div className="radial-glow" />
        <div className="starfield" />

        {/* Navigation is currently handled by Navbar which I'll overhaul next */}
        <Navbar />

        <main className="container mx-auto px-4 py-4 pt-24 md:py-8 md:pt-32 max-w-5xl relative z-10 pb-24 md:pb-8 lg:pl-0">
          {children}
        </main>
      </body>
    </html>
  );
}
