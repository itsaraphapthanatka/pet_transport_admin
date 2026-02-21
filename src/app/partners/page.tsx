"use client";

import React, { useEffect, useState } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    AlertCircle,
    CheckCircle2,
    Users,
    X,
    Building2,
    Scissors,
    Coffee
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Partner {
    id: number;
    name: string;
    type: string;
    contact_info: string;
    is_active: boolean;
    created_at: string;
}

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'clinic',
        contact_info: '',
        is_active: true
    });

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/admin/partners');
            if (res.ok) {
                const data = await res.json();
                setPartners(data);
            } else {
                setMessage({ type: 'error', text: 'Failed to fetch partners' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while fetching partners' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (partner: Partner | null = null) => {
        setMessage({ type: '', text: '' });
        if (partner) {
            setEditingPartner(partner);
            setFormData({
                name: partner.name,
                type: partner.type || 'clinic',
                contact_info: partner.contact_info || '',
                is_active: partner.is_active
            });
        } else {
            setEditingPartner(null);
            setFormData({
                name: '',
                type: 'clinic',
                contact_info: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPartner(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                name: formData.name,
                type: formData.type,
                contact_info: formData.contact_info,
                is_active: formData.is_active
            };

            const url = editingPartner ? `/admin/partners/${editingPartner.id}` : '/admin/partners';
            const method = editingPartner ? 'PUT' : 'POST';

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchPartners();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.detail || 'Failed to save partner' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            const res = await apiFetch(`/admin/partners/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchPartners();
            }
        } catch (e) {
            console.error("Error disabling partner", e);
        }
    };

    const filteredPartners = partners.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const getIconForType = (type: string) => {
        switch (type) {
            case 'clinic': return <Building2 size={20} />;
            case 'groomer': return <Scissors size={20} />;
            case 'cafe': return <Coffee size={20} />;
            default: return <Users size={20} />;
        }
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0 }}>Partnerships</h1>
                    <p style={{ color: '#6B7280', marginTop: '8px' }}>Manage B2B partners, clinics, and groomers for promotional codes.</p>
                </div>
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
                    New Partner
                </button>
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
                        placeholder="Search partners by name..."
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
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Partner Name</th>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: '600' }}>Contact Info</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center' }}>Loading partners...</td></tr>
                        ) : filteredPartners.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>No partners found.</td></tr>
                        ) : (
                            filteredPartners.map((partner) => (
                                <tr key={partner.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background-color 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                                                {getIconForType(partner.type)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{partner.name}</div>
                                                <div style={{ fontSize: '13px', color: '#6B7280', textTransform: 'capitalize' }}>
                                                    {partner.type}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: '14px', color: '#4B5563' }}>
                                            {partner.contact_info || '-'}
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
                                            background: partner.is_active ? '#D1FAE5' : '#FEE2E2',
                                            color: partner.is_active ? '#065F46' : '#991B1B'
                                        }}>
                                            {partner.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleOpenModal(partner)}
                                                style={{ padding: '8px', background: 'transparent', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#4B5563', cursor: 'pointer', transition: 'all 0.2s' }}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {partner.is_active && (
                                                <button
                                                    onClick={() => handleToggleActive(partner.id)}
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>{editingPartner ? 'Edit Partner' : 'Create Partner'}</h2>
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
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Partner Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Happy Paws Clinic"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: 'white' }}
                                    >
                                        <option value="clinic">Clinic</option>
                                        <option value="groomer">Groomer</option>
                                        <option value="cafe">Pet Cafe</option>
                                        <option value="shelter">Shelter</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Contact Info</label>
                                    <input
                                        type="text"
                                        value={formData.contact_info}
                                        onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                                        placeholder="Phone number, email, or address"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                                    />
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
                                    Save Partner
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
