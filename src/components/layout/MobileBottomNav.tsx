"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, CalendarDays, Wallet, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const BOTTOM_NAV = [
  { href: "/",         icon: LayoutDashboard, label: "Home"     },
  { href: "/discover", icon: Compass,         label: "Discover" },
  { href: "/planner",  icon: CalendarDays,    label: "Planner"  },
  { href: "/budget",   icon: Wallet,          label: "Budget"   },
  { href: "/ai",       icon: Sparkles,        label: "AI"       },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-[var(--color-border)] safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1">
        {BOTTOM_NAV.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[56px]",
                isActive
                  ? "text-[var(--color-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              )}>
              <item.icon className={cn("w-5 h-5", isActive && "scale-110 transition-transform")} />
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-1 h-1 rounded-full bg-[var(--color-primary)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
