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
    Map as MapIcon
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
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'api', label: 'API & External', icon: Globe },
                    ].map((item) => (
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

                    {/* Financial Parameters */}
                    {activeTab === 'financial' && (
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <CreditCard size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Financial Parameters</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {settings.map((setting) => (
                                    <div key={setting.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                                                {setting.key.replace(/_/g, ' ').toUpperCase()}
                                            </label>
                                            <button
                                                onClick={() => handleUpdate(setting.key, setting.value)}
                                                disabled={saving}
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    color: 'var(--primary)',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                                                Update
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={setting.value}
                                            onChange={(e) => setSettings(settings.map(s => s.key === setting.key ? { ...s, value: e.target.value } : s))}
                                            style={{
                                                padding: '10px 16px',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                background: '#f8fafc',
                                                fontSize: '14px',
                                                color: 'var(--text-main)',
                                                outline: 'none'
                                            }}
                                        />
                                        {setting.description && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{setting.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                        <div style={{ textAlign: 'center', padding: '24px' }}>
                            <Shield size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                            <p style={{ fontSize: '14px', fontWeight: '600' }}>Administrative Audit Log</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                All changes to system settings are recorded and attributed to your administrator account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
