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
import { ProfileModal } from '@/components/features/profile/ProfileModal';
import { PreferencesModal } from '@/components/features/profile/PreferencesModal';
import { useAuth } from '@/contexts/AuthContext';
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
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { userProfile } = useAppStore();
    const { user, signOut } = useAuth();
    const currentUserEmail = user?.email || null;

    const handleLogout = () => {
        signOut().finally(() => {
            router.push('/');
        });
    };

    const UserActions = ({ isMobile = false }) => {
        if (!currentUserEmail) {
            return (
                <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    className={cn(
                        "bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-[10px] h-9 px-4 rounded-xl shadow-sm",
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
                        "w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all group",
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
                        "w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all group outline-none",
                        isMobile && "w-12 h-12"
                    )}>
                        <User className="w-5 h-5 text-slate-500 group-hover:text-slate-800 transition-colors" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 glass border-slate-200 p-2 shadow-xl z-[100]" align="end">
                    <div className="p-3 border-b border-slate-200 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{userProfile?.name || user?.user_metadata?.username || 'Commander'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{currentUserEmail}</p>
                    </div>
                    <div className="space-y-1">
                        <button 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all text-left">
                            <User className="w-4 h-4" /> My Profile
                        </button>
                        <button 
                            onClick={() => setIsPreferencesModalOpen(true)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all text-left">
                            <Settings className="w-4 h-4" /> Preferences
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all text-left"
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
            <header className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl h-16 glass z-50 px-8 items-center justify-between shadow-xl transition-all border-slate-200">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-slate-900 group-hover:text-primary transition-colors">Escapade</span>
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
                                        isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? item.color : "text-slate-300 group-hover:text-slate-400")} />
                                    {item.name}
                                    {isActive && (
                                        <motion.div
                                            layoutId="header-active"
                                            className="absolute inset-0 bg-slate-50 rounded-xl z-[-1] border border-slate-200"
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
                <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 glass z-50 border-slate-200 overflow-hidden px-2 shadow-xl">
                    <div className="flex justify-around items-center h-full">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center p-2 flex-1">
                                    <Icon className={cn(
                                        "w-5 h-5 transition-all mb-1",
                                        isActive ? item.color : "text-slate-400"
                                    )} />
                                    {isActive && (
                                        <motion.div
                                            layoutId="bottom-nav-active"
                                            className="absolute inset-0 bg-slate-50 rounded-xl z-[-1]"
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
            
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            <PreferencesModal
                isOpen={isPreferencesModalOpen}
                onClose={() => setIsPreferencesModalOpen(false)}
            />
        </>
    );
}
