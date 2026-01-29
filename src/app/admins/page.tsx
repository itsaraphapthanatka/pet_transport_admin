"use client";

import { useEffect, useState } from "react";
import { Admin, adminService, CreateAdminData, UpdateAdminData } from "@/services/adminService";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Clock,
    Shield,
    Mail,
    Edit2,
    Trash2,
    CheckCircle2,
    X,
    Loader2
} from 'lucide-react';

export default function AdminsPage() {
    const router = useRouter();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [user, setUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push("/login");
            return;
        }

        const adminUser = localStorage.getItem('admin_user');
        if (adminUser) {
            const parsedUser = JSON.parse(adminUser);
            setUser(parsedUser);
            if (!['super_admin', 'admin'].includes(parsedUser.role)) {
                Swal.fire({
                    icon: "error",
                    title: "Access Denied",
                    text: "Only Administrators can access this page",
                }).then(() => {
                    router.push("/");
                });
                return;
            }
        } else {
            console.warn("Admin user data missing from localStorage");
        }
        fetchAdmins();
    }, [router]);

    const fetchAdmins = async () => {
        try {
            const data = await adminService.getAdmins();
            setAdmins(data);
        } catch (error) {
            console.error("Failed to fetch admins", error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFullName("");
        setEmail("");
        setPassword("");
        setRole("admin");
        setEditingAdmin(null);
        setShowModal(false);
    };

    const handleCreate = () => {
        setEditingAdmin(null);
        setFullName("");
        setEmail("");
        setPassword("");
        setRole("admin");
        setShowModal(true);
    };

    const handleEdit = (admin: Admin) => {
        setEditingAdmin(admin);
        setFullName(admin.full_name || "");
        setEmail(admin.email);
        setPassword(""); // Don't show password
        setRole(admin.role);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                await adminService.deleteAdmin(id);
                Swal.fire("Deleted!", "Admin has been deleted.", "success");
                fetchAdmins();
                resetForm();
            } catch (error) {
                Swal.fire("Error!", "Failed to delete admin.", "error");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingAdmin) {
                // Update
                const updateData: UpdateAdminData = {
                    full_name: fullName,
                    email: email,
                    role: role,
                };
                if (password) updateData.password = password;

                await adminService.updateAdmin(editingAdmin.id, updateData);
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Admin updated successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                // Create
                if (!password) {
                    Swal.fire("Error", "Password is required for new admin", "error");
                    return;
                }
                const createData: CreateAdminData = {
                    full_name: fullName,
                    email: email,
                    password: password,
                    role: role,
                };
                await adminService.createAdmin(createData);
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: 'Admin created successfully',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            resetForm();
            fetchAdmins();
        } catch (error: any) {
            console.error("Form error:", error);
            Swal.fire("Error", error.response?.data?.detail || "Operation failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Admin Management</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage system administrators and their permissions.</p>
                </div>
                <button
                    onClick={handleCreate}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Plus size={18} />
                    Add New Admin
                </button>
            </div>

            {/* Search & Filter Section */}
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
                            placeholder="Search by Name or Email..."
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

            {/* Admins Table */}
            <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--card-border)', background: '#f8fafc' }}>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Admin Info</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Role</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Last Login</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAdmins.map((admin) => (
                            <tr key={admin.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: '#f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{admin.full_name || "Unknown"}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                                <Mail size={12} />
                                                {admin.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        background: admin.role === 'super_admin' ? '#f3e8ff' : '#eff6ff',
                                        color: admin.role === 'super_admin' ? '#7e22ce' : '#2563eb'
                                    }}>
                                        <Shield size={12} />
                                        {admin.role === 'super_admin' ? 'Super Admin' : admin.role === 'admin' ? 'Administrator' : 'Moderator'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        <Clock size={14} />
                                        {admin.last_login ? new Date(admin.last_login).toLocaleString('en-GB') : "Never"}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        background: '#ecfdf5',
                                        color: '#059669'
                                    }}>
                                        <CheckCircle2 size={12} />
                                        Active
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEdit(admin)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: '#f1f5f9',
                                                cursor: 'pointer',
                                                color: '#475569',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(admin.id)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: '#fef2f2',
                                                cursor: 'pointer',
                                                color: '#dc2626',
                                                opacity: admin.role === 'super_admin' ? 0.5 : 1,
                                                pointerEvents: admin.role === 'super_admin' ? 'none' : 'auto'
                                            }}
                                            title="Delete"
                                            disabled={admin.role === 'super_admin'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredAdmins.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No admins found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
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
                    zIndex: 50,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        overflow: 'hidden',
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                                {editingAdmin ? "Edit Admin" : "Add New Admin"}
                            </h3>
                            <button
                                onClick={resetForm}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                            <div className="form-group">
                                <label className="label">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@petgo.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">
                                    Role
                                </label>
                                <select
                                    className="input"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="moderator">Moderator</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="label">
                                    Password {editingAdmin && "(Leave blank to keep current)"}
                                </label>
                                <input
                                    type="password"
                                    className="input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required={!editingAdmin}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="btn btn-secondary"
                                    style={{ flex: 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ flex: 1 }}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : (editingAdmin ? "Save Changes" : "Add Admin")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
