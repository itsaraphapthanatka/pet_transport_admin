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
    PawPrint,
    X
} from 'lucide-react';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/login');
    };

    const [role, setRole] = React.useState<string>('admin');

    React.useEffect(() => {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setRole(user.role || 'admin');
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/', roles: ['super_admin', 'admin', 'moderator'] },
        { name: 'Users', icon: Users, href: '/users', roles: ['super_admin', 'admin'] },
        { name: 'Drivers', icon: Car, href: '/drivers', roles: ['super_admin', 'admin'] },
        { name: 'Orders', icon: ClipboardList, href: '/orders', roles: ['super_admin', 'admin', 'moderator'] },
        { name: 'Live Map', icon: MapIcon, href: '/map', roles: ['super_admin', 'admin', 'moderator'] },
        { name: 'Verification', icon: ShieldCheck, href: '/verification', roles: ['super_admin', 'admin'] },
        { name: 'Notifications', icon: Bell, href: '/notifications', roles: ['super_admin', 'admin', 'moderator'] },
        { name: 'Admin Management', icon: Users, href: '/admins', roles: ['super_admin'] },
        { name: 'Vehicle Types', icon: Car, href: '/settings/vehicle-types', roles: ['super_admin', 'admin'] },
        { name: 'Pet Types', icon: PawPrint, href: '/settings/pet-types', roles: ['super_admin', 'admin'] },
        { name: 'Settings', icon: Settings, href: '/settings', roles: ['super_admin', 'admin'] },
    ];

    const filteredMenuItems = menuItems.filter(item => item.roles.includes(role));

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--primary)', padding: '6px', borderRadius: '8px' }}>
                        <PawPrint size={24} color="white" />
                    </div>
                    <h1>PetGo Admin</h1>
                </div>
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-on-sidebar)',
                        cursor: 'pointer',
                        display: isOpen ? 'block' : 'none' // Only show when open (implied mobile)
                    }}
                    className="md:hidden" // Tailwind utility if available, or rely on JS/CSS
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1">
                <ul className="nav-list">
                    {filteredMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                    onClick={() => onClose?.()} // Close sidebar on nav click
                                >
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
