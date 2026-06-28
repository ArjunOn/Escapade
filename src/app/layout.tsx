import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Escapade · Your Weekend Companion",
  description: "Discover local events, plan your weekend, and stay on budget — powered by AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Escapade",
  },
  keywords: ["events", "weekend", "planning", "budget", "local events", "things to do"],
  openGraph: {
    title: "Escapade · Your Weekend Companion",
    description: "Discover local events, plan your weekend, and stay on budget — powered by AI.",
    type: "website",
    siteName: "Escapade",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${roboto.variable} antialiased`}>
        <AuthProvider>
          <ToastProvider>
          <RouteGuard>
            {/* Desktop: sidebar + topbar shell */}
            <div className="app-shell">
              <Navbar />
              {/* main content — add pb for mobile bottom nav */}
              <main className="app-main pb-20 lg:pb-6">
                {children}
              </main>
            </div>
            {/* Mobile bottom navigation */}
            <MobileBottomNav />
          </RouteGuard>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
