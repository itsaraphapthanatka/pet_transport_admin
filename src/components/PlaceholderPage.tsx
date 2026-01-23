"use client";
import React from 'react';

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>{title}</h2>
            <p style={{ color: 'var(--text-muted)' }}>This management module is currently under development.</p>
        </div>
    );
}
