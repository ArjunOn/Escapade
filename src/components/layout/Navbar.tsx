"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home, Calendar, Compass, Wallet,
    BookOpen, LayoutGrid, Zap, User,
    LogOut, Settings, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { useAppStore } from '@/lib/store';
import { LoginModal } from '@/components/features/auth/LoginModal';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const navItems = [
    { name: 'Home', href: '/', icon: Home, color: 'text-primary' },
    { name: 'Planner', href: '/planner', icon: Calendar, color: 'text-[#60a5fa]' },
    { name: 'Discovery', href: '/discovery', icon: Compass, color: 'text-[#34d399]' },
    { name: 'Budget', href: '/budget', icon: Wallet, color: 'text-[#fb923c]' },
    { name: 'Journal', href: '/journal', icon: BookOpen, color: 'text-[#a78bfa]' },
    { name: 'Calendar', href: '/calendar', icon: LayoutGrid, color: 'text-[#facc15]' },
];

export function Navbar() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { userProfile, logout, currentUserEmail } = useAppStore();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const UserActions = ({ isMobile = false }) => {
        if (!currentUserEmail) {
            return (
                <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    className={cn(
                        "bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] h-9 px-4 rounded-xl shadow-lg shadow-primary/20",
                        isMobile && "flex-1 h-12"
                    )}
                >
                    Sign In
                </Button>
            );
        }

        const isOnboarded = userProfile?.onboardingCompleted;

        if (!isOnboarded) {
            return (
                <Link
                    href="/onboarding"
                    className={cn(
                        "w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-all group",
                        isMobile && "w-12 h-12"
                    )}
                >
                    <Sparkles className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                </Link>
            );
        }

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button className={cn(
                        "w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group outline-none",
                        isMobile && "w-12 h-12"
                    )}>
                        <User className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 glass border-white/10 p-2 shadow-2xl z-[100]" align="end">
                    <div className="p-3 border-b border-white/5 mb-1">
                        <p className="text-xs font-bold text-white truncate">{userProfile?.name || 'Commander'}</p>
                        <p className="text-[10px] text-white/40 truncate">{currentUserEmail}</p>
                    </div>
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left">
                            <User className="w-4 h-4" /> My Profile
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left">
                            <Settings className="w-4 h-4" /> Preferences
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-all text-left"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <>
            {/* Desktop Navbar */}
            <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl h-16 glass z-50 px-8 items-center justify-between shadow-2xl transition-all border-white/5">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-serif italic text-xl tracking-tighter text-white group-hover:text-primary transition-colors">Escapade</span>
                </Link>

                {currentUserEmail && (
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
                )}

                <div className="flex items-center gap-4">
                    <UserActions />
                </div>
            </header>

            {/* Mobile Bottom Nav */}
            {currentUserEmail && (
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
                        <div className="flex-1 flex justify-center">
                            <UserActions isMobile={true} />
                        </div>
                    </div>
                </nav>
            )}

            {!currentUserEmail && (
                <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
                    <UserActions isMobile={true} />
                </div>
            )}

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    );
}
