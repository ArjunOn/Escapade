import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { RouteGuard } from "@/components/layout/RouteGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Escapade · Weekend Companion",
  description: "A lifestyle planner that blends weekend time, budget, and habits into one calm companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} antialiased min-h-screen bg-background text-foreground relative overflow-x-hidden`}
      >
        <RouteGuard>
          <Navbar />

          <main className="container mx-auto px-4 py-4 pt-20 md:py-8 md:pt-24 max-w-5xl relative z-10 pb-24 md:pb-8 lg:pl-0">
            {children}
          </main>
        </RouteGuard>
      </body>
    </html>
  );
}
