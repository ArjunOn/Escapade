"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Calendar, Compass, Wallet,
    BookOpen, LayoutGrid, Zap, User,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

const navItems = [
    { name: 'Home', href: '/', icon: Home, color: 'text-primary' },
    { name: 'Planner', href: '/planner', icon: Calendar, color: 'text-[#60a5fa]' },
    { name: 'Discovery', href: '/discovery', icon: Compass, color: 'text-[#34d399]' },
    { name: 'Budget', href: '/budget', icon: Wallet, color: 'text-[#fb923c]' },
    { name: 'Journal', href: '/journal', icon: BookOpen, color: 'text-[#a78bfa]' },
    { name: 'Calendar', href: '/calendar', icon: LayoutGrid, color: 'text-[#facc15]' },
];

export function Header() {
    const pathname = usePathname();
    const userProfile = useAppStore((state) => state.userProfile);

    return (
        <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl h-16 glass z-50 px-8 items-center justify-between shadow-2xl transition-all">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif italic text-xl tracking-tighter text-white group-hover:text-primary transition-colors">Escapade</span>
            </Link>

            <nav className="flex items-center gap-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 group",
                                isActive ? "text-white" : "text-white/40 hover:text-white/70"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isActive ? item.color : "text-white/20 group-hover:text-white/40")} />
                            {item.name}
                            {isActive && (
                                <motion.div
                                    layoutId="header-active"
                                    className="absolute inset-0 bg-white/5 rounded-xl z-[-1] border border-white/10"
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="flex items-center gap-4">
                <Link href="/onboarding" className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all group">
                    <User className="w-5 h-5 text-white/40 group-hover:text-white" />
                </Link>
            </div>
        </header>
    );
}

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 glass z-50 border-white/10 overflow-hidden px-2 shadow-2xl">
            <div className="flex justify-around items-center h-full">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center p-2 flex-1">
                            <Icon className={cn(
                                "w-5 h-5 transition-all mb-1",
                                isActive ? item.color : "text-white/40"
                            )} />
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-active"
                                    className="absolute inset-0 bg-white/5 rounded-xl z-[-1]"
                                />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}

export function Navbar() {
    return (
        <>
            <Header />
            <BottomNav />
        </>
    );
}
