"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Script from 'next/script';
import {
    Navigation,
    RefreshCw,
    Loader2,
    User,
    Info
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

declare global {
    interface Window {
        longdo: any;
    }
}

export default function LiveMapPage() {
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDriver, setSelectedDriver] = useState<any>(null);
    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<any[]>([]);
    const [mapReady, setMapReady] = useState(false);

    const fetchLocations = useCallback(async () => {
        try {
            const res = await apiFetch('/driver_locations/');
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
            }
        } catch (error) {
            console.error('Error fetching driver locations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, 15000);
        return () => clearInterval(interval);
    }, [fetchLocations]);

    // Handle markers update when locations or mapReady changes
    useEffect(() => {
        if (!mapReady || !mapRef.current || !window.longdo) return;

        const longdo = window.longdo;
        const map = mapRef.current;

        // Clear existing markers
        markersRef.current.forEach(marker => map.Overlays.remove(marker));
        markersRef.current = [];

        // Add new markers
        locations.forEach(loc => {
            const marker = new longdo.Marker(
                { lon: loc.lng, lat: loc.lat },
                {
                    title: `Driver #${loc.driver_id}`,
                    detail: `Last updated: ${new Date(loc.recorded_at).toLocaleTimeString()}`,
                    icon: {
                        url: 'https://map.longdo.com/mmmap/images/pin_mark.png',
                        offset: { x: 12, y: 45 }
                    }
                }
            );
            map.Overlays.add(marker);
            markersRef.current.push(marker);
        });
    }, [locations, mapReady]);

    const initMap = useCallback(() => {
        if (!window.longdo || !mapContainerRef.current || mapRef.current) return;

        const longdo = window.longdo;
        const map = new longdo.Map({
            placeholder: mapContainerRef.current
        });

        map.Layers.setBase(longdo.Layers.NORMAL);
        map.location({ lon: 100.5018, lat: 13.7563 }, true);
        map.zoom(10, true);

        mapRef.current = map;
        setMapReady(true);
    }, []);

    return (
        <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Script
                src={`https://api.longdo.com/map/?key=${process.env.NEXT_PUBLIC_LONGDO_MAP_API_KEY}`}
                onLoad={initMap}
                strategy="afterInteractive"
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Live Fleet Map</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Real-time tracking of {locations.length} active drivers.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={fetchLocations}
                        style={{
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
                        }}
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
                <div className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                    {/* Using a stable container ref to avoid removeChild errors */}
                    <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}>
                        {/* NO conditional rendering here to keep DOM stable for Longdo Map */}
                    </div>

                    {!mapReady && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f8fafc',
                            zIndex: 10
                        }}>
                            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                        </div>
                    )}
                </div>

                {/* Sidebar Driver List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
                    <div className="card" style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Navigation size={18} color="var(--primary)" />
                            Active Fleet
                        </h3>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '4px' }}>
                            {locations.map((loc, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setSelectedDriver(loc);
                                        if (mapRef.current) {
                                            mapRef.current.location({ lon: loc.lng, lat: loc.lat }, true);
                                            mapRef.current.zoom(14, true);
                                        }
                                    }}
                                    style={{
                                        padding: '12px',
                                        background: selectedDriver?.driver_id === loc.driver_id ? '#eff6ff' : '#f8fafc',
                                        borderRadius: '12px',
                                        border: `1px solid ${selectedDriver?.driver_id === loc.driver_id ? '#2563eb33' : '#f1f5f9'}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={16} />
                                            </div>
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Driver ID: {loc.driver_id}</span>
                                        </div>
                                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', background: '#fffbeb', color: '#d97706', borderRadius: '4px' }}>ACTIVE</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated: {new Date(loc.recorded_at).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            ))}
                            {locations.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    No active drivers on map.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ padding: '16px', background: '#eff6ff', border: 'none' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Info size={20} color="#2563eb" />
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e40af' }}>Fleet Monitoring</p>
                                <p style={{ fontSize: '12px', color: '#1e40af', marginTop: '4px' }}>Positions are updated every 15 seconds from Longdo Map API.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
