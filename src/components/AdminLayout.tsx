"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const isLoginPage = pathname === '/login';

        if (!token && !isLoginPage) {
            router.push('/login');
        } else if (token && isLoginPage) {
            router.push('/');
        } else {
            setAuthorized(true);
        }
        setLoading(false);
    }, [pathname, router]);

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!authorized) return null;

    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="main-content">
                <Header />
                <div className="page-container">
                    {children}
                </div>
            </main>
        </div>
    );
}
