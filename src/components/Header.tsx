import React, { useEffect, useState } from 'react';
import { Search, Bell, User, Menu, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface HeaderProps {
    onMenuClick?: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const router = useRouter();
    const [adminUser, setAdminUser] = useState<any>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [counts, setCounts] = useState({
        pending_drivers: 0,
        unread_notifications: 0,
        total: 0
    });

    const fetchBadgeCounts = async () => {
        try {
            const res = await apiFetch('/admin/badge-counts');
            if (res.ok) {
                const data = await res.json();

                // Play sound if counts increased
                if (data.total > counts.total) {
                    const audio = new Audio('/notification-sound.mp3');
                    audio.play().catch(e => console.log('Audio play blocked'));
                }

                setCounts(data);
            }
        } catch (error) {
            console.error('Error fetching badge counts:', error);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
            try {
                setAdminUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing admin user data", e);
            }
        }

        fetchBadgeCounts();
        const interval = setInterval(fetchBadgeCounts, 10000); // Polling for badges every 10s
        return () => clearInterval(interval);
    }, [counts.total]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/login');
    };

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="header" style={{ position: 'relative' }}>
            <button className="menu-btn" onClick={onMenuClick}>
                <Menu size={24} />
            </button>
            <div className="search-bar" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f1f5f9',
                padding: '8px 16px',
                borderRadius: '10px',
                width: '400px'
            }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                    type="text"
                    placeholder="Search for orders, users, drivers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '14px',
                        color: 'var(--text-main)'
                    }}
                />
            </div>


            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <Link href="/notifications">
                    <button style={{ background: 'transparent', border: 'none', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Bell size={20} color="var(--text-main)" />
                        {counts.unread_notifications > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                border: '2px solid white',
                                minWidth: '18px',
                                textAlign: 'center'
                            }}>
                                {counts.unread_notifications > 999 ? '999+' : counts.unread_notifications}
                            </span>
                        )}
                    </button>
                </Link>

                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                >
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                            {adminUser?.full_name || 'Admin User'}
                        </p>
                        <p style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                            {adminUser?.role?.replace('_', ' ') || 'Administrator'}
                        </p>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <User size={20} />
                    </div>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '12px',
                            width: '200px',
                            background: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            zIndex: 1000
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{adminUser?.email}</p>
                            </div>
                            <Link href="/settings" onClick={() => setShowUserMenu(false)}>
                                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#475569', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                    <SettingsIcon size={16} />
                                    <span>Settings</span>
                                </div>
                            </Link>
                            <div
                                onClick={handleLogout}
                                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#ef4444', transition: 'background 0.2s', cursor: 'pointer' }}
                                className="hover:bg-red-50"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

