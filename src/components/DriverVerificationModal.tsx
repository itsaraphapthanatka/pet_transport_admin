"use client";

import React, { useEffect, useState } from 'react';
import {
    X,
    UserCheck,
    UserX,
    FileText,
    ExternalLink,
    Car,
    CreditCard,
    IdCard,
    ShieldAlert,
    Loader2
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface DriverVerificationModalProps {
    driverId: number;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange?: (driverId: number, status: 'approved' | 'rejected') => void;
}

export default function DriverVerificationModal({ driverId, isOpen, onClose, onStatusChange }: DriverVerificationModalProps) {
    const [driver, setDriver] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isOpen && driverId) {
            fetchDriverDetails();
        }
    }, [isOpen, driverId]);

    const fetchDriverDetails = async () => {
        try {
            setLoading(true);
            const res = await apiFetch(`/admin/drivers/${driverId}`);
            if (res.ok) {
                const data = await res.json();
                setDriver(data);
            }
        } catch (error) {
            console.error('Error fetching driver details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const confirmed = window.confirm("Are you sure you want to approve this driver? They will be able to accept jobs immediately.");
        if (!confirmed) return;

        try {
            setActionLoading(true);
            const res = await apiFetch(`/admin/drivers/${driverId}/approve`, {
                method: 'POST'
            });

            if (res.ok) {
                alert("Driver verified successfully!");
                if (onStatusChange) onStatusChange(driverId, 'approved');
                onClose();
            } else {
                const err = await res.json();
                alert(`Failed: ${err.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error verifying driver:', error);
            alert("Error connecting to server");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        const reason = window.prompt("Please enter the reason for rejection:");
        if (reason === null) return;
        if (!reason.trim()) {
            alert("Rejection reason is required.");
            return;
        }

        try {
            setActionLoading(true);
            const res = await apiFetch(`/admin/drivers/${driverId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason })
            });

            if (res.ok) {
                alert("Driver rejected.");
                if (onStatusChange) onStatusChange(driverId, 'rejected');
                onClose();
            } else {
                const err = await res.json();
                alert(`Failed: ${err.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error rejecting driver:', error);
            alert("Error connecting to server");
        } finally {
            setActionLoading(false);
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

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                width: '100%',
                maxWidth: '800px',
                maxHeight: '90vh',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc'
                }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>ตรวจสอบเอกสารสมัครคนขับ</h2>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Driver Verification #{driverId}</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: '#fff', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                        <X size={20} color="#64748b" />
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
                    {loading ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                            <p style={{ color: '#64748b', fontSize: '14px' }}>กำลังโหลดข้อมูลข้อมูล...</p>
                        </div>
                    ) : driver ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Profile Basic */}
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '20px',
                                    background: '#f1f5f9',
                                    border: '2px solid #e2e8f0',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {driver.profile_image_url ? (
                                        <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${driver.profile_image_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <ShieldAlert size={40} color="#94a3b8" />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>{driver.full_name}</h3>
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '14px', color: '#64748b' }}>{driver.email}</span>
                                        <span style={{ color: '#e2e8f0' }}>|</span>
                                        <span style={{ fontSize: '14px', color: '#64748b' }}>{driver.phone}</span>
                                    </div>
                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: driver.registration_status === 'approved' ? '#f0fdf4' : (driver.registration_status === 'rejected' ? '#fef2f2' : '#fff7ed'),
                                            color: driver.registration_status === 'approved' ? '#15803d' : (driver.registration_status === 'rejected' ? '#b91c1c' : '#c2410c'),
                                            border: `1px solid ${driver.registration_status === 'approved' ? '#bbf7d0' : (driver.registration_status === 'rejected' ? '#fecaca' : '#fed7aa')}`,
                                            textTransform: 'uppercase'
                                        }}>
                                            {driver.registration_status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* Vehicle */}
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Car size={18} color="var(--primary)" /> VEHICLE INFO
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <InfoRow label="Type / Plate" value={`${driver.vehicle_type?.toUpperCase()} / ${driver.vehicle_plate}`} />
                                        <InfoRow label="Brand / Model" value={`${driver.vehicle_brand} ${driver.vehicle_model}`} />
                                        <InfoRow label="Color / Year" value={`${driver.vehicle_color} (${driver.vehicle_year})`} />
                                    </div>
                                </div>

                                {/* Bank */}
                                <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '20px', border: '1px solid #e0f2fe' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0369a1', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <CreditCard size={18} color="#0ea5e9" /> BANK ACCOUNT
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <InfoRow label="Bank" value={driver.bank_name} color="#075985" />
                                        <InfoRow label="Account No." value={driver.bank_account_number} color="#075985" />
                                        <InfoRow label="Account Name" value={driver.bank_account_name} color="#075985" />
                                    </div>
                                </div>
                            </div>

                            {/* Documents Preview */}
                            <div>
                                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>ตรวจสอบเอกสารประจำตัว</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <DocPreview label="บัตรประชาชน (หน้า)" url={driver.id_card_front_url} />
                                    <DocPreview label="ใบขับขี่" url={driver.driver_license_front_url} />
                                    <DocPreview label="สมุดบัญชีธนาคาร" url={driver.bank_account_image_url} />
                                    <DocPreview label="รูปถ่ายคู่กับบัตร" url={driver.selfie_with_id_url} />
                                    <DocPreview label="ทะเบียนรถ" url={driver.vehicle_registration_url} />
                                </div>
                            </div>

                            {/* Vehicle Images */}
                            {driver.vehicle_images && driver.vehicle_images.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '16px' }}>รูปถ่ายรถยนต์</h4>
                                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                                        {driver.vehicle_images.map((img: string, idx: number) => (
                                            <img
                                                key={idx}
                                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${img}`}
                                                onClick={() => openDocument(img)}
                                                style={{
                                                    width: '140px',
                                                    height: '140px',
                                                    borderRadius: '16px',
                                                    objectFit: 'cover',
                                                    cursor: 'pointer',
                                                    border: '2px solid #f1f5f9'
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>ไม่พบข้อมูลผูสมัคร</div>
                    )}
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', gap: '16px' }}>
                    {driver?.registration_status === 'pending' ? (
                        <>
                            <button
                                onClick={handleVerify}
                                disabled={actionLoading || loading || !driver}
                                style={{
                                    flex: 1,
                                    height: '52px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    opacity: actionLoading ? 0.7 : 1
                                }}
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <UserCheck size={22} />}
                                อนุมัติคนขับ (Approve)
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading || loading || !driver}
                                style={{
                                    flex: 1,
                                    height: '52px',
                                    background: 'white',
                                    color: '#ef4444',
                                    border: '1.5px solid #ef4444',
                                    borderRadius: '14px',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    opacity: actionLoading ? 0.7 : 1
                                }}
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <UserX size={22} />}
                                ไม่อนุมัติ (Reject)
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                height: '52px',
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: 'pointer'
                            }}
                        >
                            ปิดหน้าต่าง (Close)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value, color }: { label: string, value: string, color?: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>{label}</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: color || '#1e293b' }}>{value || 'N/A'}</span>
        </div>
    );
}

function DocPreview({ label, url }: { label: string, url: string | null }) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const imageUrl = url ? (url.startsWith('http') ? url : `${API_URL}${url}`) : null;

    const openFull = () => {
        if (imageUrl) window.open(imageUrl, '_blank');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>{label}</span>
            <div
                onClick={openFull}
                style={{
                    width: '100%',
                    height: '180px',
                    borderRadius: '16px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    cursor: imageUrl ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
                {imageUrl ? (
                    <>
                        <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.5)',
                            padding: '4px',
                            borderRadius: '8px',
                            color: 'white'
                        }}>
                            <ExternalLink size={14} />
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <ShieldAlert size={32} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>ไม่พบเอกสาร</span>
                    </div>
                )}
            </div>
        </div>
    );
}
