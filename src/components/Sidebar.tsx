"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Car,
    ClipboardList,
    Settings,
    Bell,
    Map as MapIcon,
    ShieldCheck,
    LogOut,
    PawPrint
} from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
        { name: 'Users', icon: Users, href: '/users' },
        { name: 'Drivers', icon: Car, href: '/drivers' },
        { name: 'Orders', icon: ClipboardList, href: '/orders' },
        { name: 'Live Map', icon: MapIcon, href: '/map' },
        { name: 'Verification', icon: ShieldCheck, href: '/verification' },
        { name: 'Notifications', icon: Bell, href: '/notifications' },
        { name: 'Settings', icon: Settings, href: '/settings' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px' }}>
                    <PawPrint size={24} color="white" />
                </div>
                <h1>PetGo Admin</h1>
            </div>

            <nav className="flex-1">
                <ul className="nav-list">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                                    <item.icon size={18} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="mt-auto pt-8 border-t border-slate-800">
                <button
                    className="nav-item w-full text-left"
                    style={{ background: 'transparent', border: 'none' }}
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
