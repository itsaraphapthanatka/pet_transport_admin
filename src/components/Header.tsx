"use client";

import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = () => {
    return (
        <header className="header">
            <div className="search-bar" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f1f5f9',
                padding: '8px 16px',
                borderRadius: '10px',
                width: '400px'
            }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                    type="text"
                    placeholder="Search for orders, users, drivers..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '14px',
                        color: 'var(--text-main)'
                    }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <button style={{ background: 'transparent', border: 'none', position: 'relative', cursor: 'pointer' }}>
                    <Bell size={20} color="var(--text-main)" />
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        background: '#ef4444',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }}></span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Admin User</p>
                        <p style={{ fontSize: '11px', fontWeight: '500', color: 'var(--text-muted)' }}>Super Administrator</p>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
