"use client";

import React, { useEffect, useState } from 'react';
import {
    Car,
    Search,
    Filter,
    MoreVertical,
    ShieldCheck,
    ShieldAlert,
    Loader2,
    ExternalLink
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DriversPage() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchDrivers() {
            try {
                const res = await apiFetch('/drivers/');
                if (res.ok) {
                    const data = await res.json();
                    setDrivers(data);
                }
            } catch (error) {
                console.error('Error fetching drivers:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDrivers();
    }, []);

    const filteredDrivers = drivers.filter(driver =>
        driver.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone?.includes(searchTerm)
    );

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
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Driver Management</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage and verify your pet transport fleet.</p>
                </div>
                <button className="btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px' }}>
                    Add New Driver
                </button>
            </div>

            <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#f1f5f9',
                        padding: '10px 16px',
                        borderRadius: '10px'
                    }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                        />
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
                        <Filter size={18} />
                        Filter
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Driver</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Vehicle</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Verification</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Wallet</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDrivers.map((driver) => (
                            <tr key={driver.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--primary)',
                                            fontWeight: '700'
                                        }}>
                                            {driver.full_name?.[0] || 'D'}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{driver.full_name}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{driver.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>{driver.vehicle_type}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{driver.vehicle_plate}</p>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: driver.is_online ? '#10b981' : '#94a3b8'
                                        }}></div>
                                        <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                                            {driver.is_online ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        background: driver.is_verified ? '#ecfdf5' : '#fff7ed',
                                        color: driver.is_verified ? '#059669' : '#c2410c'
                                    }}>
                                        {driver.is_verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                        {driver.is_verified ? 'VERIFIED' : 'PENDING'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                                        ฿{Number(driver.wallet_balance || 0).toLocaleString()}
                                    </p>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button style={{
                                            padding: '6px',
                                            borderRadius: '8px',
                                            background: 'transparent',
                                            border: '1px solid #e2e8f0',
                                            cursor: 'pointer',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <ExternalLink size={16} />
                                        </button>
                                        <button style={{
                                            padding: '6px',
                                            borderRadius: '8px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredDrivers.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No drivers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
