"use client";

import React, { useEffect, useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    AlertCircle,
    CheckCircle2,
    Tag,
    X
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface PromoCode {
    id: number;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value?: number;
    max_discount?: number;
    valid_from?: string;
    valid_until?: string;
    usage_limit?: number;
    times_used: number;
    is_active: boolean;
    partner_id?: number | null;
    created_at: string;
}

interface Partner {
    id: number;
    name: string;
    is_active: boolean;
}

export default function PromosPage() {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [partners, setPartners] = useState<Partner[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'fixed',
        discount_value: '',
        min_order_value: '',
        max_discount: '',
        usage_limit: '',
        is_active: true,
        partner_id: ''
    });

    const [batchFormData, setBatchFormData] = useState({
        prefix: '',
        count: '10',
        discount_type: 'fixed',
        discount_value: '',
        min_order_value: '',
        max_discount: '',
        usage_limit: '1',
        is_active: true,
        partner_id: ''
    });

    useEffect(() => {
        fetchPromos();
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await apiFetch('/admin/partners');
            if (res.ok) {
                const data = await res.json();
                setPartners(data.filter((p: Partner) => p.is_active));
            }
        } catch (error) {
            console.error("Failed to load partners", error);
        }
    };

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/admin/promos');
            if (res.ok) {
                const data = await res.json();
                setPromos(data);
            } else {
                setMessage({ type: 'error', text: 'Failed to fetch promo codes' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while fetching promos' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (promo: PromoCode | null = null) => {
        setMessage({ type: '', text: '' });
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                code: promo.code,
                discount_type: promo.discount_type,
                discount_value: promo.discount_value.toString(),
                min_order_value: promo.min_order_value ? promo.min_order_value.toString() : '',
                max_discount: promo.max_discount ? promo.max_discount.toString() : '',
                usage_limit: promo.usage_limit ? promo.usage_limit.toString() : '',
                is_active: promo.is_active,
                partner_id: promo.partner_id ? promo.partner_id.toString() : ''
            });
        } else {
            setEditingPromo(null);
            setFormData({
                code: '',
                discount_type: 'fixed',
                discount_value: '',
                min_order_value: '',
                max_discount: '',
                usage_limit: '',
                is_active: true,
                partner_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPromo(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                code: formData.code.toUpperCase(),
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : null,
                max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                is_active: formData.is_active,
                partner_id: formData.partner_id ? parseInt(formData.partner_id) : null
            };

            const url = editingPromo ? `/admin/promos/${editingPromo.id}` : '/admin/promos';
            const method = editingPromo ? 'PUT' : 'POST';

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchPromos();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.detail || 'Failed to save promo code' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            const res = await apiFetch(`/admin/promos/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchPromos();
            }
        } catch (e) {
            console.error("Error disabling promo", e);
        }
    };

    const handleBatchSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                prefix: batchFormData.prefix.toUpperCase(),
                count: parseInt(batchFormData.count),
                discount_type: batchFormData.discount_type,
                discount_value: parseFloat(batchFormData.discount_value),
                min_order_value: batchFormData.min_order_value ? parseFloat(batchFormData.min_order_value) : null,
                max_discount: batchFormData.max_discount ? parseFloat(batchFormData.max_discount) : null,
                usage_limit: batchFormData.usage_limit ? parseInt(batchFormData.usage_limit) : null,
                is_active: batchFormData.is_active,
                partner_id: batchFormData.partner_id ? parseInt(batchFormData.partner_id) : null
            };

            const res = await apiFetch('/admin/promos/batch', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsBatchModalOpen(false);
                fetchPromos();
                setMessage({ type: 'success', text: `Successfully generated ${payload.count} promo codes.` });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.detail || 'Failed to generate batch codes' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        }
    };

    const filteredPromos = promos.filter(p => p.code.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0 }}>Promo Codes</h1>
                    <p style={{ color: '#6B7280', marginTop: '8px' }}>Manage discount codes and promotions for customers.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => {
                            setMessage({ type: '', text: '' });
                            setIsBatchModalOpen(true);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'white',
                            color: '#374151',
                            border: '1px solid #D1D5DB',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        <Tag size={20} />
                        Batch Generate
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#3B82F6',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
                        }}
                    >
                        <Plus size={20} />
                        New Promo Code
                    </button>
                </div>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: message.type === 'error' ? '#FEF2F2' : '#F0FDF4',
                    color: message.type === 'error' ? '#991B1B' : '#166534',
                    border: `1px solid ${message.type === 'error' ? '#F87171' : '#86EFAC'}`
                }}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    <span style={{ fontWeight: 500 }}>{message.text}</span>
                </div>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search promo codes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 48px',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            fontSize: '15px',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Code</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Discount</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>Usage</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center' }}>Loading promos...</td></tr>
                        ) : filteredPromos.length === 0 ? (
                            <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>No promo codes found.</td></tr>
                        ) : (
                            filteredPromos.map((promo) => (
                                <tr key={promo.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                                                <Tag size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{promo.code}</div>
                                                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                                                    Min: ฿{promo.min_order_value || '0'}
                                                    {promo.partner_id && <span style={{ marginLeft: '8px', color: '#3B82F6' }}>Partner ID: {promo.partner_id}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: '500', color: '#111827' }}>
                                            {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `฿${promo.discount_value}`}
                                        </div>
                                        {promo.discount_type === 'percentage' && promo.max_discount && (
                                            <div style={{ fontSize: '12px', color: '#6B7280' }}>Max ฿{promo.max_discount}</div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F3F4F6', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
                                            {promo.times_used} / {promo.usage_limit || '∞'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: promo.is_active ? '#D1FAE5' : '#FEE2E2',
                                            color: promo.is_active ? '#065F46' : '#991B1B'
                                        }}>
                                            {promo.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleOpenModal(promo)}
                                                style={{ padding: '8px', background: 'transparent', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#4B5563', cursor: 'pointer', transition: 'all 0.2s' }}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {promo.is_active && (
                                                <button
                                                    onClick={() => handleToggleActive(promo.id)}
                                                    style={{ padding: '8px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', cursor: 'pointer', transition: 'all 0.2s' }}
                                                    title="Deactivate"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}</h2>
                            <button onClick={handleCloseModal} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} style={{ padding: '24px' }}>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                {/* Status Toggle */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Status</span>
                                    <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
                                        />
                                        <div style={{
                                            width: '44px',
                                            height: '24px',
                                            background: formData.is_active ? '#10B981' : '#D1D5DB',
                                            borderRadius: '9999px',
                                            position: 'relative',
                                            transition: 'background-color 0.2s'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '2px',
                                                left: formData.is_active ? '22px' : '2px',
                                                width: '20px',
                                                height: '20px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                transition: 'left 0.2s',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                            }} />
                                        </div>
                                        <span style={{ marginLeft: '12px', fontSize: '14px', color: formData.is_active ? '#10B981' : '#6B7280', fontWeight: '500' }}>
                                            {formData.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </label>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Promo Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="e.g. NEWPAW"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', textTransform: 'uppercase' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Discount Type</label>
                                        <select
                                            value={formData.discount_type}
                                            onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white' }}
                                        >
                                            <option value="fixed">Fixed Amount (฿)</option>
                                            <option value="percentage">Percentage (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Value</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                            placeholder="e.g. 50"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                                        />
                                    </div>
                                </div>

                                {formData.discount_type === 'percentage' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Max Discount (฿)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.max_discount}
                                            onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                            placeholder="Optional cap for percentage"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Min. Order Value (฿)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.min_order_value}
                                        onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                                        placeholder="Optional minimum spend"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Usage Limit</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usage_limit}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                        placeholder="Optional total redemptions"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Assign to Partner</label>
                                    <select
                                        value={formData.partner_id}
                                        onChange={(e) => setFormData({ ...formData, partner_id: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white' }}
                                    >
                                        <option value="">None (General Code)</option>
                                        {partners.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ padding: '12px 24px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '12px 24px', background: '#3B82F6', border: 'none', borderRadius: '8px', fontWeight: '600', color: 'white', cursor: 'pointer' }}
                                >
                                    Save Promo Code
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Batch Generate Modal */}
            {isBatchModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Batch Generate Promos</h2>
                            <button onClick={() => setIsBatchModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleBatchSave} style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Prefix Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={batchFormData.prefix}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, prefix: e.target.value })}
                                        placeholder="e.g. CLINIC"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', textTransform: 'uppercase' }}
                                    />
                                    <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Generated codes will look like CLINIC-X79K2A</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Number of Codes</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="500"
                                        value={batchFormData.count}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, count: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Discount Type</label>
                                        <select
                                            value={batchFormData.discount_type}
                                            onChange={(e) => setBatchFormData({ ...batchFormData, discount_type: e.target.value as any })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white' }}
                                        >
                                            <option value="fixed">Fixed Amount (฿)</option>
                                            <option value="percentage">Percentage (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Value</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={batchFormData.discount_value}
                                            onChange={(e) => setBatchFormData({ ...batchFormData, discount_value: e.target.value })}
                                            placeholder="e.g. 50"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Individual Usage Limit</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={batchFormData.usage_limit}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, usage_limit: e.target.value })}
                                        placeholder="Uses per code (usually 1)"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Assign to Partner</label>
                                    <select
                                        value={batchFormData.partner_id}
                                        onChange={(e) => setBatchFormData({ ...batchFormData, partner_id: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white' }}
                                    >
                                        <option value="">None (General Codes)</option>
                                        {partners.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsBatchModalOpen(false)}
                                    style={{ padding: '12px 24px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '12px 24px', background: '#3B82F6', border: 'none', borderRadius: '8px', fontWeight: '600', color: 'white', cursor: 'pointer' }}
                                >
                                    Generate Batch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
