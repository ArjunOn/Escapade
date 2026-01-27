"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';

const PUBLIC_ROUTES = ['/login', '/signup'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const currentUserEmail = useAppStore(state => state.currentUserEmail);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

            if (!currentUserEmail && !isPublicRoute) {
                router.push('/login');
                setIsAuthorized(false);
            } else if (currentUserEmail && isPublicRoute) {
                router.push('/');
                setIsAuthorized(true);
            } else {
                setIsAuthorized(true);
            }
        };

        checkAuth();
    }, [currentUserEmail, pathname, router]);

    // Simple loading state to prevent flash of content
    if (!isAuthorized && !PUBLIC_ROUTES.includes(pathname)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-[10px] uppercase font-bold tracking-[0.5em] text-white/20 animate-pulse">
                    Authenticating Uplink...
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
