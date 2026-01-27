"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Search as SearchIcon,
    User,
    Car,
    ClipboardList,
    Loader2,
    AlertCircle,
    ChevronRight,
    MapPin,
    Calendar,
    Phone,
    Mail
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query) return;

        async function performSearch() {
            setLoading(true);
            setError(null);
            try {
                const res = await apiFetch(`/admin/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                } else {
                    setError('Failed to fetch search results');
                }
            } catch (err: any) {
                setError(err.message || 'An error occurred during search');
            } finally {
                setLoading(false);
            }
        }

        performSearch();
    }, [query]);

    if (!query) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <SearchIcon size={64} color="#e2e8f0" style={{ marginBottom: '24px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>Enter a search term</h2>
                <p style={{ color: 'var(--text-muted)' }}>Search for orders, users, or drivers from the bar above.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    const hasResults = results && (results.users?.length > 0 || results.drivers?.length > 0 || results.orders?.length > 0);

    return (
        <div style={{ paddingBottom: '40px' }}>
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
                    <SearchIcon size={16} />
                    <span>Search Results</span>
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>
                    Results for "{query}"
                </h2>
            </div>

            {error && (
                <div className="card" style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '16px', marginBottom: '24px', color: '#b91c1c' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={20} />
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {!hasResults && !loading && !error && (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>No matches found for "{query}". Try another term.</p>
                </div>
            )}

            {results && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Users Section */}
                    {results.users?.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <User size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Users ({results.users.length})</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {results.users.map((user: any) => (
                                    <Link href={`/users?id=${user.id}`} key={user.id}>
                                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', cursor: 'pointer' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                <User size={24} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{user.full_name}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email || 'No email'}</p>
                                            </div>
                                            <ChevronRight size={18} color="#cbd5e1" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Drivers Section */}
                    {results.drivers?.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Car size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Drivers ({results.drivers.length})</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {results.drivers.map((driver: any) => (
                                    <Link href={`/drivers?id=${driver.id}`} key={driver.id}>
                                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', cursor: 'pointer' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                <Car size={24} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>{driver.full_name}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{driver.vehicle_plate || 'No plate'}</p>
                                            </div>
                                            <ChevronRight size={18} color="#cbd5e1" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Orders Section */}
                    {results.orders?.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <ClipboardList size={20} color="var(--primary)" />
                                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Orders ({results.orders.length})</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {results.orders.map((order: any) => (
                                    <Link href={`/orders?id=${order.id}`} key={order.id}>
                                        <div className="card" style={{ padding: '16px', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>#{order.id}</span>
                                                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#f1f5f9', color: '#64748b' }}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={14} />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                                    <MapPin size={16} color="#10b981" />
                                                    <span style={{ fontSize: '13px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {order.pickup_address}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                                    <MapPin size={16} color="#ef4444" />
                                                    <span style={{ fontSize: '13px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {order.dropoff_address}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
