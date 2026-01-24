"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PawPrint, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            if (!['admin', 'super_admin', 'moderator'].includes(data.role)) {
                throw new Error('Only administrators can access this dashboard');
            }

            localStorage.setItem('admin_token', data.access_token);
            localStorage.setItem('admin_user', JSON.stringify(data.admin || data.user));

            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '24px'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '440px',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        background: 'var(--primary)',
                        padding: '12px',
                        borderRadius: '16px',
                        display: 'inline-flex',
                        marginBottom: '16px',
                        boxShadow: '0 8px 16px rgba(5, 150, 105, 0.3)'
                    }}>
                        <PawPrint size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>PetGo Admin</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Sign in to manage your fleet and users</p>
                </div>

                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        color: '#dc2626',
                        fontSize: '14px',
                        marginBottom: '24px'
                    }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Email Address</label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease'
                        }}>
                            <Mail size={18} color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="admin@petgo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '14px',
                                    color: '#1e293b'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Password</label>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            padding: '12px 16px',
                            borderRadius: '12px'
                        }}>
                            <Lock size={18} color="#94a3b8" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    width: '100%',
                                    fontSize: '14px',
                                    color: '#1e293b'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            padding: '14px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '8px'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    marginTop: '32px',
                    fontSize: '13px',
                    color: 'var(--text-muted)'
                }}>
                    Internal Use Only. Restricted Access.
                </p>
            </div>
        </div>
    );
}
