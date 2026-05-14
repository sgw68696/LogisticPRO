'use client';

import { useState, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockShipments, mockNotifications, mockShips, mockAnalytics } from '@/data/mockData';
import { formatDate } from '@/lib/utils';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Ship,
  Plane,
  Truck,
  Train,
  RefreshCw,
  Search,
  X,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  MapPin,
  Navigation,
  Clock,
  Package,
  CheckCircle2,
  Anchor,
  ArrowRight,
  Calendar,
  Container,
  FileText,
  Hash,
  Radio,
  ChevronDown,
  Filter,
  User,
  CalendarDays,
  TrendingUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import { RealWorldMap } from '@/components/shared/RealWorldMap';

// ─── Search Filter Modes ────────────────────────────────────────────────
const searchModes = [
  { key: 'bookingNr', label: 'Booking Nr', icon: Hash },
  { key: 'clientRef', label: 'Client Reference', icon: FileText },
  { key: 'houseBl', label: 'House BL', icon: FileText },
  { key: 'containerNr', label: 'Container Nr', icon: Container },
  { key: 'poNr', label: 'Purchase Order Nr', icon: Calendar },
] as const;

type SearchMode = (typeof searchModes)[number]['key'];

// ─── Vessel / Asset Data (enriched inline) ──────────────────────────────
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

const liveAssets: LiveAsset[] = [
  { id: 'V001', name: 'CMA CGM ALTAMIRA', carrier: 'CMA CGM', type: 'Sea', imo: '9961350', originPort: 'Yantian', originPortCode: 'CNYTN', destPort: 'Le Havre', destPortCode: 'FRLEH', eta: '2026-04-30T08:15:00Z', etaDisplay: '30-04-2026', speed: '0.1 kn', course: '274.5°', lat: 14, lng: 55, status: 'Sailing', flag: '🇫🇷' },
  { id: 'V002', name: 'MAERSK GUJARAT', carrier: 'Maersk', type: 'Sea', imo: '9345821', originPort: 'Chennai', originPortCode: 'INMAA', destPort: 'Singapore', destPortCode: 'SGSIN', eta: '2026-05-02T14:00:00Z', etaDisplay: '02-05-2026', speed: '14.2 kn', course: '112.0°', lat: 8, lng: 77, status: 'Sailing', flag: '🇩🇰' },
  { id: 'V003', name: 'EVERGREEN LOTUS', carrier: 'Evergreen', type: 'Sea', imo: '9851234', originPort: 'Rotterdam', originPortCode: 'NLRTM', destPort: 'Colombo', destPortCode: 'LKCMB', eta: '2026-05-05T06:00:00Z', etaDisplay: '05-05-2026', speed: '18.7 kn', course: '45.0°', lat: -5, lng: 65, status: 'Sailing', flag: '🇹🇼' },
  { id: 'V004', name: 'MSC AURORA', carrier: 'MSC', type: 'Sea', imo: '9724567', originPort: 'Shanghai', originPortCode: 'CNSHA', destPort: 'Hamburg', destPortCode: 'DEHAM', eta: '2026-05-08T22:00:00Z', etaDisplay: '08-05-2026', speed: '16.3 kn', course: '280.0°', lat: 25, lng: 95, status: 'Sailing', flag: '🇨🇭' },
  { id: 'V005', name: 'EVERGREEN ACE', carrier: 'Evergreen', type: 'Sea', imo: '9987654', originPort: 'Kaohsiung', originPortCode: 'TWKHH', destPort: 'Los Angeles', destPortCode: 'USLAX', eta: '2026-05-12T11:30:00Z', etaDisplay: '12-05-2026', speed: '15.8 kn', course: '60.0°', lat: 20, lng: 150, status: 'Sailing', flag: '🇹🇼' },
  { id: 'V006', name: 'Emirates EK512', carrier: 'Emirates SkyCargo', type: 'Air', imo: 'EK-512', originPort: 'Hyderabad', originPortCode: 'HYD', destPort: 'Dubai', destPortCode: 'DXB', eta: '2026-05-01T03:30:00Z', etaDisplay: '01-05-2026', speed: '820 km/h', course: '285.0°', lat: 20, lng: 65, status: 'In Transit', flag: '🇦🇪' },
  { id: 'V007', name: 'MH-14-CG-4421', carrier: 'VRL Logistics', type: 'Road', imo: 'GPS-4421', originPort: 'Pune', originPortCode: 'PNQ', destPort: 'Ahmedabad', destPortCode: 'AMD', eta: '2026-05-01T18:00:00Z', etaDisplay: '01-05-2026', speed: '68 km/h', course: '340.0°', lat: 21.5, lng: 73.5, status: 'On Route', flag: '🇮🇳' },
  { id: 'V008', name: 'KONKAN RAIL 7742', carrier: 'Konkan Railway', type: 'Rail', imo: 'RWY-7742', originPort: 'Mangalore', originPortCode: 'INIXE', destPort: 'Kolkata', destPortCode: 'INCCU', eta: '2026-05-03T08:00:00Z', etaDisplay: '03-05-2026', speed: '95 km/h', course: '60.0°', lat: 16, lng: 80, status: 'In Transit', flag: '🇮🇳' },
];

