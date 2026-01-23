"use client";

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Car,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Clock,
  Loader2
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function Dashboard() {
  const [statsData, setStatsData] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          apiFetch('/admin/stats'),
          apiFetch('/admin/recent-orders?limit=5')
        ]);

        if (statsRes.ok && ordersRes.ok) {
          const stats = await statsRes.json();
          const orders = await ordersRes.json();
          setStatsData(stats);
          setRecentOrders(orders);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: statsData?.total_users?.toLocaleString() || '0', change: '+0%', isPositive: true, icon: Users, color: '#3b82f6' },
    { label: 'Active Drivers', value: statsData?.active_drivers?.toLocaleString() || '0', change: `Total: ${statsData?.total_drivers || 0}`, isPositive: true, icon: Car, color: '#10b981' },
    { label: 'Total Orders', value: statsData?.total_orders?.toLocaleString() || '0', change: '+0%', isPositive: true, icon: ClipboardCheck, color: '#8b5cf6' },
    { label: 'Revenue (Platform)', value: `฿${statsData?.total_revenue?.toLocaleString()}` || '฿0', change: 'Total cumulative', isPositive: true, icon: TrendingUp, color: '#f59e0b' },
  ];

  const formatPrice = (price: any) => {
    return Number(price).toLocaleString();
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Dashboard Overview</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Admin Dashboard connected to real-time PetGo production data.</p>
      </div>

      <div className="stat-grid">
        {stats.map((stat, index) => (
          <div key={index} className="card stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{
                background: `${stat.color}15`,
                padding: '10px',
                borderRadius: '12px',
                color: stat.color
              }}>
                <stat.icon size={22} />
              </div>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-on-sidebar)' }}>
                <MoreVertical size={18} />
              </button>
            </div>
            <p className="stat-label">{stat.label}</p>
            <h3 className="stat-value">{stat.value}</h3>
            <div className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
              {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Orders</h3>
            <button style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '14px', background: 'transparent', border: 'none', cursor: 'pointer' }}>View all</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Order ID</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Customer</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Driver</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', fontWeight: '600' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => (
                  <tr key={idx} style={{ borderBottom: idx === recentOrders.length - 1 ? 'none' : '1px solid var(--card-border)' }}>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600' }}>#{order.id}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px' }}>{order.customer?.full_name || 'N/A'}</td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', color: !order.driver ? 'var(--text-muted)' : 'inherit' }}>
                      {order.driver?.full_name || 'Unassigned'}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: order.status === 'completed' ? '#ecfdf5' : order.status === 'in_progress' ? '#eff6ff' : order.status === 'pending' ? '#fffbeb' : '#fef2f2',
                        color: order.status === 'completed' ? '#059669' : order.status === 'in_progress' ? '#2563eb' : order.status === 'pending' ? '#d97706' : '#dc2626'
                      }}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700' }}>฿{formatPrice(order.price)}</td>
                    <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>{getRelativeTime(order.created_at)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>System Health</h3>
            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
              All systems normal
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#3b82f615', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}>
                  <Clock size={16} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>API Connection</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>Connected</div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Real-time backend link active</p>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#8b5cf615', padding: '8px', borderRadius: '8px', color: '#8b5cf6' }}>
                  <Users size={16} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>User Growth</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800' }}>{statsData?.total_users || 0}</div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Total registered customers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
