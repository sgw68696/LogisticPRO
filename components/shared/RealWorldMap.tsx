'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// --- Types (same as your LiveAsset) ---
interface LiveAsset {
  id: string;
  name: string;
  carrier: string;
  type: 'Sea' | 'Air' | 'Road' | 'Rail';
  imo: string;
  originPort: string;
  originPortCode: string;
  destPort: string;
  destPortCode: string;
  eta: string;
  etaDisplay: string;
  speed: string;
  course: string;
  lat: number;
  lng: number;
  status: string;
  flag: string;
}

interface RealWorldMapProps {
  assets: LiveAsset[];
  selected: string | null;
  onSelect: (id: string) => void;
}

// We must lazy-load this to avoid SSR issues with Leaflet
function MapComponent({ assets, selected, onSelect }: RealWorldMapProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import to prevent SSR crash
    import('leaflet').then((L) => {
      import('../../lib/leaflet-fix'); // Apply icon fix

      if (mapRef.current || !containerRef.current) return;

      // Initialize map
      const map = L.map(containerRef.current, {
        center: [20, 60],
        zoom: 3,
        zoomControl: false,
        attributionControl: false,
      });

      mapRef.current = map;

      // Dark Navy Blue tile layer matching your screenshot
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '© OpenStreetMap contributors © CARTO',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Custom zoom control (top-right)
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Port labels (major hub markers)
      const ports = [
        { name: 'Le Havre', lat: 49.5, lng: 0.1 },
        { name: 'Rotterdam', lat: 51.9, lng: 4.5 },
        { name: 'Shanghai', lat: 31.2, lng: 121.5 },
        { name: 'Singapore', lat: 1.3, lng: 103.8 },
        { name: 'Dubai', lat: 25.2, lng: 55.3 },
        { name: 'Los Angeles', lat: 34.1, lng: -118.2 },
        { name: 'Hamburg', lat: 53.6, lng: 9.9 },
        { name: 'Colombo', lat: 6.9, lng: 79.9 },
      ];

      ports.forEach((port) => {
        const portIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:8px; height:8px; border-radius:50%;
            background:#4ade80; border:1.5px solid #fff;
            box-shadow:0 0 6px #4ade8088;
          "></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        });

        L.marker([port.lat, port.lng], { icon: portIcon })
          .bindTooltip(port.name, {
            permanent: true,
            direction: 'right',
            className: 'port-label',
            offset: [6, 0],
          })
          .addTo(map);
      });

      // Render asset markers
      assets.forEach((asset) => {
        const isSelected = selected === asset.id;

        const color =
          asset.type === 'Sea' ? '#3b82f6'
          : asset.type === 'Air' ? '#38bdf8'
          : asset.type === 'Rail' ? '#f59e0b'
          : '#22c55e';

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative; display:flex; align-items:center; justify-content:center;">
              ${isSelected ? `
                <div style="
                  position:absolute;
                  width:28px; height:28px;
                  border-radius:50%;
                  background:${color}33;
                  border:1.5px solid ${color}66;
                  animation: pulse 1.5s infinite;
                "></div>
              ` : ''}
              <div style="
                width:${isSelected ? 16 : 12}px;
                height:${isSelected ? 16 : 12}px;
                border-radius:50%;
                background:${color};
                border:2px solid #fff;
                box-shadow:0 0 8px ${color}88;
                z-index:1;
              "></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([asset.lat, asset.lng], { icon })
          .addTo(map)
          .bindTooltip(asset.name.split(' ').slice(0, 3).join(' '), {
            permanent: true,
            direction: 'right',
            className: 'vessel-label',
            offset: [10, 0],
          })
          .on('click', () => onSelect(asset.id));

        markersRef.current[asset.id] = marker;
      });

      // Draw route lines for Sea assets
      assets
        .filter((a) => a.type === 'Sea')
        .forEach((asset) => {
          L.polyline(
            [[asset.lat, asset.lng], [asset.lat + 2, asset.lng - 20]],
            {
              color: '#1e6aa0',
              weight: 1.5,
              dashArray: '6,8',
              opacity: 0.5,
            }
          ).addTo(map);
        });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run once

  // Pan to selected asset when it changes
  useEffect(() => {
    if (!mapRef.current || !selected) return;
    const asset = assets.find((a) => a.id === selected);
    if (asset) {
      mapRef.current.flyTo([asset.lat, asset.lng], 5, { duration: 1.2 });
    }
  }, [selected]);

  return (
    <>
      <style>{`
        .port-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #64748b;
          font-size: 10px;
          font-family: monospace;
          white-space: nowrap;
        }
        .vessel-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: #94a3b8;
          font-size: 9px;
          font-family: monospace;
          white-space: nowrap;
          font-weight: 600;
        }
        .leaflet-control-zoom a {
          background: #0d1f3c !important;
          color: #94a3b8 !important;
          border-color: #1e3a5f !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1e3a5f !important;
          color: white !important;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.5); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `}</style>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '380px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          overflow: 'hidden',
          background: '#0a1628',
        }}
      />
    </>
  );
}

// Export with SSR disabled (required for Leaflet in Next.js)
export const RealWorldMap = dynamic(
  () => Promise.resolve(MapComponent),
  { ssr: false }
);