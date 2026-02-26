"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_ROUTES = ['/login', '/signup'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Don't check auth while still loading
        if (loading) {
            setIsChecking(true);
            return;
        }

        const checkAuth = () => {
            const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

            if (!user && !isPublicRoute && pathname !== '/') {
                // Not logged in and trying to access protected route
                router.push('/login');
                setIsAuthorized(false);
                setIsChecking(false);
            } else if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
                // Logged in user accessing login/signup/home - redirect to dashboard
                window.location.href = '/dashboard';
                setIsAuthorized(false);
                setIsChecking(true);
            } else if (!user && pathname === '/') {
                // Not logged in, on home page - that's fine
                setIsAuthorized(true);
                setIsChecking(false);
            } else {
                // All other cases - authorized
                setIsAuthorized(true);
                setIsChecking(false);
            }
        };

        checkAuth();
    }, [user, loading, pathname, router]);

    // Show loading state while auth is being checked
    if (loading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="text-sm font-semibold text-gray-400 animate-pulse">
                    Loading...
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
