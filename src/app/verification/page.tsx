"use client";

import React, { useEffect, useState } from 'react';
import {
    ShieldCheck,
    ShieldAlert,
    UserCheck,
    UserX,
    FileText,
    Loader2,
    ExternalLink,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function VerificationPage() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPendingDrivers() {
            try {
                const res = await apiFetch('/drivers/');
                if (res.ok) {
                    const data = await res.json();
                    // Filter only non-verified drivers
                    setDrivers(data.filter((d: any) => !d.is_verified));
                }
            } catch (error) {
                console.error('Error fetching drivers for verification:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPendingDrivers();
    }, []);

    const handleVerify = async (driverId: number) => {
        // Note: backend might need a specific verification endpoint
        // For now, let's assume we update the driver record
        try {
            // Logic for verification would go here
            alert(`Verifying driver ID: ${driverId} (Endpoint integration pending)`);
        } catch (error) {
            console.error('Error verifying driver:', error);
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
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Verification Queue</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Review and approve driver registration requests. ({drivers.length} pending)</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                {drivers.map((driver) => (
                    <div key={driver.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: '#fef3c7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#d97706'
                                }}>
                                    <ShieldAlert size={28} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>{driver.full_name}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Joined {new Date(driver.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                background: '#fff7ed',
                                color: '#c2410c'
                            }}>
                                PENDING REVIEW
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                            <div>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Phone</p>
                                <p style={{ fontSize: '14px', fontWeight: '500' }}>{driver.phone}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Vehicle</p>
                                <p style={{ fontSize: '14px', fontWeight: '500' }}>{driver.vehicle_type} ({driver.vehicle_plate})</p>
                            </div>
                        </div>

                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={16} color="var(--primary)" />
                                Submitted Documents
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f1f5f9', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>Driver's License</span>
                                    <ExternalLink size={14} color="var(--primary)" style={{ cursor: 'pointer' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f1f5f9', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '13px' }}>Vehicle Registration</span>
                                    <ExternalLink size={14} color="var(--primary)" style={{ cursor: 'pointer' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                            <button
                                className="btn-primary"
                                onClick={() => handleVerify(driver.id)}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                            >
                                <CheckCircle size={18} />
                                Approve
                            </button>
                            <button style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                background: '#fff',
                                border: '1px solid #ef4444',
                                color: '#ef4444',
                                borderRadius: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}>
                                <XCircle size={18} />
                                Reject
                            </button>
                        </div>
                    </div>
                ))}

                {drivers.length === 0 && (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#ecfdf5',
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <ShieldCheck size={40} />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Everything up to date!</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>There are no drivers pending verification at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
