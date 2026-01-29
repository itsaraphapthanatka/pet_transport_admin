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
    const [filter, setFilter] = useState('all');

    const fetchNotifications = async () => {
        try {
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
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 10 seconds for real-time feel
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        // Optimistic update
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        // In real app, call bulk read endpoint
    };

    const getIcon = (title: string, priority: string) => {
        if (priority === 'critical' || title.includes('🚨') || title.includes('SOS'))
            return <AlertTriangle size={20} color="white" />;
        if (priority === 'high' || title.includes('❌') || title.includes('⚠️'))
            return <AlertTriangle size={20} color="white" />;
        if (title.includes('💰') || title.includes('ถอนเงิน'))
            return <Clock size={20} color="white" />;
        if (title.includes('🆕') || title.includes('ลงทะเบียน'))
            return <Check size={20} color="white" />;
        return <Info size={20} color="white" />;
    };

    const getIconBg = (title: string, priority: string) => {
        if (priority === 'critical') return '#ef4444'; // Red
        if (priority === 'high') return '#f59e0b'; // Amber
        if (title.includes('🚨') || title.includes('SOS')) return '#ef4444';
        if (title.includes('💰') || title.includes('ถอนเงิน')) return '#22c55e'; // Green for money
        if (title.includes('🆕') || title.includes('ลงทะเบียน')) return '#3b82f6'; // Blue for info
        return '#64748b';
    };

    const getCardBg = (notif: any) => {
        if (notif.is_read) return 'white';
        if (notif.priority === 'critical') return '#fef2f2'; // Very light red
        if (notif.priority === 'high') return '#fffbeb'; // Very light amber
        return '#f8fafc';
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'financial') return n.title.includes('💰') || n.title.includes('ถอนเงิน');
        if (filter === 'sos') return n.title.includes('🚨') || n.title.includes('SOS');
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    if (loading) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>ศูนย์แจ้งเตือนระบบ</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>ติดตามความเคลื่อนไหว และสถานะฉุกเฉินแบบ Real-time</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    >
                        <option value="all">ทั้งหมด</option>
                        <option value="unread">ยังไม่ได้อ่าน</option>
                        <option value="financial">การเงิน / ถอนเงิน</option>
                        <option value="sos">ฉุกเฉิน (SOS)</option>
                    </select>
                    <button
                        onClick={markAllRead}
                        style={{
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
                        }}
                    >
                        <MailOpen size={18} />
                        อ่านทั้งหมด
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredNotifications.map((notif) => (
                    <div
                        key={notif.id}
                        className="card"
                        style={{
                            padding: '20px 24px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '20px',
                            borderLeft: notif.is_read ? '4px solid transparent' : `4px solid ${getIconBg(notif.title, notif.priority)}`,
                            background: getCardBg(notif),
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: notif.is_read ? '0 1px 3px rgba(0,0,0,0.05)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            animation: notif.priority === 'critical' && !notif.is_read ? 'pulse-red 2s infinite' : 'none'
                        }}
                        onClick={() => markAsRead(notif.id)}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: getIconBg(notif.title, notif.priority),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: `0 4px 12px ${getIconBg(notif.title, notif.priority)}44`
                        }}>
                            {getIcon(notif.title, notif.priority)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>{notif.title}</h4>
                                    {!notif.is_read && (
                                        <span style={{
                                            background: getIconBg(notif.title, notif.priority),
                                            color: 'white',
                                            fontSize: '10px',
                                            padding: '2px 8px',
                                            borderRadius: '20px',
                                            fontWeight: '700'
                                        }}>{notif.priority === 'critical' ? 'EMERGENCY' : 'NEW'}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    <Clock size={12} />
                                    {new Date(notif.created_at).toLocaleString('th-TH')}
                                </div>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>{notif.message}</p>

                            {/* Action Buttons based on type */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {notif.title.includes('SOS') && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps?q=${notif.message.match(/พิกัด ([\d.-]+), ([\d.-]+)/)?.[1]},${notif.message.match(/พิกัด ([\d.-]+), ([\d.-]+)/)?.[2]}`, '_blank') }}
                                        style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        ดูพิกัดบนแผนที่
                                    </button>
                                )}
                                {notif.title.includes('ถอนเงิน') && (
                                    <button
                                        style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        ดูรายละเอียดธนาคาร
                                    </button>
                                )}
                                {notif.title.includes('ลงทะเบียน') && (
                                    <button
                                        style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                    >
                                        ตรวจสอบเอกสาร
                                    </button>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {!notif.is_read ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                                    style={{ padding: '8px', color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    title="Mark as read"
                                >
                                    <Check size={18} />
                                </button>
                            ) : (
                                <button style={{ padding: '8px', color: '#e2e8f0', background: 'transparent', border: 'none', cursor: 'default' }}>
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {filteredNotifications.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
                        <Bell size={48} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>ไม่พบการแจ้งเตือน</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>คุณเคลียร์งานทั้งหมดเรียบร้อยแล้ว!</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px -5px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
