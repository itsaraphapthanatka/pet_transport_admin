"use client";

import React, { useEffect, useState } from 'react';
import {
    Bell,
    Search,
    Filter,
    Check,
    Clock,
    AlertTriangle,
    Info,
    Loader2,
    Trash2,
    MailOpen
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotifications() {
            try {
                // Admin likely wants to see all system notifications if possible, 
                // but currently the endpoint filters by user/driver.
                // For now, let's show a simulated list or fetch what's available.
                const res = await apiFetch('/notifications/');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []);

    const getIcon = (title: string) => {
        if (title.toLowerCase().includes('emergency') || title.toLowerCase().includes('error'))
            return <AlertTriangle size={18} color="#dc2626" />;
        if (title.toLowerCase().includes('success') || title.toLowerCase().includes('completed'))
            return <Check size={18} color="#059669" />;
        return <Info size={18} color="#2563eb" />;
    };

    if (loading) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>System Notifications</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Monitor system alerts and communication logs.</p>
                </div>
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    <MailOpen size={18} />
                    Mark all as read
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((notif) => (
                    <div key={notif.id} className="card" style={{
                        padding: '16px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        borderLeft: notif.is_read ? '4px solid transparent' : '4px solid var(--primary)',
                        background: notif.is_read ? 'white' : '#f0fdf4'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {getIcon(notif.title)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>{notif.title}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    <Clock size={12} />
                                    {new Date(notif.created_at).toLocaleString()}
                                </div>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>{notif.message}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ padding: '8px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
                        <Bell size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>No notifications yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>When system alerts are generated, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
