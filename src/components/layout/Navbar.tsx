"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import {
  LayoutDashboard, Compass, CalendarDays, Wallet,
  Sparkles, BarChart2, BookOpen, Settings,
  Menu, X, MapPin, Bell, ChevronDown, DollarSign, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileModal } from "@/components/features/profile/ProfileModal";

const NAV_ITEMS = [
  { href: "/",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/discover",  icon: Compass,         label: "Discover"  },
  { href: "/planner",   icon: CalendarDays,    label: "My Week"   },
  { href: "/calendar",  icon: Calendar,        label: "Calendar"  },
  { href: "/budget",    icon: Wallet,          label: "Budget"    },
  { href: "/ai",        icon: Sparkles,        label: "AI Planner"},
  { href: "/insights",  icon: BarChart2,       label: "Insights"  },
  { href: "/journal",   icon: BookOpen,        label: "Journal"   },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { userProfile, weeklySavingsGoal, expenses } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const initials = userProfile?.name
    ? userProfile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const budgetRemaining = Math.max((weeklySavingsGoal || 0) - totalSpent, 0);
  const budgetPct = weeklySavingsGoal > 0 ? Math.min((totalSpent / weeklySavingsGoal) * 100, 100) : 0;

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────── */}
      <header className="app-topbar">
        {/* Hamburger (mobile) */}
        <button
          className="lg:hidden mr-2 p-2 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-8">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[var(--color-text-primary)] text-lg tracking-tight">
            Escapade
          </span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Location pill */}
        {userProfile?.location && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)] text-xs font-medium mr-3">
            <MapPin className="w-3 h-3" />
            {userProfile.location}
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors mr-1">
          <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>

        {/* User avatar */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-[var(--color-bg-alt)] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-semibold">
                {initials}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[var(--color-border)] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--color-border-light)]">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {userProfile?.name || "User"}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { setUserMenuOpen(false); setProfileOpen(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-alt)] transition-colors">
                    <Settings className="w-4 h-4" /> Settings &amp; Profile
                  </button>
                </div>
              </div>
            )}

            {/* Click-away */}
            {userMenuOpen && (
              <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
            )}
          </div>
        ) : (
          <Link href="/login" className="btn-primary text-sm px-4 py-2 rounded-full">
            Sign in
          </Link>
        )}
      </header>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={cn(
          "app-sidebar",
          // Mobile: fixed overlay; Desktop: sticky in grid
          "fixed lg:relative top-[64px] lg:top-[64px] left-0 z-40 w-[240px] lg:w-auto",
          "lg:translate-x-0 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <nav className="py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn("nav-item", isActive && "active")}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Budget widget in sidebar */}
        {user && weeklySavingsGoal > 0 && (
          <div className="mx-3 mt-4 p-3 rounded-xl bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Weekly Budget</span>
            </div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-[var(--color-text-primary)]">${budgetRemaining.toFixed(0)} left</span>
              <span className="text-[var(--color-text-muted)]">of ${weeklySavingsGoal}</span>
            </div>
            <div className="h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${budgetPct}%`,
                  background: budgetPct > 90 ? "var(--color-error)" : budgetPct > 70 ? "var(--color-warning)" : "var(--color-primary)"
                }}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Profile / Settings modal */}
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}
