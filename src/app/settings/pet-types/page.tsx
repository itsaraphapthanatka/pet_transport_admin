"use client";

import React, { useEffect, useState } from 'react';
import {
    PawPrint,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    RefreshCw,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Smile,
    Search,
    Filter,
    Upload,
    Image as ImageIcon
} from 'lucide-react';
import { petTypeService, PetType } from '@/services/petTypeService';
import Swal from 'sweetalert2';

export default function PetTypesPage() {
    const [types, setTypes] = useState<PetType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [uploading, setUploading] = useState(false);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        icon: '',
        image_url: ''
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const data = await petTypeService.getPetTypes();
            setTypes(data);
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch pet types' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (type: PetType) => {
        setEditingId(type.id);
        setFormData({
            name: type.name,
            icon: type.icon || '',
            image_url: type.image_url || ''
        });
        setIsAdding(false);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsAdding(false);
        setFormData({ name: '', icon: '', image_url: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isAdding) {
                const newType = await petTypeService.createPetType(formData);
                setTypes([...types, newType]);
                Swal.fire({ icon: 'success', title: 'Created', text: 'Pet type created successfully', timer: 1500, showConfirmButton: false });
            } else if (editingId) {
                const updatedType = await petTypeService.updatePetType(editingId, formData);
                setTypes(types.map(t => t.id === editingId ? updatedType : t));
                Swal.fire({ icon: 'success', title: 'Updated', text: 'Pet type updated successfully', timer: 1500, showConfirmButton: false });
            }
            handleCancel();
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await petTypeService.deletePetType(id);
            setTypes(types.filter(t => t.id !== id));
            Swal.fire('Deleted!', 'Pet type has been deleted.', 'success');
        } catch (error: any) {
            Swal.fire('Error!', error.message, 'error');
        }
    };

    const handleToggleActive = async (type: PetType) => {
        try {
            const updated = await petTypeService.updatePetType(type.id, { is_active: !type.is_active });
            setTypes(types.map(t => t.id === type.id ? updated : t));
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const imageUrl = await petTypeService.uploadPetImage(file);
            setFormData({ ...formData, image_url: imageUrl });
            Swal.fire({ icon: 'success', title: 'Uploaded', text: 'Image uploaded successfully', timer: 1500, showConfirmButton: false });
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            setUploading(false);
        }
    };

    const filteredTypes = types.filter(type => {
        const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true :
            statusFilter === 'active' ? type.is_active : !type.is_active;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    const commonIcons = ['🐶', '🐱', '🐹', '🐰', '🦜', '🦎', '🐢', '🐈', '🐕', '🐾'];

    return (
        <div className="container" style={{ padding: '0 0 40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Pet Types</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage pet species and icons available for customers.</p>
                </div>
                {!isAdding && !editingId && (
                    <button onClick={() => setIsAdding(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} />
                        Add New Species
                    </button>
                )}
            </div>

            {/* Search & Filter Section */}
            <div className="card" style={{ marginBottom: '24px', padding: '16px', display: 'flex', gap: '16px' }}>
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
                        placeholder="Search by pet species name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} color="var(--text-muted)" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            background: 'white',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>
            {
                (isAdding || editingId) && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '10px' }}>
                                        <PawPrint size={20} color="var(--primary)" />
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                                        {isAdding ? 'Create New Pet Species' : `Edit ${formData.name}`}
                                    </h3>
                                </div>
                                <button onClick={handleCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
                                    <div className="form-group">
                                        <label className="label">Species Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Dog, Cat, Hamster"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Icon (Emoji)</label>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                            <input
                                                type="text"
                                                className="input"
                                                value={formData.icon}
                                                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                                placeholder="🐶"
                                                style={{ width: '80px', textAlign: 'center', fontSize: '20px' }}
                                                required
                                            />
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignContent: 'center' }}>
                                                {commonIcons.map(icon => (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, icon })}
                                                        style={{
                                                            background: formData.icon === icon ? 'var(--primary-light)' : 'white',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '6px',
                                                            padding: '4px 8px',
                                                            cursor: 'pointer',
                                                            fontSize: '18px'
                                                        }}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Pet Illustration URL</label>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={formData.image_url}
                                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                                        placeholder="https://example.com/pet.png"
                                                        style={{ flex: 1 }}
                                                    />
                                                    <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                        {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                                                        Upload
                                                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                                    </label>
                                                </div>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    Optional: Upload a high-quality illustration for this species.
                                                </p>
                                            </div>
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '10px',
                                                border: '1px solid #e2e8f0',
                                                background: '#f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden'
                                            }}>
                                                {formData.image_url ? (
                                                    <img
                                                        src={formData.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${formData.image_url}` : formData.image_url}
                                                        alt="Preview"
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                ) : (
                                                    <ImageIcon size={24} color="#cbd5e1" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" onClick={handleCancel} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? <RefreshCw className="animate-spin" size={18} /> : (isAdding ? <Plus size={18} /> : <Save size={18} />)}
                                        <span style={{ marginLeft: '8px' }}>{isAdding ? 'Create' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Icon</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Species Name</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>ID</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTypes.map((type) => (
                            <tr key={type.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: '#f0f9ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        overflow: 'hidden'
                                    }}>
                                        {type.image_url ? (
                                            <img
                                                src={type.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${type.image_url}` : type.image_url}
                                                alt={type.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        ) : (type.icon || '🐾')}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{type.name}</p>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <button
                                        onClick={() => handleToggleActive(type)}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            background: type.is_active ? '#ecfdf5' : '#f1f5f9',
                                            color: type.is_active ? '#059669' : '#64748b',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {type.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </button>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>#{type.id}</p>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button onClick={() => handleEdit(type)} style={{
                                            padding: '8px',
                                            borderRadius: '8px',
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            cursor: 'pointer',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(type.id)} style={{
                                            padding: '8px',
                                            borderRadius: '8px',
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            cursor: 'pointer',
                                            color: '#ef4444'
                                        }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredTypes.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                        <Smile size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                        <h4 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>No pet types found</h4>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Try a different search term or add a new species.</p>
                        <button onClick={() => setIsAdding(true)} className="btn btn-primary">
                            Add First Species
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
}
