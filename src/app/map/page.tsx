"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Script from 'next/script';
import {
    Navigation,
    RefreshCw,
    Loader2,
    User,
    Info,
    Flame,
    Eye,
    EyeOff
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
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [language, setLanguage] = useState('en');
    const [demandData, setDemandData] = useState<any[]>([]);
    const heatmapRef = useRef<any[]>([]);

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

    const fetchDemandData = useCallback(async () => {
        try {
            const res = await apiFetch(`/admin/insights/fleet-prediction?lang=${language}`);
            if (res.ok) {
                const data = await res.json();
                setDemandData(data.hotzones || []);
            }
        } catch (error) {
            console.error('Error fetching demand data:', error);
        }
    }, [language]);

    useEffect(() => {
        fetchLocations();
        if (showHeatmap) fetchDemandData();
        const interval = setInterval(() => {
            fetchLocations();
            if (showHeatmap) fetchDemandData();
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchLocations, fetchDemandData, showHeatmap]);

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
            const driverInfo = loc.driver;
            const marker = new longdo.Marker(
                { lon: loc.lng, lat: loc.lat },
                {
                    title: driverInfo?.full_name || `Driver #${loc.driver_id}`,
                    detail: `${driverInfo?.vehicle_plate || 'No Plate'} | Updated: ${loc.recorded_at ? new Date(loc.recorded_at).toLocaleTimeString() : 'N/A'}`,
                    icon: {
                        url: '/car-icon-premium.svg',
                        size: { width: 18, height: 36 },
                        offset: { x: 9, y: 18 }
                    }
                }
            );
            map.Overlays.add(marker);
            markersRef.current.push(marker);
        });
    }, [locations, mapReady]);

    // Handle Demand Heatmap update
    useEffect(() => {
        if (!mapReady || !mapRef.current || !window.longdo) return;

        const longdo = window.longdo;
        const map = mapRef.current;

        // Clear existing heatmap overlays
        heatmapRef.current.forEach(overlay => map.Overlays.remove(overlay));
        heatmapRef.current = [];

        if (!showHeatmap || demandData.length === 0) return;

        // Add hexagon overlays for demand hotzones
        demandData.forEach(zone => {
            const getColor = (urgency: string) => {
                if (urgency === 'critical') return 'rgba(239, 68, 68, 0.5)'; // red-500
                if (urgency === 'high') return 'rgba(249, 115, 22, 0.4)';    // orange-500
                return 'rgba(234, 179, 8, 0.3)';                             // yellow-500
            };

            const getBorderColor = (urgency: string) => {
                if (urgency === 'critical') return 'rgba(239, 68, 68, 0.8)';
                if (urgency === 'high') return 'rgba(249, 115, 22, 0.7)';
                return 'rgba(234, 179, 8, 0.6)';
            };

            // Calculate hexagon vertices (radius ~0.02 degrees)
            const radius = 0.02;
            const points = [];
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                points.push({
                    lon: zone.lng + radius * Math.cos(angle) * 1.03,
                    lat: zone.lat + radius * Math.sin(angle)
                });
            }

            const polygon = new longdo.Polygon(points, {
                fillColor: getColor(zone.urgency),
                lineColor: getBorderColor(zone.urgency),
                lineWidth: 2
            });

            map.Overlays.add(polygon);
            heatmapRef.current.push(polygon);
        });
    }, [demandData, showHeatmap, mapReady]);

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>Live Fleet Map</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Real-time tracking of {locations.length} active drivers.</p>
                    </div>

                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '2px' }}>
                        <button
                            onClick={() => setLanguage('en')}
                            style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                borderRadius: '10px',
                                background: language === 'en' ? 'white' : 'transparent',
                                border: 'none',
                                color: language === 'en' ? '#6366f1' : '#64748b',
                                cursor: 'pointer',
                                fontWeight: '700',
                                boxShadow: language === 'en' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}>EN</button>
                        <button
                            onClick={() => setLanguage('th')}
                            style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                borderRadius: '10px',
                                background: language === 'th' ? 'white' : 'transparent',
                                border: 'none',
                                color: language === 'th' ? '#6366f1' : '#64748b',
                                cursor: 'pointer',
                                fontWeight: '700',
                                boxShadow: language === 'th' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                            }}>TH</button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: showHeatmap ? '#fef2f2' : 'white',
                            border: `1px solid ${showHeatmap ? '#fee2e2' : '#e2e8f0'}`,
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: showHeatmap ? '#ef4444' : 'var(--text-main)',
                            cursor: 'pointer'
                        }}
                    >
                        {showHeatmap ? <EyeOff size={18} /> : <Eye size={18} />}
                        {showHeatmap
                            ? (language === 'th' ? "ซ่อนพื้นที่ความต้องการ" : "Hide Demand")
                            : (language === 'th' ? "แสดงพื้นที่ความต้องการ" : "Show Demand")}
                    </button>
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
                        Refresh Fleet
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
                <div className="card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
                    {/* Map Legend Overlay */}
                    {showHeatmap && (
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(8px)',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            zIndex: 100,
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Flame size={14} color="#ef4444" />
                                {language === 'th' ? "ความหนาแน่นของความต้องการ" : "Demand Intensity"}
                            </div>
                            {[
                                { label: language === 'th' ? 'ขั้นวิกฤต' : 'Critical', color: '#ef4444' },
                                { label: language === 'th' ? 'สูง' : 'High', color: '#f97316' },
                                { label: language === 'th' ? 'เหมาะสม' : 'Optimal', color: '#eab308' }
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.color }}></div>
                                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

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
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: '14px', fontWeight: '800' }}>{loc.driver?.full_name || 'Unknown'}</span>
                                                <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: '700' }}>{loc.driver?.vehicle_plate || '---'}</span>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', background: '#fffbeb', color: '#d97706', borderRadius: '4px' }}>ACTIVE</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated: {loc.recorded_at ? new Date(loc.recorded_at).toLocaleTimeString() : 'Just now'}</p>
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
