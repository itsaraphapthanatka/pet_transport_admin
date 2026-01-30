"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    ShieldCheck,
    ShieldAlert,
    UserCheck,
    UserX,
    FileText,
    Loader2,
    ExternalLink,
    CheckCircle,
    XCircle,
    Car,
    CreditCard,
    IdCard,
    Calendar,
    Palette,
    Search,
    Filter
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export function VerificationContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [typeFilter, setTypeFilter] = useState('all');

    const fetchPendingDrivers = async () => {
        try {
            setLoading(true);
            const res = await apiFetch('/admin/drivers/pending');
            if (res.ok) {
                const data = await res.json();
                setDrivers(data);
            }
        } catch (error) {
            console.error('Error fetching drivers for verification:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingDrivers();
    }, []);

    const handleVerify = async (driverId: number) => {
        const confirmed = window.confirm("Are you sure you want to approve this driver? They will be able to accept jobs immediately.");
        if (!confirmed) return;

        try {
            const res = await apiFetch(`/admin/drivers/${driverId}/approve`, {
                method: 'POST'
            });

            if (res.ok) {
                alert("Driver verified successfully!");
                setDrivers(prev => prev.filter(d => d.id !== driverId));
            } else {
                const err = await res.json();
                alert(`Failed: ${err.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error verifying driver:', error);
            alert("Error connecting to server");
        }
    };

    const handleReject = async (driverId: number) => {
        const reason = window.prompt("Please enter the reason for rejection:");
        if (reason === null) return; // Cancelled
        if (!reason.trim()) {
            alert("Rejection reason is required.");
            return;
        }

        try {
            const res = await apiFetch(`/admin/drivers/${driverId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason })
            });

            if (res.ok) {
                alert("Driver rejected.");
                setDrivers(prev => prev.filter(d => d.id !== driverId));
            } else {
                const err = await res.json();
                alert(`Failed: ${err.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error rejecting driver:', error);
            alert("Error connecting to server");
        }
    };

    const openDocument = (url: string | null) => {
        if (!url) {
            alert("Document not uploaded");
            return;
        }
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
        window.open(fullUrl, '_blank');
    };

    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch =
            driver.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            driver.phone?.includes(searchQuery) ||
            driver.id?.toString() === searchQuery ||
            driver.vehicle_plate?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = typeFilter === 'all' || driver.vehicle_type === typeFilter;

        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div style={{ paddingBottom: '100px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Verification Queue</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Review and approve driver registration requests. ({filteredDrivers.length} pending)</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {/* Search bar */}
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search name, email, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                height: '44px',
                                padding: '0 16px 0 40px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {/* Filter */}
                    <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                        {['all', 'car', 'suv', 'van'].map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    textTransform: 'capitalize',
                                    color: typeFilter === type ? '#fff' : '#64748b',
                                    background: typeFilter === type ? 'var(--primary)' : 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                {filteredDrivers.map((driver) => (
                    <div key={driver.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '16px',
                                    background: '#f1f5f9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    overflow: 'hidden',
                                    border: '2px solid #e2e8f0'
                                }}>
                                    {driver.profile_image_url ? (
                                        <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${driver.profile_image_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <UserCheck size={32} color="#94a3b8" />
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>{driver.full_name}</h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{driver.email}</p>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Phone: {driver.phone}</p>
                                </div>
                            </div>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '6px 10px',
                                borderRadius: '8px',
                                background: '#fff7ed',
                                color: '#c2410c',
                                border: '1px solid #fed7aa'
                            }}>
                                PENDING REVIEW
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Vehicle Details */}
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Car size={16} /> VEHICLE INFO
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Type / Plate</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{driver.vehicle_type?.toUpperCase()} / {driver.vehicle_plate}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Brand / Model</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{driver.vehicle_brand} {driver.vehicle_model}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Color / Year</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{driver.vehicle_color} ({driver.vehicle_year})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Details */}
                            <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '16px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0369a1', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CreditCard size={16} /> BANK ACCOUNT
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: '#7dd3fc' }}>Bank</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#075985' }}>{driver.bank_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: '#7dd3fc' }}>Account No.</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#075985' }}>{driver.bank_account_number}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '13px', color: '#7dd3fc' }}>Account Name</span>
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#075985' }}>{driver.bank_account_name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Registration Documents</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    { label: 'ID Card (Front)', url: driver.id_card_front_url, icon: <IdCard size={14} /> },
                                    { label: 'Driving License', url: driver.driver_license_front_url, icon: <FileText size={14} /> },
                                    { label: 'Vehicle registration', url: driver.vehicle_registration_url, icon: <Car size={14} /> },
                                    { label: 'Bank Book', url: driver.bank_account_image_url, icon: <CreditCard size={14} /> },
                                    { label: 'Selfie with ID', url: driver.selfie_with_id_url, icon: <ShieldAlert size={14} /> }
                                ].map((doc, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => openDocument(doc.url)}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            background: doc.url ? '#f8fafc' : '#f1f5f9',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            cursor: doc.url ? 'pointer' : 'default',
                                            opacity: doc.url ? 1 : 0.5
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            {doc.icon}
                                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{doc.label}</span>
                                        </div>
                                        {doc.url ? <ExternalLink size={14} color="var(--primary)" /> : <span style={{ fontSize: '10px', color: '#94a3b8' }}>MISSING</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Vehicle Photos */}
                        {driver.vehicle_images && driver.vehicle_images.length > 0 && (
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Vehicle Photos</h4>
                                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                                    {driver.vehicle_images.map((img: string, idx: number) => (
                                        <img
                                            key={idx}
                                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${img}`}
                                            onClick={() => openDocument(img)}
                                            style={{
                                                width: '120px',
                                                height: '120px',
                                                borderRadius: '12px',
                                                objectFit: 'cover',
                                                cursor: 'pointer',
                                                border: '1px solid #e2e8f0'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                            <button
                                className="btn-primary"
                                onClick={() => handleVerify(driver.id)}
                                style={{ flex: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px' }}
                            >
                                <UserCheck size={20} />
                                Approve Driver
                            </button>
                            <button
                                onClick={() => handleReject(driver.id)}
                                style={{
                                    flex: 1,
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    background: '#fff',
                                    border: '1px solid #ef4444',
                                    color: '#ef4444',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}>
                                <UserX size={20} />
                                Reject Request
                            </button>
                        </div>
                    </div>
                ))}

                {filteredDrivers.length === 0 && (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 60px' }}>
                        <div style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: '50%',
                            background: '#f8fafc',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <Search size={48} />
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: '800' }}>No results found</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '16px' }}>Try adjusting your search or filters to find what you're looking for.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setTypeFilter('all'); }}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                background: 'var(--primary)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {drivers.length === 0 && !loading && (
                    <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 60px' }}>
                        <div style={{
                            width: '96px',
                            height: '96px',
                            borderRadius: '50%',
                            background: '#ecfdf5',
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <ShieldCheck size={48} />
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: '800' }}>Verification Clear!</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '16px' }}>All pending driver registration requests have been reviewed.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default function VerificationPage() {
    return (
        <Suspense fallback={
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        }>
            <VerificationContent />
        </Suspense>
    );
}
