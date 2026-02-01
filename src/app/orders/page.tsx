"use client";

import React, { useEffect, useState } from 'react';
import {
    ClipboardList,
    Search,
    Filter,
    MoreVertical,
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Loader2,
    Calendar,
    MapPin
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                console.log('Fetching orders from API...');
                const res = await apiFetch('/orders/');
                console.log('API Response status:', res.status);

                if (res.ok) {
                    const data = await res.json();
                    console.log('Orders data:', data);
                    setOrders(data);
                    setError(null);
                } else {
                    const errorText = await res.text();
                    console.error('API Error:', res.status, errorText);
                    setError(`Failed to fetch orders: ${res.status} ${errorText}`);
                }
            } catch (error: any) {
                console.error('Error fetching orders:', error);
                setError(`Error: ${error.message}`);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order =>
        order.id.toString().includes(searchTerm) ||
        order.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.driver?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return { bg: '#ecfdf5', text: '#059669', icon: CheckCircle2 };
            case 'in_progress':
                return { bg: '#eff6ff', text: '#2563eb', icon: Clock };
            case 'pending':
                return { bg: '#fffbeb', text: '#d97706', icon: AlertCircle };
            case 'cancelled':
                return { bg: '#fef2f2', text: '#dc2626', icon: XCircle };
            default:
                return { bg: '#f1f5f9', text: '#64748b', icon: AlertCircle };
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Order Management</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Monitor and manage all pet transport requests.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {error && (
                <div className="card" style={{
                    marginBottom: '24px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    padding: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={20} color="#dc2626" />
                        <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
                                Error Loading Orders
                            </p>
                            <p style={{ fontSize: '13px', color: '#991b1b' }}>
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                            placeholder="Search by Order ID, Customer, or Driver..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '14px', height: '100%' }}
                        />
                    </div>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Filter size={18} />
                        Status
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--card-border)', background: '#f8fafc' }}>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Order Info</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Participants</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Route</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Status</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Amount</th>
                                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => {
                                const status = getStatusStyle(order.status);
                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>#{order.id}</p>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleString('en-GB')}</p>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <p style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>
                                                    Customer: <span style={{ fontWeight: '600' }}>{order.customer?.full_name || 'N/A'}</span>
                                                </p>
                                                <p style={{ fontSize: '13px', color: order.driver ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: '500' }}>
                                                    Driver: <span style={{ fontWeight: '600' }}>{order.driver?.full_name || 'Unassigned'}</span>
                                                </p>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-main)' }}>
                                                    <MapPin size={12} color="#10b981" />
                                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{order.pickup_address}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-main)' }}>
                                                    <MapPin size={12} color="#ef4444" />
                                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{order.dropoff_address}</span>
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
                                                background: status.bg,
                                                color: status.text
                                            }}>
                                                <status.icon size={12} />
                                                {order.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>฿{Number(order.price).toLocaleString()}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.payment_method?.toUpperCase()} • {order.payment_status?.toUpperCase()}</p>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
