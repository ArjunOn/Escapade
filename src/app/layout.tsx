import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { AuthProvider } from "@/contexts/AuthContext";

const openSans = Open_Sans({
  variable: "--font-open-sans",
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
        className={`${openSans.variable} antialiased min-h-screen bg-background text-foreground relative overflow-x-hidden`}
      >
        <AuthProvider>
          <RouteGuard>
            <Navbar />

            <main className="container mx-auto px-4 py-4 pt-20 md:py-8 md:pt-24 max-w-5xl relative z-10 pb-24 md:pb-8 lg:pl-0">
              {children}
            </main>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
