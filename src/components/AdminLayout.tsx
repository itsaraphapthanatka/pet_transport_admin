"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2 } from 'lucide-react';

const LOGIN_PATH = '/login';

/**
 * 'checking' until the effect has read localStorage once (the pages are static
 * shells, so the token is unknown while prerendering and during hydration).
 */
type AuthState = 'checking' | 'authenticated' | 'anonymous';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authState, setAuthState] = useState<AuthState>('checking');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isLoginPage = pathname === LOGIN_PATH;

    // This component is mounted once by the root layout, so it must re-decide on
    // every client-side navigation. The state is derived from (pathname, token)
    // only - never from "am I already redirecting" - otherwise a redirect that
    // is still in flight leaves the whole panel stuck on the spinner forever.
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const onLoginPage = pathname === LOGIN_PATH;

        if (!token && !onLoginPage) {
            router.replace(LOGIN_PATH);
        } else if (token && onLoginPage) {
            router.replace('/');
        }

        // Always resolved, in every branch: the redirect only changes which
        // pathname the next run of this effect sees.
        setAuthState(token ? 'authenticated' : 'anonymous');
    }, [pathname, router]);

    const spinner = (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} suppressHydrationWarning>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
    );

    if (authState === 'checking') return spinner;

    if (isLoginPage) {
        // Signed in but sitting on /login: router.replace('/') is in flight.
        return authState === 'authenticated' ? spinner : <>{children}</>;
    }

    // Signed out on a protected page: router.replace('/login') is in flight.
    if (authState !== 'authenticated') return spinner;

    return (
        <div className="admin-layout">
            {/* Overlay for mobile sidebar */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="main-content">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="page-container">
                    {children}
                </div>
            </main>
        </div>
    );
}
