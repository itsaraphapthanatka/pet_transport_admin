"use client";

import React, { useEffect, useState, useRef } from 'react';
import {
    ShoppingBag,
    DollarSign,
    Users,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    AlertCircle,
    Clock,
    Sparkles,
    Loader2,
    Maximize,
    Minimize
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function InsightsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('Today');
    const [isMounted, setIsMounted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
        async function fetchInsights() {
            try {
                const res = await apiFetch('/admin/insights/summary');
                if (res.ok) {
                    const result = await res.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Error fetching insights:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchInsights();

        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!isFullscreen) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error enabling full-screen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    if (!isMounted || (loading && !data)) {
        return (
            <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: '#6366f1',
                        filter: 'blur(24px)',
                        opacity: 0.1
                    }}></div>
                    <Loader2 className="animate-spin" size={48} color="#6366f1" />
                </div>
            </div>
        );
    }

    // Mock trend history for sparklines
    const sparklineData = data.hourly_revenue.map((h: any) => ({ val: h.revenue + Math.random() * 100 }));

    const metrics = [
        {
            label: 'Total GMV',
            value: `฿${(data.today.gmv).toLocaleString()}`,
            prev: `฿${(data.yesterday.gmv).toLocaleString()}`,
            trend: data.trends.gmv,
            icon: <ShoppingBag size={20} />,
            color: 'linear-gradient(135deg, #f43f5e, #fb7185)',
            glow: 'rgba(244, 63, 94, 0.1)',
            textColor: '#e11d48'
        },
        {
            label: 'Platform Revenue',
            value: `฿${(data.today.revenue).toLocaleString()}`,
            prev: `฿${(data.yesterday.revenue).toLocaleString()}`,
            trend: data.trends.revenue,
            icon: <DollarSign size={20} />,
            color: 'linear-gradient(135deg, #6366f1, #818cf8)',
            glow: 'rgba(99, 102, 241, 0.1)',
            textColor: '#4f46e5'
        },
        {
            label: 'Orders',
            value: data.today.orders,
            prev: data.yesterday.orders,
            trend: data.trends.orders,
            icon: <BarChart3 size={20} />,
            color: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
            glow: 'rgba(6, 182, 212, 0.1)',
            textColor: '#0891b2'
        },
        {
            label: 'AOV',
            value: `฿${Math.round(data.today.aov).toLocaleString()}`,
            prev: `฿${Math.round(data.yesterday.aov).toLocaleString()}`,
            trend: data.trends.aov,
            icon: <Users size={20} />,
            color: 'linear-gradient(135deg, #10b981, #34d399)',
            glow: 'rgba(16, 185, 129, 0.1)',
            textColor: '#059669'
        }
    ];

    return (
        <div
            ref={containerRef}
            className={`page-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
            style={{
                position: 'relative',
                overflow: isFullscreen ? 'auto' : 'hidden',
                minHeight: '100vh',
                padding: isFullscreen ? '60px' : '40px',
                background: isFullscreen ? '#0f172a' : '#f8fafc',
                color: isFullscreen ? '#f8fafc' : 'inherit',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
        >
            {/* Animated Mesh Background */}
            <div className="mesh-bg" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: -1,
                opacity: isFullscreen ? 0.2 : 0.4
            }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: isFullscreen ? '#1e293b' : '#e0e7ff', filter: 'blur(100px)', borderRadius: '50%', animation: 'blob 10s infinite linear' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: isFullscreen ? '#334155' : '#fce7f3', filter: 'blur(100px)', borderRadius: '50%', animation: 'blob 12s infinite linear reverse' }}></div>
            </div>

            <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isFullscreen ? 'center' : 'flex-start', marginBottom: '40px', flexDirection: 'row', gap: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Sparkles size={14} color="#6366f1" />
                            <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '2px', color: '#6366f1', textTransform: 'uppercase' }}>Intelligence Hub</span>
                        </div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', color: isFullscreen ? '#fff' : '#0f172a', letterSpacing: '-1px', margin: 0 }}>Business <span style={{ color: '#6366f1' }}>Insights</span></h1>
                        <p style={{ color: isFullscreen ? '#94a3b8' : '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>Platform sales velocity and growth metrics.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ background: isFullscreen ? '#1e293b' : 'white', padding: '4px', borderRadius: '16px', display: 'flex', gap: '2px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: isFullscreen ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                            {['Today', 'Yesterday', '7D', '30D'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        borderRadius: '12px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        background: period === p ? '#6366f1' : 'transparent',
                                        color: period === p ? 'white' : (isFullscreen ? '#94a3b8' : '#64748b')
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            style={{
                                background: isFullscreen ? '#334155' : '#6366f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '12px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '13px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                        </button>
                    </div>
                </div>

                {/* Lifetime Summary Hero */}
                <div className="card glass" style={{
                    padding: '40px',
                    marginBottom: '40px',
                    background: isFullscreen ? 'rgba(30, 41, 59, 0.7)' : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4))',
                    borderRadius: '32px',
                    border: isFullscreen ? '1px solid #334155' : '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                    gap: '40px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '20px', opacity: isFullscreen ? 0.02 : 0.05 }}>
                        <BarChart3 size={120} color={isFullscreen ? '#fff' : '#000'} />
                    </div>

                    <div style={{ textAlign: 'center', minWidth: '200px', position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Lifetime GMV</div>
                        <div style={{ fontSize: isFullscreen ? '72px' : '56px', fontWeight: '900', color: isFullscreen ? '#fff' : '#0f172a', letterSpacing: '-2px', transition: 'all 0.5s ease' }}>
                            ฿{(data.lifetime.gmv).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#10b981', fontSize: '13px', fontWeight: '800', marginTop: '4px' }}>
                            <ArrowUpRight size={16} strokeWidth={3} />
                            <span>Business Value Generated</span>
                        </div>
                    </div>

                    <div style={{ width: '1px', background: isFullscreen ? '#334155' : 'linear-gradient(to bottom, transparent, #e2e8f0, transparent)', alignSelf: 'stretch' }}></div>

                    <div style={{ textAlign: 'center', minWidth: '200px', position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#ec4899', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Lifetime Revenue</div>
                        <div style={{ fontSize: isFullscreen ? '72px' : '56px', fontWeight: '900', color: isFullscreen ? '#fff' : '#0f172a', letterSpacing: '-2px', transition: 'all 0.5s ease' }}>
                            ฿{(data.lifetime.revenue).toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6366f1', fontSize: '13px', fontWeight: '800', marginTop: '4px' }}>
                            <Sparkles size={16} />
                            <span>Platform Commissions Collected</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="stat-grid" style={{ marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    {metrics.map((m, idx) => (
                        <div key={idx} className="card glass" style={{
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            border: isFullscreen ? '1px solid #334155' : '1px solid rgba(255,255,255,0.8)',
                            background: isFullscreen ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255,255,255,0.7)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                            borderRadius: '24px',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{
                                    background: m.color,
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    boxShadow: `0 8px 16px ${m.glow}`
                                }}>
                                    {m.icon}
                                </div>
                                <div style={{
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    background: m.trend >= 0 ? '#ecfdf5' : '#fef2f2',
                                    color: m.trend >= 0 ? '#10b981' : '#f43f5e'
                                }}>
                                    {m.trend >= 0 ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                                    {Math.abs(m.trend)}%
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: isFullscreen ? '#94a3b8' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{m.label}</div>
                                <div style={{ fontSize: '28px', fontWeight: '900', color: isFullscreen ? '#fff' : '#0f172a' }}>{m.value}</div>
                            </div>

                            {/* Sparkline Chart */}
                            <div style={{ height: '60px', width: 'calc(100% + 48px)', margin: '0 -24px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sparklineData}>
                                        <Area
                                            type="monotone"
                                            dataKey="val"
                                            stroke={m.textColor}
                                            strokeWidth={2}
                                            fillOpacity={0.1}
                                            fill={m.textColor}
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: isFullscreen ? '1px solid #334155' : '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700' }}>
                                <span style={{ color: isFullscreen ? '#64748b' : '#94a3b8' }}>PREVIOUS</span>
                                <span style={{ color: isFullscreen ? '#94a3b8' : '#64748b' }}>{m.prev}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isFullscreen ? 'repeat(auto-fit, minmax(400px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', paddingBottom: '40px' }}>
                    {/* Main Analytics Chart */}
                    <div className="card" style={{ gridColumn: isFullscreen ? 'span 2' : 'span 2', padding: '32px', border: isFullscreen ? '1px solid #334155' : '1px solid #f1f5f9', background: isFullscreen ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexDirection: 'row', gap: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: isFullscreen ? '#fff' : '#0f172a' }}>Revenue Analytics</h3>
                                <p style={{ fontSize: '12px', color: isFullscreen ? '#94a3b8' : '#94a3b8', fontWeight: '600', marginTop: '2px' }}>HOURLY PERFORMANCE FEED</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isFullscreen ? '#1e293b' : '#f8fafc', padding: '8px 16px', borderRadius: '12px', border: isFullscreen ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', animation: 'pulse 2s infinite' }}></div>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: isFullscreen ? '#94a3b8' : '#475569' }}>LIVE DATA</span>
                            </div>
                        </div>

                        <div style={{ height: isFullscreen ? '450px' : '350px', width: '100%', transition: 'all 0.5s ease' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.hourly_revenue}>
                                    <defs>
                                        <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isFullscreen ? '#334155' : '#f1f5f9'} />
                                    <XAxis
                                        dataKey="time"
                                        fontSize={10}
                                        fontWeight={700}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: isFullscreen ? '#64748b' : '#94a3b8' }}
                                        tickMargin={12}
                                    />
                                    <YAxis
                                        fontSize={10}
                                        fontWeight={700}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: isFullscreen ? '#64748b' : '#94a3b8' }}
                                        tickFormatter={(v) => `฿${v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isFullscreen ? '#1e293b' : 'rgba(255,255,255,0.9)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '20px',
                                            border: isFullscreen ? '1px solid #334155' : '1px solid #f1f5f9',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                            fontSize: '11px',
                                            fontWeight: '800',
                                            color: isFullscreen ? '#fff' : '#000'
                                        }}
                                        itemStyle={{ color: '#6366f1' }}
                                        cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        strokeLinecap="round"
                                        fillOpacity={1}
                                        fill="url(#colorPremium)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="card" style={{ padding: '32px', background: isFullscreen ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: '32px', border: isFullscreen ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: isFullscreen ? '#fff' : '#0f172a', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                                Action Hub
                                <span style={{ background: '#f43f5e', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', animation: 'bounce 2s infinite' }}>3</span>
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { title: 'Driver Verification', count: 5, color: '#6366f1', icon: <Users size={16} /> },
                                    { title: 'Pending Payouts', count: 2, color: '#f43f5e', icon: <DollarSign size={16} /> },
                                    { title: 'System Alerts', count: 1, color: '#f59e0b', icon: <AlertCircle size={16} /> }
                                ].map((item, i) => (
                                    <div key={i} className="action-item" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '16px',
                                        borderRadius: '20px',
                                        background: isFullscreen ? '#1e293b' : 'white',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s ease',
                                        border: isFullscreen ? '1px solid #334155' : '1px solid transparent'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ background: `${item.color}15`, color: item.color, padding: '10px', borderRadius: '12px' }}>
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '800', color: isFullscreen ? '#f8fafc' : '#1e293b' }}>{item.title}</div>
                                                <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8' }}>{item.count} items pending</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} color="#e2e8f0" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Premium Ad */}
                        <div style={{
                            background: isFullscreen ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #1e293b, #0f172a)',
                            padding: '32px',
                            borderRadius: '32px',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
                            border: '4px solid rgba(255,255,255,0.1)'
                        }}>
                            <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '150px', height: '150px', background: 'white', opacity: 0.05, borderRadius: '50%' }}></div>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '8px', fontSize: '9px', fontWeight: '800', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>VERSION 2.4</div>
                                <h4 style={{ fontSize: '20px', fontWeight: '900', lineHeight: '1.2', marginBottom: '12px' }}>Predictive <br /> Fleet Analysis</h4>
                                <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>Unlock AI-driven insights to optimize your driver distribution.</p>
                                <button style={{ width: '100%', padding: '14px', borderRadius: '16px', background: 'white', color: '#0f172a', border: 'none', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>Upgrade Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes blob {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .5; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .action-item:hover {
                    transform: translateX(4px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.05);
                    border-color: #f1f5f9;
                }
                .card {
                    background-color: white;
                    border-radius: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .card.glass {
                    background-color: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                }
                .card:hover {
                    box-shadow: 0 15px 45px rgba(0,0,0,0.08);
                    transform: translateY(-4px);
                }
                .fullscreen-mode .card.glass {
                    background-color: rgba(30, 41, 59, 0.7);
                    border: 1px solid #334155;
                }
                @media (min-width: 768px) {
                    .stat-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .page-container > div:first-child { /* Header */
                        flex-direction: row;
                        align-items: center;
                    }
                }
                @media (min-width: 1024px) {
                    .stat-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                    .page-container > div:first-child { /* Header */
                        flex-direction: row;
                        align-items: center;
                    }
                }
            `}</style>
        </div>
    );
}
