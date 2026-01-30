"use client";

import React, { useEffect, useState } from 'react';
import {
    Settings as SettingsIcon,
    Save,
    RefreshCw,
    Shield,
    Bell,
    CreditCard,
    Globe,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Map as MapIcon,
    Smartphone,
    History,
    Search,
    Filter,
    Download,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';


export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('map');
    const [settings, setSettings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [mapProvider, setMapProvider] = useState<'google' | 'here' | 'longdo'>('google');
    const [loadingMap, setLoadingMap] = useState(false);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterTarget, setFilterTarget] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const storedUser = localStorage.getItem('admin_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [mounted]);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await apiFetch('/settings/');
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchMapSettings() {
            try {
                const res = await apiFetch('/pricing/settings');
                if (res.ok) {
                    const data = await res.json();
                    setMapProvider(data.map || 'google');
                }
            } catch (error) {
                console.error('Error fetching map settings:', error);
            }
        }

        fetchSettings();
        fetchMapSettings();
    }, []);

    const handleUpdate = async (key: string, value: string) => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await apiFetch(`/settings/${key}`, {
                method: 'PUT',
                body: JSON.stringify({ value })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: `Setting "${key}" updated successfully.` });
                const updated = await res.json();
                setSettings(settings.map(s => s.key === key ? updated : s));
            } else {
                throw new Error('Failed to update setting');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleMapProviderUpdate = async (provider: 'google' | 'here' | 'longdo') => {
        setLoadingMap(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await apiFetch('/pricing/settings', {
                method: 'PUT',
                body: JSON.stringify({ map: provider })
            });
            if (res.ok) {
                setMapProvider(provider);
                setMessage({ type: 'success', text: `Map provider updated to ${provider.toUpperCase()}` });
            } else {
                throw new Error('Failed to update map provider');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoadingMap(false);
        }
    };

    const fetchAuditLogs = async () => {
        setLoadingLogs(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filterAction) params.append('action', filterAction);
            if (filterTarget) params.append('target_type', filterTarget);

            const res = await apiFetch(`/admin/logs?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data);
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'audit') {
            const timer = setTimeout(() => {
                fetchAuditLogs();
            }, 300); // Debounce search
            return () => clearTimeout(timer);
        }
    }, [activeTab, searchQuery, filterAction, filterTarget]);

    const handleExportLogs = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filterAction) params.append('action', filterAction);
            if (filterTarget) params.append('target_type', filterTarget);

            const res = await apiFetch(`/admin/logs/export?${params.toString()}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (error) {
            console.error('Error exporting logs:', error);
        }
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
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>System Settings</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Configure platform-wide parameters and thresholds.</p>
            </div>

            {message.text && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${message.type === 'success' ? '#05966933' : '#dc262633'}`,
                    color: message.type === 'success' ? '#059669' : '#dc2626',
                    fontSize: '14px'
                }}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { id: 'general', label: 'General', icon: SettingsIcon },
                        { id: 'map', label: 'Map Provider', icon: MapIcon },
                        { id: 'financial', label: 'Financial', icon: CreditCard },
                        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'api', label: 'API & External', icon: Globe },
                        { id: 'audit', label: 'Audit Log', icon: History },
                    ].filter(item => {
                        if (item.id === 'audit') {
                            return user?.role === 'super_admin';
                        }
                        return true;
                    }).map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: item.id === activeTab ? 'white' : 'transparent',
                            border: 'none',
                            color: item.id === activeTab ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: item.id === activeTab ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
                        }}>
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <SettingsIcon size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>General Settings</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    { key: 'app_name', label: 'Application Name', type: 'text' },
                                    { key: 'contact_email', label: 'Support Email', type: 'email' },
                                    { key: 'contact_phone', label: 'Support Phone', type: 'text' },
                                    { key: 'line_id', label: 'Official Line ID', type: 'text' },
                                ].map((field) => {
                                    const setting = settings.find(s => s.key === field.key);
                                    if (!setting) return null;
                                    return (
                                        <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label className="label">{field.label}</label>
                                                <button
                                                    onClick={() => handleUpdate(field.key, setting.value)}
                                                    disabled={saving}
                                                    className="btn"
                                                    style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', background: 'transparent', border: 'none', padding: '4px 8px' }}
                                                >
                                                    {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                                                    Update
                                                </button>
                                            </div>
                                            <input
                                                type={field.type}
                                                className="input"
                                                value={setting.value}
                                                onChange={(e) => setSettings(settings.map(s => s.key === field.key ? { ...s, value: e.target.value } : s))}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Map Provider Configuration */}
                    {activeTab === 'map' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <MapIcon size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Map Provider Configuration</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                                Select the map service provider for routing and display across all apps (Customer, Driver, Admin).
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {[
                                    { value: 'google', label: 'Google Maps', desc: 'Global coverage, accurate routing' },
                                    { value: 'here', label: 'HERE Maps', desc: 'Enterprise-grade navigation' },
                                    { value: 'longdo', label: 'Longdo Map', desc: 'Thailand-focused mapping' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleMapProviderUpdate(option.value as any)}
                                        disabled={loadingMap}
                                        style={{
                                            flex: '1 1 auto',
                                            minWidth: '180px',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: `2px solid ${mapProvider === option.value ? 'var(--primary)' : '#e2e8f0'}`,
                                            background: mapProvider === option.value ? '#eff6ff' : 'white',
                                            cursor: loadingMap ? 'not-allowed' : 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s',
                                            opacity: loadingMap ? 0.6 : 1
                                        }}
                                    >
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: mapProvider === option.value ? 'var(--primary)' : 'var(--text-main)', marginBottom: '4px' }}>
                                            {option.label}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                            {option.desc}
                                        </div>
                                        {mapProvider === option.value && (
                                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
                                                <CheckCircle2 size={14} />
                                                Active
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OTP & External Services */}
                    {activeTab === 'api' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Smartphone size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>OTP & SMS Configuration</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* OTP Service Mode */}
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>OTP Service Mode</h4>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                                                Switch between Development and Production modes.
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {['dev', 'production'].map((mode) => {
                                                const currentMode = settings.find(s => s.key === 'otp_service')?.value;
                                                return (
                                                    <button
                                                        key={mode}
                                                        onClick={() => handleUpdate('otp_service', mode)}
                                                        style={{
                                                            padding: '6px 16px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            background: currentMode === mode ? 'var(--primary)' : 'white',
                                                            color: currentMode === mode ? 'white' : 'var(--text-muted)',
                                                            border: `1px solid ${currentMode === mode ? 'var(--primary)' : '#e2e8f0'}`,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {mode}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div style={{ padding: '12px', borderRadius: '8px', background: settings.find(s => s.key === 'otp_service')?.value === 'dev' ? '#fffbeb' : '#ecfdf5', color: settings.find(s => s.key === 'otp_service')?.value === 'dev' ? '#92400e' : '#065f46', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                        <AlertCircle size={14} style={{ marginTop: '2px' }} />
                                        <span>
                                            {settings.find(s => s.key === 'otp_service')?.value === 'dev'
                                                ? "DEV MODE: OTPs are logged to console and returned in API response. SMS is NOT sent."
                                                : "PRODUCTION MODE: OTPs are sent via ThaiBulkSMS API. API response is SECURED."}
                                        </span>
                                    </div>
                                </div>

                                {/* ThaiBulkSMS Credentials */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {[
                                        { key: 'thaibulksms_api_key', label: 'ThaiBulkSMS API Key', type: 'text' },
                                        { key: 'thaibulksms_api_secret', label: 'ThaiBulkSMS API Secret', type: 'password' },
                                        { key: 'thaibulksms_sender_id', label: 'ThaiBulkSMS Sender ID', type: 'text' }
                                    ].map((field) => {
                                        const setting = settings.find(s => s.key === field.key);
                                        if (!setting) return null;
                                        return (
                                            <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <label className="label">
                                                        {field.label}
                                                    </label>
                                                    <button
                                                        onClick={() => handleUpdate(field.key, setting.value)}
                                                        disabled={saving}
                                                        className="btn"
                                                        style={{
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            color: 'var(--primary)',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            padding: '4px 8px'
                                                        }}
                                                    >
                                                        {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                                                        Save
                                                    </button>
                                                </div>
                                                <input
                                                    type={field.type}
                                                    className="input"
                                                    value={setting.value}
                                                    onChange={(e) => setSettings(settings.map(s => s.key === field.key ? { ...s, value: e.target.value } : s))}
                                                    placeholder={`Enter ${field.label}...`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <Bell size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Notification Configuration</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                Configure Firebase Cloud Messaging (FCM) for push notifications to Customer and Driver apps.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Push Toggle */}
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Push Notifications</h4>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                                                Global toggle for all mobile push notifications.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const current = settings.find(s => s.key === 'enable_push_notifications')?.value;
                                                handleUpdate('enable_push_notifications', current === 'true' ? 'false' : 'true');
                                            }}
                                            style={{
                                                width: '48px',
                                                height: '24px',
                                                borderRadius: '12px',
                                                background: settings.find(s => s.key === 'enable_push_notifications')?.value === 'true' ? 'var(--primary)' : '#cbd5e1',
                                                border: 'none',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '3px',
                                                left: settings.find(s => s.key === 'enable_push_notifications')?.value === 'true' ? '27px' : '3px',
                                                transition: 'all 0.2s'
                                            }} />
                                        </button>
                                    </div>
                                </div>

                                {/* FCM Server Key */}
                                {['fcm_server_key'].map((key) => {
                                    const setting = settings.find(s => s.key === key);
                                    if (!setting) return null;
                                    return (
                                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label className="label">Firebase Cloud Messaging (FCM) Server Key</label>
                                                <button
                                                    onClick={() => handleUpdate(key, setting.value)}
                                                    disabled={saving}
                                                    className="btn"
                                                    style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', background: 'transparent', border: 'none', padding: '4px 8px' }}
                                                >
                                                    {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                                                    Update
                                                </button>
                                            </div>
                                            <input
                                                type="password"
                                                className="input"
                                                value={setting.value}
                                                onChange={(e) => setSettings(settings.map(s => s.key === key ? { ...s, value: e.target.value } : s))}
                                                placeholder="Enter FCM Server Key..."
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <Shield size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Security & Session Policies</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {settings.filter(s => ['session_timeout_minutes'].includes(s.key)).map((setting) => (
                                    <div key={setting.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label className="label">
                                                {setting.key.replace(/_/g, ' ')} (Minutes)
                                            </label>
                                            <button
                                                onClick={() => handleUpdate(setting.key, setting.value)}
                                                disabled={saving}
                                                className="btn"
                                                style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', background: 'transparent', border: 'none', padding: '4px 8px' }}
                                            >
                                                {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                                                Update
                                            </button>
                                        </div>
                                        <input
                                            type="number"
                                            className="input"
                                            value={setting.value}
                                            onChange={(e) => setSettings(settings.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                                        />
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{setting.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Financial Parameters */}
                    {activeTab === 'financial' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <CreditCard size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Financial Parameters</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {settings.filter(s => ['commission_rate', 'minimum_withdrawal', 'base_fare'].includes(s.key)).map((setting) => (
                                    <div key={setting.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label className="label">
                                                {setting.key.replace(/_/g, ' ')}
                                            </label>
                                            <button
                                                onClick={() => handleUpdate(setting.key, setting.value)}
                                                disabled={saving}
                                                className="btn"
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    color: 'var(--primary)',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    padding: '4px 8px'
                                                }}
                                            >
                                                {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                                                Update
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            className="input"
                                            value={setting.value}
                                            onChange={(e) => setSettings(settings.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                                        />
                                        {setting.description && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{setting.description}</p>
                                        )}
                                    </div>
                                ))}
                                {settings.filter(s => !['commission_rate', 'minimum_withdrawal', 'base_fare', 'otp_service', 'thaibulksms_api_key', 'thaibulksms_api_secret', 'thaibulksms_sender_id', 'app_name', 'contact_email', 'contact_phone', 'line_id', 'fcm_server_key', 'enable_push_notifications', 'session_timeout_minutes'].includes(s.key)).length > 0 && (
                                    <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '16px' }}>Other Settings</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {settings.filter(s => !['commission_rate', 'minimum_withdrawal', 'base_fare', 'otp_service', 'thaibulksms_api_key', 'thaibulksms_api_secret', 'thaibulksms_sender_id', 'app_name', 'contact_email', 'contact_phone', 'line_id', 'fcm_server_key', 'enable_push_notifications', 'session_timeout_minutes'].includes(s.key)).map((setting) => (
                                                <div key={setting.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <label className="label">
                                                            {setting.key.replace(/_/g, ' ')}
                                                        </label>
                                                        <button
                                                            onClick={() => handleUpdate(setting.key, setting.value)}
                                                            disabled={saving}
                                                            className="btn"
                                                            style={{
                                                                fontSize: '12px',
                                                                fontWeight: '700',
                                                                color: 'var(--primary)',
                                                                background: 'transparent',
                                                                border: 'none',
                                                                padding: '4px 8px'
                                                            }}
                                                        >
                                                            {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                                                            Update
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={setting.value}
                                                        onChange={(e) => setSettings(settings.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Methods */}
                    {activeTab === 'payments' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <CreditCard size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Payment Methods Configuration</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                                Enable or disable specific payment methods for customers. Changes will reflect immediately in both Customer and Driver apps.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    { key: 'ENABLE_CASH_PAYMENT', label: 'Cash Payment', description: 'Allow customers to pay with cash upon delivery' },
                                    { key: 'ENABLE_PROMPTPAY_PAYMENT', label: 'PromptPay', description: 'Allow customers to pay via PromptPay QR code' },
                                    { key: 'ENABLE_WALLET_PAYMENT', label: 'Wallet Balance', description: 'Allow customers to pay using their wallet balance' },
                                    { key: 'ENABLE_STRIPE_PAYMENT', label: 'Credit/Debit Card (Stripe)', description: 'Allow customers to pay with credit or debit cards via Stripe' },
                                ].map((method) => {
                                    const setting = settings.find(s => s.key === method.key);
                                    if (!setting) return null;
                                    const isEnabled = setting.value === 'true';

                                    return (
                                        <div key={method.key} style={{
                                            background: '#f8fafc',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{method.label}</h4>
                                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                                                        {method.description}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleUpdate(method.key, isEnabled ? 'false' : 'true')}
                                                    disabled={saving}
                                                    style={{
                                                        width: '48px',
                                                        height: '24px',
                                                        borderRadius: '12px',
                                                        background: isEnabled ? 'var(--primary)' : '#cbd5e1',
                                                        border: 'none',
                                                        position: 'relative',
                                                        cursor: saving ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.2s',
                                                        opacity: saving ? 0.6 : 1
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        borderRadius: '50%',
                                                        background: 'white',
                                                        position: 'absolute',
                                                        top: '3px',
                                                        left: isEnabled ? '27px' : '3px',
                                                        transition: 'all 0.2s'
                                                    }} />
                                                </button>
                                            </div>
                                            {isEnabled && (
                                                <div style={{
                                                    marginTop: '12px',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    background: '#ecfdf5',
                                                    color: '#065f46',
                                                    fontSize: '12px',
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'center',
                                                    fontWeight: '600'
                                                }}>
                                                    <CheckCircle2 size={14} />
                                                    <span>Active - Available for all bookings</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}



                    {/* Audit Logs */}



                    {/* Audit Logs */}
                    {activeTab === 'audit' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <History size={20} color="var(--primary)" />
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>System Audit Logs</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={handleExportLogs}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 16px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            color: 'var(--text-main)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <Download size={14} />
                                        Export CSV
                                    </button>
                                    <button
                                        onClick={() => {
                                            console.log('Refreshing logs...');
                                            fetchAuditLogs();
                                        }}
                                        disabled={loadingLogs}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 16px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            cursor: loadingLogs ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.2s',
                                            opacity: loadingLogs ? 0.7 : 1
                                        }}
                                        onMouseOver={(e) => { if (!loadingLogs) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                                        onMouseOut={(e) => { if (!loadingLogs) e.currentTarget.style.filter = 'none'; }}
                                    >
                                        <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} />
                                        {loadingLogs ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                            </div>

                            {/* Search and Filters */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginBottom: '24px',
                                padding: '16px',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text"
                                        placeholder="Search details, IP, or Target ID..."
                                        className="input"
                                        style={{ paddingLeft: '40px', fontSize: '14px' }}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flex: '0 1 auto' }}>
                                    <select
                                        className="input"
                                        style={{ width: '150px', fontSize: '13px' }}
                                        value={filterAction}
                                        onChange={(e) => setFilterAction(e.target.value)}
                                    >
                                        <option value="">All Actions</option>
                                        <option value="verify_driver">Verify Driver</option>
                                        <option value="reject_driver">Reject Driver</option>
                                        <option value="admin_cancel_order">Admin Cancel</option>
                                        <option value="update_settings">Update Settings</option>
                                        <option value="upload_pet_image">Upload Photo</option>
                                    </select>
                                    <select
                                        className="input"
                                        style={{ width: '150px', fontSize: '13px' }}
                                        value={filterTarget}
                                        onChange={(e) => setFilterTarget(e.target.value)}
                                    >
                                        <option value="">All Targets</option>
                                        <option value="driver">Driver</option>
                                        <option value="order">Order</option>
                                        <option value="settings">Settings</option>
                                        <option value="pet_image">Pet Image</option>
                                    </select>
                                </div>
                            </div>

                            {loadingLogs && auditLogs.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid #e2e8f0' }}>
                                                <th style={{ padding: '12px', fontWeight: '600' }}>Time</th>
                                                <th style={{ padding: '12px', fontWeight: '600' }}>Admin</th>
                                                <th style={{ padding: '12px', fontWeight: '600' }}>Action</th>
                                                <th style={{ padding: '12px', fontWeight: '600' }}>Target</th>
                                                <th style={{ padding: '12px', fontWeight: '600' }}>Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                        No matching logs found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                auditLogs.map((log: any) => (
                                                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                                                            {new Date(log.created_at).toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '50%',
                                                                    background: '#f1f5f9',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontSize: '10px',
                                                                    fontWeight: '700',
                                                                    color: 'var(--primary)'
                                                                }}>
                                                                    {log.admin?.full_name?.[0] || 'S'}
                                                                </div>
                                                                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                                                    {log.admin?.full_name || 'System'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px' }}>
                                                            <span style={{
                                                                padding: '4px 8px',
                                                                borderRadius: '4px',
                                                                background: '#eff6ff',
                                                                color: 'var(--primary)',
                                                                fontSize: '11px',
                                                                fontWeight: '700',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {log.action?.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                                                            {log.target_type && (
                                                                <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '13px' }}>
                                                                    {log.target_type}
                                                                </span>
                                                            )}
                                                            {log.target_id && (
                                                                <span style={{ color: 'var(--text-muted)', marginLeft: '4px', fontSize: '12px' }}>
                                                                    #{log.target_id}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                            {log.details}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
