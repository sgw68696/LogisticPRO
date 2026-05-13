'use client';

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Info,
  ChevronDown,
  Clock,
  Package,
  CheckCircle2,
  Anchor,
  ArrowRight,
} from 'lucide-react';

// ─── Mock Vessels / Vehicles ───────────────────────────────────────────────
const liveAssets = [
  { id: 'V001', name: 'CMA CGM ALTAMIRA', type: 'Sea', imo: '9961350', nextPort: 'LBBEY→TRIZM', eta: 'Apr 27, 08:15', speed: '0.1 kn', course: '274.5°', lat: 14, lng: 55, status: 'Sailing', flag: '🇫🇷' },
  { id: 'V002', name: 'MAERSK GUJARAT', type: 'Sea', imo: '9345821', nextPort: 'INMAA→SGSIN', eta: 'May 02, 14:00', speed: '14.2 kn', course: '112.0°', lat: 8, lng: 77, status: 'Sailing', flag: '🇩🇰' },
  { id: 'V003', name: 'Emirates EK512', type: 'Air', imo: 'EK-512', nextPort: 'HYD→DXB', eta: 'May 01, 03:30', speed: '820 km/h', course: '285.0°', lat: 20, lng: 65, status: 'In Transit', flag: '🇦🇪' },
  { id: 'V004', name: 'MH-14-CG-4421', type: 'Road', imo: 'GPS-4421', nextPort: 'Pune→Ahmedabad', eta: 'May 01, 18:00', speed: '68 km/h', course: '340.0°', lat: 21.5, lng: 73.5, status: 'On Route', flag: '🇮🇳' },
  { id: 'V005', name: 'DL-1C-AF-9901', type: 'Road', imo: 'GPS-9901', nextPort: 'Delhi→Jaipur', eta: 'May 01, 12:30', speed: '82 km/h', course: '220.0°', lat: 27.5, lng: 76.5, status: 'On Route', flag: '🇮🇳' },
  { id: 'V006', name: 'KONKAN RAIL 7742', type: 'Rail', imo: 'RWY-7742', nextPort: 'MAS→CCU', eta: 'May 03, 08:00', speed: '95 km/h', course: '60.0°', lat: 16, lng: 80, status: 'In Transit', flag: '🇮🇳' },
];

// ─── Shipment Stage Counts ──────────────────────────────────────────────────
const stageCounts = [
  { label: 'Show All', count: 34, icon: Package, color: 'text-foreground' },
  { label: 'New', count: 17, icon: Package, color: 'text-sky-400' },
  { label: 'Booked', count: 2, icon: CheckCircle2, color: 'text-blue-400' },
  { label: 'Sailing', count: 12, icon: Anchor, color: 'text-indigo-400' },
  { label: 'Almost There', count: 0, icon: Navigation, color: 'text-amber-400' },
  { label: 'Arrived', count: 3, icon: CheckCircle2, color: 'text-green-400' },
];

// ─── Exceptions ────────────────────────────────────────────────────────────
const exceptions = [
  { id: 'FCL-15001959', from: 'Rotterdam', to: 'Anshun', ref: '31032026101', carrier: 'COSCO BELGIUM', date: '17-04-2026', delay: '1d', badge: 'CHANGED' },
  { id: 'FCL-15001958', from: 'Rotterdam', to: 'Yantian', ref: '31032026101', carrier: 'EVERGREEN', date: '16-04-2026', delay: null, badge: 'CHANGED' },
  { id: 'FCL-15001960', from: 'Mumbai', to: 'Singapore', ref: '31032026102', carrier: 'Maersk India', date: '20-04-2026', delay: '2d', badge: 'DELAYED' },
];

