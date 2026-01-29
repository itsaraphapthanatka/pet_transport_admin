"use client";

import React, { useEffect, useState } from 'react';
import {
    Car,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    RefreshCw,
    Loader2,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Box,
    Truck,
    Star,
    Search,
    Filter,
    Image as ImageIcon,
    Upload
} from 'lucide-react';
import { vehicleTypeService, VehicleType } from '@/services/vehicleTypeService';
import Swal from 'sweetalert2';

export default function VehicleTypesPage() {
    const [types, setTypes] = useState<VehicleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [uploading, setUploading] = useState(false);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        key: '',
        name: '',
        description: '',
        icon: 'car',
        base_fare: 0,
        per_km: 0,
        per_min: 0,
        min_fare: 0,
        is_active: true,
        image_url: ''
    });

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const data = await vehicleTypeService.getVehicleTypes();
            setTypes(data);
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch vehicle types' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (type: VehicleType) => {
        setEditingId(type.id);
        setFormData({
            key: type.key,
            name: type.name,
            description: type.description || '',
            icon: type.icon || 'car',
            base_fare: Number(type.base_fare),
            per_km: Number(type.per_km),
            per_min: Number(type.per_min),
            min_fare: Number(type.min_fare),
            is_active: type.is_active,
            image_url: type.image_url || ''
        });
        setIsAdding(false);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsAdding(false);
        setFormData({
            key: '',
            name: '',
            description: '',
            icon: 'car',
            base_fare: 0,
            per_km: 0,
            per_min: 0,
            min_fare: 0,
            is_active: true,
            image_url: ''
        });
    };

    const renderIcon = (icon: string | undefined, size = 20) => {
        switch (icon) {
            case 'suv': return <Car size={size} />;
            case 'van': return <Truck size={size} />;
            case 'bike': return <Box size={size} />;
            case 'luxury': return <Star size={size} />;
            case 'truck': return <Truck size={size} />;
            default: return <Car size={size} />;
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isAdding) {
                const newType = await vehicleTypeService.createVehicleType(formData);
                setTypes([...types, newType]);
                Swal.fire({ icon: 'success', title: 'Created', text: 'Vehicle type created successfully', timer: 1500, showConfirmButton: false });
            } else if (editingId) {
                const updatedType = await vehicleTypeService.updateVehicleType(editingId, formData);
                setTypes(types.map(t => t.id === editingId ? updatedType : t));
                Swal.fire({ icon: 'success', title: 'Updated', text: 'Vehicle type updated successfully', timer: 1500, showConfirmButton: false });
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
            await vehicleTypeService.deleteVehicleType(id);
            setTypes(types.filter(t => t.id !== id));
            Swal.fire('Deleted!', 'Vehicle type has been deleted.', 'success');
        } catch (error: any) {
            Swal.fire('Error!', error.message, 'error');
        }
    };

    const handleToggleActive = async (type: VehicleType) => {
        try {
            const updated = await vehicleTypeService.updateVehicleType(type.id, { is_active: !type.is_active });
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
            const imageUrl = await vehicleTypeService.uploadVehicleImage(file);
            setFormData({ ...formData, image_url: imageUrl });
            Swal.fire({ icon: 'success', title: 'Uploaded', text: 'Image uploaded successfully', timer: 1500, showConfirmButton: false });
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            setUploading(false);
        }
    };

    const filteredTypes = types.filter(type => {
        const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.description?.toLowerCase().includes(searchTerm.toLowerCase());

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

    return (
        <div className="container" style={{ padding: '0 0 40px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Vehicle Types</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage fleet categories and pricing rates.</p>
                </div>
                {!isAdding && !editingId && (
                    <button onClick={() => setIsAdding(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} />
                        Add New Type
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
                        placeholder="Search by name, key, or description..."
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
                        <div className="card" style={{ width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '10px' }}>
                                        <Edit2 size={20} color="var(--primary)" />
                                    </div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                                        {isAdding ? 'Create New Vehicle Type' : `Edit ${formData.name}`}
                                    </h3>
                                </div>
                                <button onClick={handleCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label className="label">Access Key (Unique ID)</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.key}
                                            onChange={e => setFormData({ ...formData, key: e.target.value })}
                                            disabled={!!editingId}
                                            placeholder="e.g. car, suv, van"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Display Name</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Standard Car"
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div className="form-group">
                                        <label className="label">Icon / Category</label>
                                        <select
                                            className="input"
                                            value={formData.icon}
                                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        >
                                            <option value="car">Standard Car 🚗</option>
                                            <option value="suv">SUV / الكبير 🚙</option>
                                            <option value="van">Van / Mini Bus 🚐</option>
                                            <option value="luxury">Luxury / Premium Star ⭐</option>
                                            <option value="truck">Truck / Logistics 🚛</option>
                                            <option value="bike">Motorbike / Express 🏍️</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Marketing Description</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="e.g. Comfy for medium pets"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                    <input
                                        type="checkbox"
                                        id="is_active_toggle"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="is_active_toggle" style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                                        Enable this vehicle type for customers
                                    </label>
                                </div>

                                <div className="form-group" style={{ marginBottom: '24px' }}>
                                    <label className="label">Vehicle Illustration URL</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={formData.image_url}
                                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                                    placeholder="https://example.com/car.png"
                                                    style={{ flex: 1 }}
                                                />
                                                <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                    {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
                                                    Upload
                                                    <input type="file" hidden accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                                                </label>
                                            </div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                Upload an icon or photo that represents this vehicle to customers.
                                            </p>
                                        </div>
                                        <div style={{
                                            width: '100px',
                                            height: '74px',
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

                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <DollarSign size={16} color="var(--primary)" />
                                        <h4 style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>Pricing Configuration (THB)</h4>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="label">Base Fare</label>
                                            <input
                                                type="number"
                                                className="input"
                                                value={formData.base_fare}
                                                onChange={e => setFormData({ ...formData, base_fare: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Rate per KM</label>
                                            <input
                                                type="number"
                                                className="input"
                                                value={formData.per_km}
                                                onChange={e => setFormData({ ...formData, per_km: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Rate per Min</label>
                                            <input
                                                type="number"
                                                className="input"
                                                value={formData.per_min}
                                                onChange={e => setFormData({ ...formData, per_min: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Minimum Fare</label>
                                            <input
                                                type="number"
                                                className="input"
                                                value={formData.min_fare}
                                                onChange={e => setFormData({ ...formData, min_fare: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" onClick={handleCancel} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '10px 24px' }}>
                                        {saving ? <RefreshCw className="animate-spin" size={18} /> : (isAdding ? <Plus size={18} /> : <Save size={18} />)}
                                        <span style={{ marginLeft: '8px' }}>{isAdding ? 'Create Type' : 'Save Changes'}</span>
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
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Vehicle Type</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Pricing (Base / KM)</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Min Fare / Time</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTypes.map((type) => (
                            <tr key={type.id} style={{ borderBottom: '1px solid var(--card-border)', background: type.is_active ? 'transparent' : '#f8fafc' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: type.is_active ? 'var(--primary-light)' : '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: type.is_active ? 'var(--primary)' : 'var(--text-muted)',
                                            overflow: 'hidden'
                                        }}>
                                            {type.image_url ? (
                                                <img
                                                    src={type.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${type.image_url}` : type.image_url}
                                                    alt={type.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : renderIcon(type.icon)}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>
                                                {type.name}
                                                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                                                    {type.key}
                                                </span>
                                            </p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{type.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>฿{Number(type.base_fare).toFixed(2)}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+ ฿{Number(type.per_km).toFixed(2)} / km</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>฿{Number(type.min_fare).toFixed(2)}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+ ฿{Number(type.per_min).toFixed(2)} / min</div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <button
                                        onClick={() => handleToggleActive(type)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            background: type.is_active ? '#ecfdf5' : '#f1f5f9',
                                            color: type.is_active ? '#059669' : 'var(--text-muted)',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: type.is_active ? '#10b981' : '#94a3b8' }}></div>
                                        {type.is_active ? 'ENABLED' : 'DISABLED'}
                                    </button>
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
                    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <Car size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                        <h4 style={{ color: 'var(--text-muted)' }}>No vehicle types found</h4>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Try a different search term or add a new type.</p>
                    </div>
                )}
            </div>
        </div >
    );
}