// ─── Exception type (derived from shipment data) ────────────────────────
interface Exception {
  id: string;
  trackingId: string;
  from: string;
  to: string;
  ref: string;
  carrier: string;
  date: string;
  delay: string | null;
  badge: 'CHANGED' | 'DELAYED' | 'CANCELLED';
}

// ─── Message type ───────────────────────────────────────────────────────
interface TrackingMessage {
  id: string;
  initials: string;
  title: string;
  ref: string;
  user: string;
  date: string;
  replied: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────
const modeIcon = (type: string) => {
  if (type === 'Sea') return <Ship className="w-4 h-4" />;
  if (type === 'Air') return <Plane className="w-4 h-4" />;
  if (type === 'Rail') return <Train className="w-4 h-4" />;
  return <Truck className="w-4 h-4" />;
};

const modeColor = (type: string) => {
  if (type === 'Sea') return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  if (type === 'Air') return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  if (type === 'Rail') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  return 'bg-green-500/15 text-green-400 border-green-500/30';
};

const exceptionBadgeColor = (badge: string) => {
  if (badge === 'DELAYED') return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
  if (badge === 'CANCELLED') return 'bg-red-500/15 text-red-400 border-red-500/40';
  return 'bg-orange-500/15 text-orange-400 border-orange-500/40';
};

// ─── Derive status counts from real shipment data ──────────────────────
function useShipmentStats() {
  return useMemo(() => {
    const total = mockShipments.length;
    const newShipments = mockShipments.filter(s => s.status === 'Pending').length;
    const booked = mockShipments.filter(s => s.status === 'Picked Up').length;
    const sailing = mockShipments.filter(s =>
      ['In Transit', 'Picked Up', 'Out for Delivery'].includes(s.status)
    ).length;
    const almostThere = mockShipments.filter(s => {
      if (!s.estimatedDelivery) return false;
      const eta = new Date(s.estimatedDelivery).getTime();
      const now = Date.now();
      const twoDays = 2 * 24 * 60 * 60 * 1000;
      return eta > now && eta - now <= twoDays;
    }).length;
    const arrived = mockShipments.filter(s => s.status === 'Delivered').length;
    return { total, newShipments, booked, sailing, almostThere, arrived };
  }, []);
}

// ─── Derive exceptions from shipment data ─────────────────────────────
function useExceptions(): Exception[] {
  return useMemo(() => {
    const riskStatuses = mockShipments.filter(s =>
      s.status === 'Cancelled' || s.status === 'Failed'
    );
    return riskStatuses.slice(0, 5).map((s, i) => {
      const pickupCity = s.pickupAddress.split(',').at(-1)?.trim() ?? s.pickupAddress;
      const deliveryCity = s.deliveryAddress.split(',').at(-1)?.trim() ?? s.deliveryAddress;
      return {
        id: `exc-${i + 1}`,
        trackingId: s.trackingNumber,
        from: pickupCity,
        to: deliveryCity,
        ref: s.id,
        carrier: s.senderName,
        date: formatDate(s.updatedAt, 'short'),
        delay: s.status === 'Failed' ? '1d' : null,
        badge: s.status === 'Failed' ? 'DELAYED' : 'CANCELLED',
      } as Exception;
    });
  }, []);
}

// ─── Derive messages from notifications ───────────────────────────────
function useTrackingMessages(): TrackingMessage[] {
  return useMemo(() => {
    return mockNotifications.slice(0, 6).map((n, i) => ({
      id: `msg-${i + 1}`,
      initials: n.title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      title: n.title,
      ref: n.actionUrl?.split('/').pop() ?? '',
      user: `${n.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - Alert`,
      date: formatDate(n.timestamp, 'short'),
      replied: n.read,
    }));
  }, []);
}

// ─── SVG World Map ─────────────────────────────────────────────────────
function WorldMapSVG({ assets, selected, onSelect }: {
  assets: LiveAsset[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const project = (lat: number, lng: number) => ({
    x: ((lng + 180) / 360) * 900,
    y: ((90 - lat) / 180) * 380,
  });

  // Major ports for labels
  const ports = [
    { name: 'Le Havre', lat: 49.5, lng: 0.1 },
    { name: 'Rotterdam', lat: 51.9, lng: 4.5 },
    { name: 'Hamburg', lat: 53.6, lng: 9.9 },
    { name: 'Shanghai', lat: 31.2, lng: 121.5 },
    { name: 'Singapore', lat: 1.3, lng: 103.8 },
    { name: 'Colombo', lat: 6.9, lng: 79.9 },
    { name: 'Dubai', lat: 25.2, lng: 55.3 },
    { name: 'Los Angeles', lat: 34.1, lng: -118.2 },
    { name: 'Chennai', lat: 13.1, lng: 80.3 },
    { name: 'Mumbai', lat: 19.1, lng: 72.9 },
    { name: 'Kaohsiung', lat: 22.6, lng: 120.3 },
    { name: 'Yantian', lat: 22.5, lng: 114.3 },
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border/50"
      style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 40%, #0a2a4a 100%)',
        minHeight: 380,
      }}
    >
      <svg
        viewBox="0 0 900 380"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[30, 60, 120, 150, 210, 240, 300, 330].map(y => (
          <line key={`lat-${y}`} x1="0" y1={(y * 380) / 360} x2="900" y2={(y * 380) / 360} stroke="#1e3a5f" strokeWidth="0.5" />
        ))}
        {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(x => (
          <line key={`lng-${x}`} x1={x} y1="0" x2={x} y2="380" stroke="#1e3a5f" strokeWidth="0.5" />
        ))}

        {/* Continents */}
        <path d="M450 140 L470 150 L480 180 L475 220 L460 250 L445 260 L430 240 L425 200 L435 160 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        <path d="M440 60 L480 55 L500 70 L490 90 L470 100 L450 95 L435 80 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        <path d="M500 50 L650 45 L720 60 L730 100 L700 130 L650 140 L580 130 L540 110 L510 90 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        <path d="M590 120 L620 115 L635 145 L625 175 L608 190 L590 175 L578 145 Z" fill="#1e4570" stroke="#2a5480" strokeWidth="1" />
        <path d="M100 55 L220 50 L260 80 L270 130 L240 160 L200 170 L150 150 L100 110 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        <path d="M190 180 L240 175 L260 210 L255 270 L230 300 L200 290 L175 250 L170 210 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        <path d="M680 220 L740 215 L770 240 L760 275 L720 285 L680 265 L665 240 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        <path d="M350 120 L370 115 L390 125 L395 145 L380 155 L360 150 L345 140 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="0.5" opacity="0.6" />

        {/* Port dots */}
        {ports.map(port => {
          const { x, y } = project(port.lat, port.lng);
          return (
            <g key={port.name}>
              <circle cx={x} cy={y} r="2" fill="#4ade80" opacity="0.5" />
              <text x={x + 4} y={y + 1} fill="#64748b" fontSize="6" fontFamily="monospace">{port.name}</text>
            </g>
          );
        })}

        {/* Shipping route lines */}
        {assets.filter(a => a.type === 'Sea').map((asset, i, seaAssets) => {
          const fromIdx = ports.findIndex(p =>
            p.name.toLowerCase().includes(asset.originPort.toLowerCase().slice(0, 4))
          );
          const toIdx = ports.findIndex(p =>
            p.name.toLowerCase().includes(asset.destPort.toLowerCase().slice(0, 4))
          );
          if (fromIdx === -1 || toIdx === -1) return null;
          const from = project(ports[fromIdx].lat, ports[fromIdx].lng);
          const to = project(ports[toIdx].lat, ports[toIdx].lng);
          return (
            <line
              key={`route-${asset.id}`}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="#1e6aa0"
              strokeWidth="0.6"
              strokeDasharray="3,4"
              opacity="0.35"
            />
          );
        })}

        {/* Asset pins */}
        {assets.map(asset => {
          const { x, y } = project(asset.lat, asset.lng);
          const isSelected = selected === asset.id;
          const pinColor =
            asset.type === 'Sea' ? '#3b82f6' :
              asset.type === 'Air' ? '#38bdf8' :
                asset.type === 'Rail' ? '#f59e0b' : '#22c55e';

          return (
            <g key={asset.id} onClick={() => onSelect(asset.id)} style={{ cursor: 'pointer' }}>
              {isSelected && (
                <>
                  <circle cx={x} cy={y} r="18" fill={pinColor} opacity="0.15">
                    <animate attributeName="r" from="14" to="24" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.2" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r="14" fill={pinColor} opacity="0.1">
                    <animate attributeName="r" from="10" to="18" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.15" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              <circle cx={x} cy={y} r={isSelected ? 8 : 5} fill={pinColor} stroke="white" strokeWidth={isSelected ? 2 : 1.5} opacity="0.95" />
              <text x={x + (isSelected ? 12 : 8)} y={y - (isSelected ? 8 : 4)} fill="#94a3b8" fontSize={isSelected ? 9 : 7} fontFamily="monospace" fontWeight={isSelected ? 'bold' : 'normal'}>
                {asset.name.split(' ').slice(0, 2).join(' ')}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Scale */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <div className="w-12 h-0.5 bg-muted-foreground/50" />
        <span className="text-[10px] text-muted-foreground">1000 nm</span>
      </div>

      {/* Zoom buttons */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button className="w-6 h-6 rounded bg-card/80 border border-border/50 text-foreground text-xs flex items-center justify-center hover:bg-card">+</button>
        <button className="w-6 h-6 rounded bg-card/80 border border-border/50 text-foreground text-xs flex items-center justify-center hover:bg-card">&minus;</button>
      </div>
    </div>
  );
}

// ─── Vessel Popup Card ─────────────────────────────────────────────────
function VesselPopup({ asset, onClose }: { asset: LiveAsset; onClose: () => void }) {
  return (
    <Card className="w-72 border-border/60 bg-card shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-base">{asset.flag}</span>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{asset.name}</p>
            <p className="text-xs text-muted-foreground">
              {asset.type === 'Sea' ? 'Container Ship' : asset.type === 'Air' ? 'Cargo Aircraft' : asset.type === 'Rail' ? 'Freight Train' : 'Truck'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="px-4 pt-3 pb-4">
        <div className="w-full h-28 rounded-md mb-3 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-border/30">
          {asset.type === 'Sea' ? (
            <Ship className="w-16 h-16 text-blue-400/50" />
          ) : asset.type === 'Air' ? (
            <Plane className="w-16 h-16 text-sky-400/50" />
          ) : asset.type === 'Rail' ? (
            <Train className="w-16 h-16 text-amber-400/50" />
          ) : (
            <Truck className="w-16 h-16 text-green-400/50" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <span className="text-muted-foreground">{asset.type === 'Air' ? 'Flight' : 'IMO'}</span>
          <span className="text-foreground font-mono">{asset.imo}</span>
          <span className="text-muted-foreground">Next port</span>
          <span className="text-foreground font-mono">{asset.destPortCode} → {asset.destPort}</span>
          <span className="text-muted-foreground">ETA</span>
          <span className="text-foreground font-mono">{asset.etaDisplay}</span>
          <span className="text-muted-foreground">Speed / Course</span>
          <span className="text-foreground font-mono">{asset.speed} / {asset.course}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-7 gap-1">
            <EyeOff className="w-3 h-3" />
            Hide track
          </Button>
          <Button size="sm" className="flex-1 text-xs h-7 gap-1">
            <Eye className="w-3 h-3" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────────────
function MiniBarChart({ data, keys, colors }: {
  data: { label: string; values: number[] }[];
  keys: number[];
  colors: string[];
}) {
  const allValues = data.flatMap(d => d.values);
  const max = Math.max(...allValues, 1);
  const barWidth = 10;
  const gap = 3;
  const groupWidth = keys.length * barWidth + (keys.length - 1) * gap;
  const totalWidth = Math.max(data.length * (groupWidth + 12), 200);
  const height = 60;

  return (
    <svg viewBox={`0 0 ${totalWidth} ${height + 18}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {data.map((d, gi) => (
        <g key={d.label} transform={`translate(${gi * (groupWidth + 12)}, 0)`}>
          {keys.map((_, ki) => {
            const val = d.values[ki] ?? 0;
            const barH = (val / max) * height;
            return (
              <rect
                key={`${d.label}-${ki}`}
                x={ki * (barWidth + gap)}
                y={height - barH}
                width={barWidth}
                height={Math.max(barH, 1)}
                rx="2"
                fill={colors[ki] ?? '#3b82f6'}
                opacity="0.85"
              />
            );
          })}
          <text x={groupWidth / 2} y={height + 14} textAnchor="middle" fontSize="7" fill="#64748b">{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Stats Bar Chart ───────────────────────────────────────────────────
function StatsBarChartsWithRecharts({ mode }: { mode: 'shipments' | 'containers' }) {
  const data = mockAnalytics.shipmentTrend.slice(0, 12);

  const chartData = data.map(d => ({
    label: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    value: mode === 'shipments' ? d.shipments : Math.floor(d.shipments * 0.7),
  }));

  const max = Math.max(...chartData.map(d => d.value), 1);
  const barWidth = 14;
  const gap = 4;
  const totalWidth = Math.max(chartData.length * (barWidth + gap), 220);
  const height = 80;

  return (
    <svg viewBox={`0 0 ${totalWidth} ${height + 20}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {chartData.map((d, i) => {
        const barH = (d.value / max) * height;
        const color = mode === 'shipments' ? '#22c55e' : '#3b82f6';
        return (
          <g key={d.label}>
            <rect
              x={i * (barWidth + gap)}
              y={height - barH}
              width={barWidth}
              height={Math.max(barH, 1)}
              rx="3"
              fill={color}
              opacity="0.8"
            >
              <title>{d.label}: {d.value}</title>
            </rect>
            {i % 2 === 0 && (
              <text
                x={i * (barWidth + gap) + barWidth / 2}
                y={height + 14}
                textAnchor="middle"
                fontSize="6"
                fill="#64748b"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function LiveMapPage() {
  const [activeStage, setActiveStage] = useState('Show All');
  const [selectedAsset, setSelectedAsset] = useState<string | null>('V001');
  const [vesselFilter, setVesselFilter] = useState('CMA CGM ALTAMIRA');
  const [historyRange, setHistoryRange] = useState('45 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('bookingNr');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const stats = useShipmentStats();
  const exceptions = useExceptions();
  const messages = useTrackingMessages();

  const selectedAssetData = liveAssets.find(a => a.id === selectedAsset) ?? null;

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setLoading(false);
    }, 800);
  };

  // ── Stage tabs derived from real shipment data ──
  const stageTabs = [
    { label: 'Show All', count: stats.total, icon: Package, color: 'text-foreground' },
    { label: 'New', count: stats.newShipments, icon: Package, color: 'text-sky-400' },
    { label: 'Booked', count: stats.booked, icon: CheckCircle2, color: 'text-blue-400' },
    { label: 'Sailing', count: stats.sailing, icon: Anchor, color: 'text-indigo-400' },
    { label: 'Almost There 2 days', count: stats.almostThere, icon: Navigation, color: 'text-amber-400' },
    { label: 'Arrived', count: stats.arrived, icon: CheckCircle2, color: 'text-green-400' },
  ];

  return (
    <PageWrapper title="Shipment Tracking" description="Real-time tracking dashboard for ocean, air, and land shipments">
      {/* ── Top Controls ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${searchModes.find(m => m.key === searchMode)?.label ?? 'Booking Nr'}`}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Vessel selector */}
        <div className="relative min-w-[280px]">
          <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={vesselFilter}
            onChange={e => setVesselFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-card border border-border/60 rounded-lg text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {liveAssets.map(a => {
              const display = a.type === 'Sea'
                ? `${a.originPort}[${a.originPortCode}] | ${a.etaDisplay} - ${a.name}`
                : `${a.originPort} → ${a.destPort} - ${a.name}`;
              return (
                <option key={a.id} value={a.name}>{display}</option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* History range */}
        <div className="relative min-w-[150px]">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={historyRange}
            onChange={e => setHistoryRange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-card border border-border/60 rounded-lg text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {['24 Hours', '7 Days', '14 Days', '30 Days', '45 Days', '90 Days'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="icon" className="w-9 h-9" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:inline">
            Last: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ── Search Filter Mode Tabs (radio-style) ────────────── */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {searchModes.map(mode => {
          const Icon = mode.icon;
          const isActive = searchMode === mode.key;
          return (
            <button
              key={mode.key}
              onClick={() => setSearchMode(mode.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${isActive
                  ? 'bg-primary/10 border-primary/40 text-primary shadow-sm'
                  : 'bg-card border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
                }`}
            >
              <Radio className={`w-3 h-3 ${isActive ? 'text-primary' : ''}`} />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* ── Stage Tabs ───────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-4">
        {stageTabs.map(stage => {
          const Icon = stage.icon;
          const isActive = activeStage === stage.label;
          return (
            <button
              key={stage.label}
              onClick={() => setActiveStage(stage.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${isActive
                  ? 'bg-primary/10 border-primary/40 text-primary shadow-sm'
                  : 'bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : stage.color}`} />
              <span className="hidden xs:inline">{stage.label}</span>
              <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>{stage.count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Map + Popup ──────────────────────────────────────── */}
      <div className="relative mb-4">
        {loading ? (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <SkeletonLoader variant="table" count={3} />
          </div>
        ) : (
          <RealWorldMap
            assets={liveAssets}
            selected={selectedAsset}
            onSelect={id => setSelectedAsset(prev => (prev === id ? null : id))}
          />
        )}

        {selectedAssetData && !loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 sm:top-3 z-20">
            <VesselPopup asset={selectedAssetData} onClose={() => setSelectedAsset(null)} />
          </div>
        )}
      </div>

      {/* ── Bottom Grid: Exceptions | Messages | Statistics ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Exceptions */}
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <CardTitle className="text-sm font-semibold">Exceptions</CardTitle>
            </div>
            <button className="text-xs text-primary hover:underline">See All</button>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4 space-y-3">
            {exceptions.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="w-8 h-8 text-green-400" />}
                title="No exceptions"
                description="All shipments are running smoothly"
              />
            ) : (
              exceptions.map(ex => (
                <div key={ex.id} className="pb-3 border-b border-border/30 last:border-0 last:pb-0">
                  <p className="text-[11px] text-muted-foreground mb-1.5">Export FCL – {ex.trackingId}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {ex.from}
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {ex.to}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${exceptionBadgeColor(ex.badge)}`}>
                      {ex.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono"># {ex.ref}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ex.date}{ex.delay ? ` (${ex.delay})` : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{ex.carrier}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <CardTitle className="text-sm font-semibold">Messages</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5">{messages.length}</Badge>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4 space-y-2.5">
            {messages.length === 0 ? (
              <EmptyState
                icon={<MessageSquare className="w-8 h-8 text-muted-foreground" />}
                title="No messages"
                description="No shipment-related messages yet"
              />
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="flex items-start gap-2.5 pb-2.5 border-b border-border/30 last:border-0 last:pb-0">
                  <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    {msg.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight truncate">{msg.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      #{msg.ref} {msg.user} · {msg.date}
                    </p>
                  </div>
                  <div className="text-muted-foreground shrink-0 mt-0.5">
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <CardTitle className="text-sm font-semibold">Statistics</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 gap-1">
              <TrendingUp className="w-3 h-3" />
              {historyRange}
            </Badge>
          </CardHeader>
          <CardContent className="px-4 pt-4 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
                  <Package className="w-3 h-3" />
                  Shipments
                </p>
                <StatsBarChartsWithRecharts mode="shipments" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium flex items-center gap-1.5">
                  <Container className="w-3 h-3" />
                  Containers
                </p>
                <StatsBarChartsWithRecharts mode="containers" />
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-green-500/70" />
                <span className="text-[10px] text-muted-foreground">Shipments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/70" />
                <span className="text-[10px] text-muted-foreground">Containers</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Live Assets Table ─────────────────────────────────── */}
      <Card className="border-border/60 bg-card shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-400" />
            <CardTitle className="text-sm font-semibold">Live Assets ({liveAssets.length})</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 gap-1">
            <Radio className="w-3 h-3 text-green-400" />
            Live
          </Badge>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  {['Mode', 'Vessel / Asset', 'Carrier', 'Route', 'ETA', 'Speed', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs text-muted-foreground font-medium pb-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {liveAssets.map(asset => (
                  <tr
                    key={asset.id}
                    className={`cursor-pointer hover:bg-muted/30 transition-colors ${selectedAsset === asset.id ? 'bg-primary/5' : ''
                      }`}
                    onClick={() => setSelectedAsset(prev => (prev === asset.id ? null : asset.id))}
                  >
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs ${modeColor(asset.type)}`}>
                        {modeIcon(asset.type)}
                        {asset.type}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap">
                      <span className="mr-1">{asset.flag}</span>
                      {asset.name}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-muted-foreground">{asset.carrier}</td>
                    <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                      <span className="font-mono">{asset.originPortCode}</span>
                      <ArrowRight className="w-3 h-3 inline mx-1 text-muted-foreground/50" />
                      <span className="font-mono">{asset.destPortCode}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-foreground whitespace-nowrap font-mono">{asset.etaDisplay}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{asset.speed}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${['Sailing', 'In Transit', 'On Route'].includes(asset.status)
                          ? 'bg-blue-500/10 text-blue-400'
                          : asset.status === 'Delayed'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