// ─── Messages ──────────────────────────────────────────────────────────────
const messages = [
  { id: 'MSG001', initials: 'JJ', title: 'Helllup 15001849', ref: '15001849', user: 'Joost - User Janssen', date: '05-03-2026', replied: true },
  { id: 'MSG002', initials: 'JJ', title: 'Helllup 15001374', ref: '15001374', user: 'Joost - User Janssen', date: '05-03-2026', replied: true },
  { id: 'MSG003', initials: 'JJ', title: 'Hoi 15001935', ref: '15001935', user: 'Joost - User Janssen', date: '04-03-2026', replied: false },
  { id: 'MSG004', initials: 'AK', title: 'BOL Update 15001722', ref: '15001722', user: 'Amit - Ops Team', date: '03-03-2026', replied: false },
];

// ─── Statistics (bar chart data) ───────────────────────────────────────────
const statsData = [
  { month: 'Jan', shipments: 4, containers: 6 },
  { month: 'Feb', shipments: 2, containers: 5 },
  { month: 'Mar', shipments: 6, containers: 7 },
  { month: 'Apr', shipments: 3, containers: 4 },
  { month: 'May', shipments: 5, containers: 6 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
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

const badgeColor = (badge: string) => {
  if (badge === 'DELAYED') return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
  return 'bg-orange-500/15 text-orange-400 border-orange-500/40';
};

// ─── SVG World Map (simplified) ────────────────────────────────────────────
function WorldMapSVG({ assets, selected, onSelect }: {
  assets: typeof liveAssets;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  // Equirectangular projection helper
  const project = (lat: number, lng: number) => ({
    x: ((lng + 180) / 360) * 900,
    y: ((90 - lat) / 180) * 380,
  });

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border/50" style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 40%, #0a2a4a 100%)', minHeight: 380 }}>
      {/* Ocean grid lines */}
      <svg
        viewBox="0 0 900 380"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Latitude grid */}
        {[30, 60, 120, 150, 210, 240, 300, 330].map(y => (
          <line key={y} x1="0" y1={y * 380 / 360} x2="900" y2={y * 380 / 360} stroke="#1e3a5f" strokeWidth="0.5" />
        ))}
        {/* Longitude grid */}
        {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="380" stroke="#1e3a5f" strokeWidth="0.5" />
        ))}

        {/* Simplified continent outlines - Africa */}
        <path d="M450 140 L470 150 L480 180 L475 220 L460 250 L445 260 L430 240 L425 200 L435 160 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        {/* Europe */}
        <path d="M440 60 L480 55 L500 70 L490 90 L470 100 L450 95 L435 80 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        {/* Asia */}
        <path d="M500 50 L650 45 L720 60 L730 100 L700 130 L650 140 L580 130 L540 110 L510 90 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        {/* India */}
        <path d="M590 120 L620 115 L635 145 L625 175 L608 190 L590 175 L578 145 Z" fill="#1e4570" stroke="#2a5480" strokeWidth="1" />
        {/* North America */}
        <path d="M100 55 L220 50 L260 80 L270 130 L240 160 L200 170 L150 150 L100 110 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        {/* South America */}
        <path d="M190 180 L240 175 L260 210 L255 270 L230 300 L200 290 L175 250 L170 210 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />
        {/* Australia */}
        <path d="M680 220 L740 215 L770 240 L760 275 L720 285 L680 265 L665 240 Z" fill="#1a3a5c" stroke="#2a5480" strokeWidth="1" />

        {/* Route lines between assets */}
        {assets.map((asset, i) => {
          if (i === 0) return null;
          const from = project(assets[0].lat, assets[0].lng);
          const to = project(asset.lat, asset.lng);
          return (
            <line
              key={asset.id + '-line'}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="#1e6aa0"
              strokeWidth="0.8"
              strokeDasharray="4,4"
              opacity="0.4"
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
                <circle cx={x} cy={y} r="16" fill={pinColor} opacity="0.2">
                  <animate attributeName="r" from="12" to="20" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r={isSelected ? 8 : 6} fill={pinColor} stroke="white" strokeWidth="1.5" opacity="0.95" />
              <text x={x + 10} y={y - 6} fill="#94a3b8" fontSize="8" fontFamily="monospace">{asset.name.split(' ')[0]}</text>
            </g>
          );
        })}
      </svg>

      {/* Scale indicator */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <div className="w-12 h-0.5 bg-muted-foreground/50" />
        <span className="text-[10px] text-muted-foreground">1000 nm</span>
      </div>

      {/* Zoom buttons */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button className="w-6 h-6 rounded bg-card/80 border border-border/50 text-foreground text-xs flex items-center justify-center hover:bg-card">+</button>
        <button className="w-6 h-6 rounded bg-card/80 border border-border/50 text-foreground text-xs flex items-center justify-center hover:bg-card">−</button>
      </div>
    </div>
  );
}

// ─── Vessel Popup Card ──────────────────────────────────────────────────────
function VesselPopup({ asset, onClose }: { asset: typeof liveAssets[0]; onClose: () => void }) {
  return (
    <Card className="w-72 border-border/60 bg-card shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-base">{asset.flag}</span>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{asset.name}</p>
            <p className="text-xs text-muted-foreground">Container Ship</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="px-4 pt-3 pb-4">
        {/* Ship image placeholder */}
        <div className="w-full h-28 rounded-md mb-3 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-border/30">
          <Ship className="w-16 h-16 text-blue-400/50" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <span className="text-muted-foreground">IMO</span>
          <span className="text-foreground font-mono">{asset.imo}</span>
          <span className="text-muted-foreground">Next port</span>
          <span className="text-foreground font-mono">{asset.nextPort}</span>
          <span className="text-muted-foreground">ETA</span>
          <span className="text-foreground font-mono">{asset.eta}</span>
          <span className="text-muted-foreground">Speed / Course</span>
          <span className="text-foreground font-mono">{asset.speed} / {asset.course}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-7">Hide track</Button>
          <Button size="sm" className="flex-1 text-xs h-7">Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Mini Bar Chart ─────────────────────────────────────────────────────────
function MiniBarChart({ data, keys, colors }: { data: typeof statsData; keys: string[]; colors: string[] }) {
  const max = Math.max(...data.flatMap(d => keys.map(k => d[k as keyof typeof d] as number)));
  const barWidth = 10;
  const gap = 3;
  const groupWidth = keys.length * barWidth + (keys.length - 1) * gap;
  const totalWidth = data.length * (groupWidth + 12);
  const height = 60;

  return (
    <svg viewBox={`0 0 ${totalWidth} ${height + 16}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {data.map((d, gi) => (
        <g key={d.month} transform={`translate(${gi * (groupWidth + 12)}, 0)`}>
          {keys.map((k, ki) => {
            const val = d[k as keyof typeof d] as number;
            const barH = (val / max) * height;
            return (
              <rect
                key={k}
                x={ki * (barWidth + gap)}
                y={height - barH}
                width={barWidth}
                height={barH}
                rx="2"
                fill={colors[ki]}
                opacity="0.85"
              />
            );
          })}
          <text x={groupWidth / 2} y={height + 13} textAnchor="middle" fontSize="8" fill="#64748b">{d.month}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function LiveMapPage() {
  const [activeStage, setActiveStage] = useState('Show All');
  const [selectedAsset, setSelectedAsset] = useState<string | null>('V001');
  const [vesselFilter, setVesselFilter] = useState('CMA CGM ALTAMIRA');
  const [historyRange, setHistoryRange] = useState('45 Days');

  const selectedAssetData = liveAssets.find(a => a.id === selectedAsset) ?? null;

  return (
    <PageWrapper title="Live Map">
      {/* ── Top Controls ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Booking search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Booking Nr."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border/60 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Vessel filter */}
        <div className="relative min-w-[260px]">
          <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={vesselFilter}
            onChange={e => setVesselFilter(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-card border border-border/60 rounded-lg text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {liveAssets.map(a => (
              <option key={a.id} value={a.name}>{a.type === 'Sea' ? 'Yantian|CNYTN' : a.name} — {a.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* History range */}
        <div className="relative min-w-[160px]">
          <select
            value={historyRange}
            onChange={e => setHistoryRange(e.target.value)}
            className="w-full pl-3 pr-8 py-2 text-sm bg-card border border-border/60 rounded-lg text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {['7 Days', '14 Days', '30 Days', '45 Days', '90 Days'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>

        {/* Refresh */}
        <Button variant="outline" size="icon" className="shrink-0 w-9 h-9">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Stage Tabs ───────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-4">
        {stageCounts.map(stage => {
          const Icon = stage.icon;
          const isActive = activeStage === stage.label;
          return (
            <button
              key={stage.label}
              onClick={() => setActiveStage(stage.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                isActive
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'bg-card border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : stage.color}`} />
              {stage.label}
              <span className={`text-xs font-bold ${isActive ? 'text-primary' : 'text-foreground'}`}>{stage.count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Map + Popup ──────────────────────────────────────── */}
      <div className="relative mb-4">
        <WorldMapSVG
          assets={liveAssets}
          selected={selectedAsset}
          onSelect={id => setSelectedAsset(prev => prev === id ? null : id)}
        />

        {/* Vessel popup — overlaid top-right of map */}
        {selectedAssetData && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 sm:top-3 z-20">
            <VesselPopup
              asset={selectedAssetData}
              onClose={() => setSelectedAsset(null)}
            />
          </div>
        )}
      </div>

      {/* ── Bottom Grid: Exceptions | Messages | Statistics ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

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
            {exceptions.map(ex => (
              <div key={ex.id} className="pb-3 border-b border-border/30 last:border-0 last:pb-0">
                <p className="text-[11px] text-muted-foreground mb-1.5">Export FCL – {ex.id}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {ex.from}
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {ex.to}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${badgeColor(ex.badge)}`}>
                    {ex.badge}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="font-mono"># {ex.ref}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ex.date}{ex.delay ? ` (${ex.delay})` : ''}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{ex.carrier}</p>
              </div>
            ))}
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
            {messages.map(msg => (
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
                {msg.replied && (
                  <div className="text-muted-foreground shrink-0 mt-0.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b border-border/40">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              <CardTitle className="text-sm font-semibold">Statistics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pt-4 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Shipments next 45 days</p>
                <MiniBarChart
                  data={statsData}
                  keys={['shipments']}
                  colors={['#22c55e']}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Containers next 45 days</p>
                <MiniBarChart
                  data={statsData}
                  keys={['containers']}
                  colors={['#3b82f6']}
                />
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500/70" />
                <span className="text-[11px] text-muted-foreground">Shipments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500/70" />
                <span className="text-[11px] text-muted-foreground">Containers</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Asset List ───────────────────────────────────────── */}
      <Card className="mt-4 border-border/60 bg-card shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-400" />
            <CardTitle className="text-sm font-semibold">Live Assets ({liveAssets.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 pt-3 pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  {['Mode', 'Name / ID', 'IMO / Ref', 'Next Port / Route', 'ETA', 'Speed', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs text-muted-foreground font-medium pb-2 pr-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {liveAssets.map(asset => (
                  <tr
                    key={asset.id}
                    className={`cursor-pointer hover:bg-muted/30 transition-colors ${
                      selectedAsset === asset.id ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedAsset(prev => prev === asset.id ? null : asset.id)}
                  >
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs ${modeColor(asset.type)}`}>
                        {modeIcon(asset.type)}
                        {asset.type}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap">
                      {asset.flag} {asset.name}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{asset.imo}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground text-xs">{asset.nextPort}</td>
                    <td className="py-2.5 pr-4 text-xs text-foreground whitespace-nowrap">{asset.eta}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{asset.speed}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        asset.status === 'Sailing' || asset.status === 'In Transit' || asset.status === 'On Route'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-green-500/10 text-green-400'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
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
