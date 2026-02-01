"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Activity, Server, Database, Zap, Cpu, MemoryStick as Memory, ClipboardList, Users, Loader2, Maximize, Minimize, DollarSign, TrendingUp } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function MonitoringPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
        async function fetchData() {
            try {
                const res = await apiFetch('/admin/monitoring');
                if (res.ok) {
                    const result = await res.json();
                    setData(result);

                    setHistory(prev => {
                        const newHistory = [...prev, {
                            time: new Date().toLocaleTimeString(),
                            cpu: result.workload.cpu,
                            memory: Math.round(result.workload.memory),
                            orders: result.workload.active_orders,
                            revenue: result.workload.total_revenue
                        }];
                        // Keep last 20 data points
                        return newHistory.slice(-20);
                    });
                }
            } catch (error) {
                console.error('Error fetching monitoring data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
        const interval = setInterval(fetchData, 3000); // Update every 3 seconds

        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('fullscreenchange', handleFsChange);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    if (!isMounted || (loading && !data)) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`monitoring-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
            style={{
                background: isFullscreen ? '#0f172a' : 'transparent',
                padding: isFullscreen ? '40px' : '0',
                height: isFullscreen ? '100vh' : 'auto',
                overflowY: isFullscreen ? 'auto' : 'visible',
                color: isFullscreen ? '#f8fafc' : 'inherit',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        color: isFullscreen ? '#fff' : 'var(--text-main)',
                        marginBottom: '4px'
                    }}>System Monitoring</h2>
                    <p style={{ color: isFullscreen ? '#94a3b8' : 'var(--text-muted)', fontSize: '14px' }}>Real-time service status and workload metrics for PetGo.</p>
                </div>
                <button
                    onClick={toggleFullscreen}
                    className="btn"
                    style={{
                        background: isFullscreen ? '#334155' : 'var(--primary)',
                        color: 'white',
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer'
                    }}
                >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                </button>
            </div>

            <div className="stat-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <div className="card stat-card" style={{
                    borderLeft: '4px solid #10b981',
                    background: isFullscreen ? '#1e293b' : 'var(--card-bg)',
                    borderColor: '#10b981'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Cpu size={18} color="#10b981" />
                        <span className="stat-label" style={{ color: isFullscreen ? '#94a3b8' : 'var(--text-muted)' }}>CPU Usage</span>
                    </div>
                    <h3 className="stat-value" style={{ color: isFullscreen ? '#fff' : 'var(--text-main)' }}>{data?.workload.cpu.toFixed(1)}%</h3>
                </div>
                <div className="card stat-card" style={{
                    borderLeft: '4px solid #8b5cf6',
                    background: isFullscreen ? '#1e293b' : 'var(--card-bg)',
                    borderColor: '#8b5cf6'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Memory size={18} color="#8b5cf6" />
                        <span className="stat-label" style={{ color: isFullscreen ? '#94a3b8' : 'var(--text-muted)' }}>RAM Usage</span>
                    </div>
                    <h3 className="stat-value" style={{ color: isFullscreen ? '#fff' : 'var(--text-main)' }}>{Math.round(data?.workload.memory)} MB</h3>
                </div>
                <div className="card stat-card" style={{
                    borderLeft: '4px solid #f59e0b',
                    background: isFullscreen ? '#1e293b' : 'var(--card-bg)',
                    borderColor: '#f59e0b'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <ClipboardList size={18} color="#f59e0b" />
                        <span className="stat-label" style={{ color: isFullscreen ? '#94a3b8' : 'var(--text-muted)' }}>Active Orders</span>
                    </div>
                    <h3 className="stat-value" style={{ color: isFullscreen ? '#fff' : 'var(--text-main)' }}>{data?.workload.active_orders}</h3>
                </div>
                <div className="card stat-card" style={{
                    borderLeft: '4px solid #3b82f6',
                    background: isFullscreen ? '#1e293b' : 'var(--card-bg)',
                    borderColor: '#3b82f6'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Users size={18} color="#3b82f6" />
                        <span className="stat-label" style={{ color: isFullscreen ? '#94a3b8' : 'var(--text-muted)' }}>Online Drivers</span>
                    </div>
                    <h3 className="stat-value" style={{ color: isFullscreen ? '#fff' : 'var(--text-main)' }}>{data?.workload.online_drivers}</h3>
                </div>
                <div className="card stat-card" style={{
                    borderLeft: '4px solid #ec4899',
                    background: isFullscreen ? '#1e293b' : 'var(--card-bg)',
                    borderColor: '#ec4899'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <TrendingUp size={18} color="#ec4899" />
                        <span className="stat-label" style={{ color: isFullscreen ? '#94a3b8' : 'var(--text-muted)' }}>Total Revenue</span>
                    </div>
                    <h3 className="stat-value" style={{ color: isFullscreen ? '#fff' : 'var(--text-main)' }}>฿{data?.workload.total_revenue.toLocaleString()}</h3>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Service Status List */}
                <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Active Services</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {data?.services.map((service: any) => (
                            <div key={service.name} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                background: isFullscreen ? '#1e293b' : '#f8fafc',
                                borderRadius: '12px',
                                border: isFullscreen ? '1px solid #334155' : '1px solid #f1f5f9'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        background: service.status === 'online' ? '#10b98115' : '#ef444415',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        color: service.status === 'online' ? '#10b981' : '#ef4444'
                                    }}>
                                        {service.name.includes('DB') || service.name.includes('SQL') ? <Database size={16} /> : <Server size={16} />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{service.name}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Latency: {service.latency}</div>
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    background: service.status === 'online' ? '#ecfdf5' : '#fef2f2',
                                    color: service.status === 'online' ? '#059669' : '#dc2626'
                                }}>
                                    {service.status.toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Real-time Workload Graph */}
                <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Resource History</h3>
                    <div style={{ height: '280px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isFullscreen ? '#334155' : '#f1f5f9'} />
                                <XAxis dataKey="time" hide />
                                <YAxis
                                    fontSize={10}
                                    tick={{ fill: isFullscreen ? '#94a3b8' : '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isFullscreen ? '#1e293b' : '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        color: isFullscreen ? '#fff' : '#000',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="cpu"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCpu)"
                                    name="CPU %"
                                    animationDuration={1000}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="memory"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorMem)"
                                    name="RAM MB"
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Traffic/Order Monitoring */}
                <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Workload Peaks (Active Orders)</h3>
                    <div style={{ height: '320px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isFullscreen ? '#334155' : '#f1f5f9'} />
                                <XAxis
                                    dataKey="time"
                                    fontSize={10}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isFullscreen ? '#94a3b8' : '#64748b' }}
                                />
                                <YAxis
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isFullscreen ? '#94a3b8' : '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: isFullscreen ? '#1e293b' : '#fff',
                                        color: isFullscreen ? '#fff' : '#000'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorOrders)"
                                    name="Active Orders"
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Platform Revenue Trend */}
                <div className="card">
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Revenue Trend (Total Platform Fee)</h3>
                    <div style={{ height: '320px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isFullscreen ? '#334155' : '#f1f5f9'} />
                                <XAxis
                                    dataKey="time"
                                    fontSize={10}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isFullscreen ? '#94a3b8' : '#64748b' }}
                                />
                                <YAxis
                                    fontSize={10}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isFullscreen ? '#94a3b8' : '#64748b' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: isFullscreen ? '#1e293b' : '#fff',
                                        color: isFullscreen ? '#fff' : '#000'
                                    }}
                                    formatter={(value: any) => [`฿${value.toLocaleString()}`, "Revenue"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#ec4899"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    name="Platform Revenue"
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
