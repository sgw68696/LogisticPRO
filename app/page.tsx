"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  MapPin,
  Truck,
  BarChart3,
  Play,
  ClipboardList,
  CheckCircle,
  PackageOpen,
  Anchor,
  ShieldCheck,
  Route,
  PackageCheck,
  Lock,
  Plane,
  Ship,
  TrainFront,
  GitMerge,
  Bike,
  Cpu,
  Smartphone,
  Monitor,
  Globe,
  Plug,
  Crown,
  Building2,
  Briefcase,
  Radio,
  Settings2,
  Warehouse,
  CircleDot,
  IndianRupee,
  Headset,
  Search,
  User,
  Layers,
  Building,
  KeyRound,
  FileSearch,
  PackageSearch,
  Users,
  Workflow,
  ChevronDown,
  Send,
  Menu,
  X,
  Zap,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

const C = {
  sky:   { 400: "#38bdf8", 500: "#0ea5e9", 600: "#0284c7" },
  indigo:{ 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5" },
  teal:  { 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488" },
  cyan:  { 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2" },
  green: { 400: "#4ade80", 500: "#22c55e", 600: "#16a34a" },
  amber: { 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" },
  purple:{ 400: "#c084fc", 500: "#a855f7", 600: "#9333ea" },
  red:   { 400: "#f87171", 500: "#ef4444", 600: "#dc2626" },
  orange:{ 400: "#fb923c", 500: "#f97316" },
  yellow:{ 400: "#facc15", 500: "#eab308" },
  pink:  { 400: "#f472b6", 600: "#db2777" },
  violet:{ 400: "#a78bfa", 600: "#7c3aed" },
  slate: { 300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b", 600: "#475569" },
  white: "#ffffff",
  f0f9ff:"#f0f9ff",
  e0f2fe:"#e0f2fe",
  bgDark:"#050d1a",
  cardBg:"rgba(10,20,40,0.75)",
  cardBorder:"rgba(14,165,233,0.2)",
  btnGradient:"linear-gradient(135deg, #0ea5e9, #6366f1)",
  btnGradientHover:"linear-gradient(135deg, #38bdf8, #818cf8)",
  btnShadow:"0 4px 24px rgba(14,165,233,0.3)",
  btnShadowHover:"0 8px 32px rgba(14,165,233,0.45)",
  orbBg:"#0ea5e9",
  orbBg2:"#6366f1",
  orbBg3:"#14b8a6",
  gridLine:"rgba(14,165,233,0.04)",
  particle:"rgba(14,165,233,0.6)",
  trustDot:"#22d3ee",
  glow:"0 0 40px rgba(14,165,233,0.15)",
  glowStrong:"0 0 60px rgba(14,165,233,0.25)",
};

function rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function iconStyle(color: string) {
  return { color };
}

function cardBg(color: string) {
  return { backgroundColor: rgba(color, 0.1) };
}

function cardBgHover(color: string) {
  return { backgroundColor: rgba(color, 0.2) };
}

function badgeBg(color: string) {
  return { backgroundColor: rgba(color, 0.1), color };
}

function borderHover(color: string) {
  return { borderColor: rgba(color, 0.4) };
}

function badgeStyle(color: string) {
  return {
    backgroundColor: rgba(color, 0.1),
    color,
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "9px",
  };
}

const stats = [
  { icon: Package, value: "3,600+", label: "Shipments", color: C.sky[400] },
  { icon: MapPin, value: "94.5%", label: "On-Time", color: C.green[400] },
  { icon: Truck, value: "15+", label: "Vehicles", color: C.amber[400] },
  { icon: BarChart3, value: "22+", label: "Drivers", color: C.purple[400] },
];

const lifecycleSteps = [
  { icon: ClipboardList, title: "Booking", roles: "CompanyAdmin, Manager", docs: ["Rate Card", "Booking Form"], color: C.sky[500], textColor: C.sky[400] },
  { icon: CheckCircle, title: "Confirmed", roles: "CompanyAdmin, Dispatcher", docs: ["Confirmation"], color: C.green[600], textColor: C.green[400] },
  { icon: PackageOpen, title: "Picked Up", roles: "Driver, Warehouse", docs: ["Packing List", "GRN"], color: C.amber[600], textColor: C.amber[400] },
  { icon: Truck, title: "In Transit", roles: "Dispatcher, Operator", docs: ["BOL", "Tracking"], color: C.indigo[600], textColor: C.indigo[400] },
  { icon: Anchor, title: "At Port", roles: "PortAgent", docs: ["Manifest"], color: C.cyan[600], textColor: C.cyan[400] },
  { icon: ShieldCheck, title: "Customs", roles: "CustomsAgent", docs: ["Declaration", "COO"], color: C.red[600], textColor: C.red[400] },
  { icon: Route, title: "Out for Delivery", roles: "Driver", docs: ["Trip Sheet"], color: C.indigo[600], textColor: C.indigo[400] },
  { icon: PackageCheck, title: "Delivered", roles: "Driver, Warehouse", docs: ["Signed POD"], color: C.green[600], textColor: C.green[400] },
  { icon: Lock, title: "Closed", roles: "Finance Agent", docs: ["Invoice", "Payment"], color: C.slate[500], textColor: C.slate[400] },
];

const transportModes = [
  { icon: Truck, title: "Road", fields: "Vehicle No., Driver, Route", tracking: "GPS / Trip ID", docs: "Trip Sheet, Toll Receipts", color: C.amber[600], textColor: C.amber[400] },
  { icon: Plane, title: "Air Freight", fields: "Airline, Flight No.", tracking: "AWB Number", docs: "Air Waybill, Cargo Manifest", color: C.sky[600], textColor: C.sky[400] },
  { icon: Ship, title: "Sea Freight", fields: "Vessel, Voyage No., Port", tracking: "IMO / Container No.", docs: "BOL, Arrival Notice", color: C.indigo[600], textColor: C.indigo[400] },
  { icon: TrainFront, title: "Rail", fields: "Train No., Wagon No.", tracking: "Rail Consignment No.", docs: "Rail Waybill", color: C.teal[500], textColor: C.teal[400] },
  { icon: GitMerge, title: "Multimodal", fields: "All modes in sequence", tracking: "Master Tracking ID", docs: "All + Handoff Records", color: C.violet[600], textColor: C.violet[400] },
  { icon: Bike, title: "Last-Mile", fields: "Courier, Bag No.", tracking: "Tracking No.", docs: "POD, Delivery Slip", color: C.pink[600], textColor: C.pink[400] },
];

const features = [
  { icon: PackageSearch, title: "Shipment Management", desc: "Track every shipment from booking to closure. Real-time status, automated notifications, and complete audit trail.", color: C.sky[500], textColor: C.sky[400] },
  { icon: Users, title: "Driver & Fleet", desc: "Onboard drivers, track GPS, manage vehicles, monitor maintenance, fuel logs, and document expiry.", color: C.green[600], textColor: C.green[400] },
  { icon: Warehouse, title: "Warehouse & Inventory", desc: "GRN/GDN, stock positions, bin locations, cycle count, damage reports, and cold chain monitoring.", color: C.amber[600], textColor: C.amber[400] },
  { icon: ShieldCheck, title: "Compliance & Customs", desc: "Customs declarations, HS codes, import/export licenses, dangerous goods rules, and country restrictions.", color: C.indigo[600], textColor: C.indigo[400] },
  { icon: BarChart3, title: "Finance & Billing", desc: "Invoicing, payments, expenses, reconciliation, subscription billing, and revenue analytics.", color: C.red[600], textColor: C.red[400] },
  { icon: Workflow, title: "Workflow Builder", desc: "Custom fields, custom statuses, email/notification templates, and document type definitions.", color: C.cyan[600], textColor: C.cyan[400] },
];

const modules = [
  { icon: Package, title: "Shipments", desc: "Booking to closure lifecycle, BOL, container tracking", color: C.sky[500], textColor: C.sky[400] },
  { icon: Users, title: "Dispatch & Fleet", desc: "Drivers, GPS tracking, trips, maintenance, fuel", color: C.green[600], textColor: C.green[400] },
  { icon: Warehouse, title: "Warehouse", desc: "GRN/GDN, stock, bin locations, cycle count", color: C.amber[600], textColor: C.amber[400] },
  { icon: ShieldCheck, title: "Compliance", desc: "Customs, HS codes, DG rules, licenses", color: C.indigo[600], textColor: C.indigo[400] },
  { icon: IndianRupee, title: "Finance", desc: "Invoicing, payments, expenses, reconciliation", color: C.red[600], textColor: C.red[400] },
  { icon: Anchor, title: "Port & Airport", desc: "Vessel/flight schedule, berths, manifests", color: C.cyan[600], textColor: C.cyan[400] },
  { icon: Workflow, title: "Workflows", desc: "Custom fields, statuses, builder, templates", color: C.pink[600], textColor: C.pink[400] },
  { icon: BarChart3, title: "Analytics", desc: "Platform, shipment, revenue, SLA reports", color: C.indigo[600], textColor: C.indigo[400] },
];

const roles = [
  { icon: Crown, title: "SuperAdmin", sub: "Platform-wide · 50+ Routes", desc: "Full platform control. Companies, organizations, RBAC matrix, integrations, audit logs.", color: C.red[600], textColor: C.red[400] },
  { icon: Building2, title: "CompanyAdmin", sub: "Company-scoped · 40+ Routes", desc: "Full control within one company. Bookings, fleet, warehouse, finance, users.", color: C.sky[500], textColor: C.sky[400] },
  { icon: Briefcase, title: "Manager", sub: "8 Groups · /manager/", desc: "Full operational oversight — bookings, shipments, dispatch, warehouse, finance.", color: C.teal[500], textColor: C.teal[400] },
  { icon: Radio, title: "Dispatcher", sub: "4 Groups · /ops/", desc: "Movement and logistics execution. Dispatch board, drivers, fleet, live map.", color: C.amber[600], textColor: C.amber[400] },
  { icon: Settings2, title: "Operator", sub: "4 Groups · /ops/", desc: "Execution support. Trip updates, document uploads, status changes, driver coordination.", color: C.orange[500], textColor: C.orange[400] },
  { icon: Warehouse, title: "Agent (Warehouse)", sub: "4 Groups · /agent/", desc: "GRN, GDN, stock management, bin locations, damage reports, cycle counts.", color: C.cyan[600], textColor: C.cyan[400] },
  { icon: CircleDot, title: "Agent (Driver)", sub: "3 Groups · /agent/", desc: "Assigned trips, POD uploads, navigation, status updates, expense logging.", color: C.green[600], textColor: C.green[400] },
  { icon: IndianRupee, title: "Agent (Finance)", sub: "4 Groups · /agent/", desc: "Invoices, payments, expense reconciliation, revenue tracking, reports.", color: C.teal[500], textColor: C.teal[400] },
  { icon: ShieldCheck, title: "Agent (Customs)", sub: "4 Groups · /customs/", desc: "Customs declarations, HS codes, document verification, clearance tracking.", color: C.red[600], textColor: C.red[400] },
  { icon: Anchor, title: "Agent (Port)", sub: "4 Groups · /port/", desc: "Vessel/flight schedules, berth management, manifest processing, cargo handling.", color: C.cyan[600], textColor: C.cyan[400] },
  { icon: Headset, title: "Staff", sub: "Approval Queue", desc: "Create and upload, but changes enter an approval queue before going live.", color: C.slate[500], textColor: C.slate[400] },
  { icon: Search, title: "Auditor", sub: "Read-Only · Cross-Company", desc: "Full read access across all data. Zero write permissions.", color: C.yellow[500], textColor: C.yellow[400] },
  { icon: User, title: "Customer Portal", sub: "Self-Service · Own Data Only", desc: "Track own shipments, raise requests, download invoices, view history.", color: C.indigo[600], textColor: C.indigo[400] },
];

const quickLoginRoles = [
  { username: "superadmin", name: "Rajesh Kumar", role: "SuperAdmin", route: "/admin/dashboard", icon: Crown, color: C.red[600], textColor: C.red[400] },
  { username: "company_admin", name: "Vikram Sharma", role: "CompanyAdmin", route: "/company/dashboard", icon: Building2, color: C.sky[500], textColor: C.sky[400] },
  { username: "ops_manager", name: "Priya Sharma", role: "Manager", route: "/manager/dashboard", icon: Briefcase, color: C.teal[500], textColor: C.teal[400] },
  { username: "dispatch", name: "Amit Patel", role: "Dispatcher", route: "/ops/dashboard", icon: Radio, color: C.amber[600], textColor: C.amber[400] },
  { username: "warehouse", name: "Sunita Reddy", role: "Agent (Warehouse)", route: "/agent/dashboard", icon: Warehouse, color: C.cyan[600], textColor: C.cyan[400] },
  { username: "customs01", name: "Customs Officer", role: "CustomsAgent", route: "/customs/dashboard", icon: ShieldCheck, color: C.red[600], textColor: C.red[400] },
  { username: "customer01", name: "Customer (Guest)", role: "CustomerPortal", route: "/portal/dashboard", icon: User, color: C.indigo[600], textColor: C.indigo[400] },
  { username: "auditor01", name: "Internal Auditor", role: "AuditorReadOnly", route: "/audit/dashboard", icon: Search, color: C.yellow[500], textColor: C.yellow[400] },
];

const rolePasswords: Record<string, string> = {
  superadmin: "admin123",
  company_admin: "admin123",
  ops_manager: "ops123",
  dispatch: "dispatch123",
  warehouse: "warehouse123",
  customs01: "customs123",
  customer01: "cust123",
  auditor01: "audit123",
};

export default function LandingPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<number>>(new Set());
  const [loginUsername, setLoginUsername] = useState("superadmin");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginResult, setLoginResult] = useState<{ success: boolean; route?: string } | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", company: "", email: "", phone: "", need: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleSignIn = async () => {
    setLoginLoading(true);
    setLoginResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    if (rolePasswords[loginUsername] === loginPassword) {
      setLoginResult({ success: true, route: "/dashboard" });
      router.push("/login");
    } else {
      setLoginResult({ success: false });
    }
    setLoginLoading(false);
  };

  const handleQuickLogin = (username: string) => {
    setLoginUsername(username);
    setLoginPassword(rolePasswords[username] || "password");
    setShowPassword(false);
    setLoginResult(null);
  };

  const toggleModule = (index: number) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setContactForm({ name: "", company: "", email: "", phone: "", need: "", message: "" });
    setTimeout(() => setContactSubmitted(false), 3000);
  };

  const handleSpotlight = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    (e.currentTarget as HTMLElement).style.setProperty("--gx", `${e.clientX - rect.left}px`);
    (e.currentTarget as HTMLElement).style.setProperty("--gy", `${e.clientY - rect.top}px`);
  };

  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) sectionRefs.current.set(id, el);
  };

  const isVisible = (id: string) => visibleSections.has(id);

  const btnBase: React.CSSProperties = {
    position: "relative",
    overflow: "hidden",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontWeight: 700,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: C.btnShadow,
    letterSpacing: "0.3px",
  };

  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    background: C.btnGradient,
  };

  const btnOutline: React.CSSProperties = {
    ...btnBase,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "none",
  };

  const cardBase: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: "14px",
    border: "1px solid rgba(14,165,233,0.15)",
    transition: "all 0.3s ease",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.25s ease",
  };

  const sectionTransition = (id: string): React.CSSProperties => ({
    opacity: isVisible(id) ? 1 : 0,
    transform: isVisible(id) ? "translateY(0)" : "translateY(32px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  });

  return (
    <div style={{ backgroundColor: C.bgDark, color: "#ffffff", fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all 0.3s ease",
        ...(scrolled ? { backgroundColor: "rgba(12,19,34,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.1)" } : {}),
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "80px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}>
            <div style={{ width: "36px", height: "36px", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Image src="/LogisticsProLogo.png" alt="LogisticsPro" width={36} height={36} style={{ objectFit: "contain" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, color: "#f0f9ff", fontSize: "0.95rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}>LogisticsPro</span>
              <span style={{ fontSize: "0.47rem", color: C.slate500, textTransform: "uppercase", letterSpacing: "0.2em", lineHeight: 1, marginTop: "2px" }}>Connecting Local Resources</span>
            </div>
          </Link>
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: "28px" }}>
            <a href="#features" style={{ fontSize: "13px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>Features</a>
            <a href="#lifecycle" style={{ fontSize: "13px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>Lifecycle</a>
            <a href="#transport" style={{ fontSize: "13px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>Transport</a>
            <a href="#roles" style={{ fontSize: "13px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>Roles</a>
            <a href="#modules" style={{ fontSize: "13px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>Modules</a>
            <a href="#security" style={{ fontSize: "13px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>Security</a>
            <a href="#login-preview" style={{ fontSize: "13px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>App Preview</a>
            <Link href="/login" className="spotlight-btn" style={{ ...btnPrimary, padding: "10px 20px", fontSize: "14px", borderRadius: "8px", textDecoration: "none" }} onMouseMove={handleSpotlight}>
              Get Started
            </Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", color: "#fff", padding: "8px", cursor: "pointer" }} className="lg:hidden">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div style={{ backgroundColor: "rgba(12,19,34,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {["Features", "Lifecycle", "Transport", "Roles", "Modules", "Security", "App Preview"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "14px", color: C.slate400, textDecoration: "none", padding: "8px 0" }} onClick={() => setMobileMenuOpen(false)}>{item}</a>
              ))}
              <Link href="/login" className="spotlight-btn" style={{ ...btnPrimary, padding: "10px 20px", fontSize: "14px", borderRadius: "8px", textDecoration: "none", textAlign: "center" }} onClick={() => setMobileMenuOpen(false)} onMouseMove={handleSpotlight}>
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: "500px", height: "500px", backgroundColor: rgba(C.orbBg, 0.18), borderRadius: "50%", filter: "blur(80px)", top: "-180px", left: "-150px", animation: "float 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "400px", height: "400px", backgroundColor: rgba(C.orbBg2, 0.18), borderRadius: "50%", filter: "blur(80px)", bottom: "-120px", right: "-100px", animation: "float 12s ease-in-out -4s infinite" }} />
        <div style={{ position: "absolute", width: "300px", height: "300px", backgroundColor: rgba(C.orbBg3, 0.18), borderRadius: "50%", filter: "blur(80px)", top: "40%", left: "30%", animation: "float 12s ease-in-out -8s infinite" }} />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(${rgba(C.orbBg, 0.04)} 1px,transparent 1px),linear-gradient(90deg,${rgba(C.orbBg, 0.04)} 1px,transparent 1px)`, backgroundSize: "50px 50px" }} />
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ position: "absolute", width: "3px", height: "3px", borderRadius: "50%", backgroundColor: C.particle, pointerEvents: "none", zIndex: 0, left: `${8 + i * 8}%`, animation: `rise 8s linear infinite`, animationDelay: `${i * 0.7}s`, animationDuration: `${6 + (i % 4) * 2}s`, opacity: 0.4 + (i % 3) * 0.15, transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1)" }} />
        ))}
        <div style={{ position: "relative", maxWidth: "1280px", margin: "0 auto", padding: "96px 24px 64px", width: "100%", zIndex: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "64px", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              <div className="slide-up" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.sky[600], 0.1), border: `1px solid ${rgba(C.sky[600], 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <span style={{ width: "8px", height: "8px", backgroundColor: C.sky[400], borderRadius: "50%", animation: "pulse 2s ease-in-out infinite" }} />
                Logistics Platform v4.2.1
              </div>
              <h1 className="slide-up" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.75rem)", lineHeight: 1.1, letterSpacing: "-0.025em", color: "#ffffff" }}>
                Your Own<br />
                <span style={{ background: "linear-gradient(135deg, #60a5fa, #3b82f6, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Logistics App</span><br />
                Built For You
              </h1>
              <p className="slide-up" style={{ fontSize: "18px", color: C.slate400, lineHeight: 1.75, maxWidth: "512px" }}>
                Streamline your logistics operations with real-time tracking, intelligent fleet management, and comprehensive analytics — all in one place.
              </p>
              <div className="slide-up" style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                <Link href="/login" className="spotlight-btn" style={{ ...btnPrimary, padding: "16px 32px", fontSize: "14px", borderRadius: "12px", textDecoration: "none" }} onMouseMove={handleSpotlight}>
                  Start Customizing
                </Link>
                <a href="#login-preview" style={{ ...btnOutline, padding: "16px 32px", fontSize: "14px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                  <Play size={16} />
                  Live Preview
                </a>
              </div>
              <div className="slide-up" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", paddingTop: "16px" }}>
                {stats.map(({ icon: Icon, value, label, color }) => (
                  <div key={label} style={{ textAlign: "center", padding: "12px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", cursor: "default", transition: "all 0.3s" }}>
                    <Icon style={{ color, width: "18px", height: "18px", marginBottom: "4px", display: "block", margin: "0 auto 4px" }} />
                    <div style={{ fontSize: "20px", fontWeight: 700, color }}>{value}</div>
                    <div style={{ fontSize: "11px", color: C.slate500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Hero Login Card */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: "448px" }}>
                <div style={{ backgroundColor: C.cardBg, backdropFilter: "blur(20px)", borderRadius: "24px", border: `1px solid ${rgba(C.orbBg, 0.2)}`, overflow: "hidden", boxShadow: "0 0 60px rgba(6,182,212,0.08), 0 30px 60px rgba(0,0,0,0.5)" }}>
                  <div style={{ padding: "32px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                      <div style={{ width: "50px", height: "50px", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Image src="/LogisticsProLogo.png" alt="LogisticsPro" width={50} height={50} style={{ objectFit: "contain" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#f0f9ff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>LogisticsPro</span>
                        <span style={{ fontSize: "0.52rem", color: C.slate500, textTransform: "uppercase", letterSpacing: "0.2em", lineHeight: 1, marginTop: "3px" }}>Connecting Local Resources</span>
                      </div>
                    </div>
                    <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "24px", marginBottom: "4px", color: "#ffffff" }}>Welcome back</h2>
                    <p style={{ fontSize: "14px", color: C.slate400 }}>Sign in to your account to continue</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    {stats.map(({ value, label, color }) => (
                      <div key={label} style={{ padding: "12px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color }}>{value}</div>
                        <div style={{ fontSize: "9px", color: C.slate500, textTransform: "uppercase" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</label>
                      <input type="text" value="superadmin" readOnly style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
                      <div style={{ position: "relative" }}>
                        <input type="password" value="admin123" readOnly style={inputStyle} />
                        <Link href="/login" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: C.slate400, display: "flex" }}>
                          <Eye size={16} />
                        </Link>
                      </div>
                    </div>
                    <Link href="/login" className="spotlight-btn" style={{ ...btnPrimary, width: "100%", padding: "12px", fontSize: "14px", borderRadius: "8px", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onMouseMove={handleSpotlight}>
                      Sign In <Zap size={14} />
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", paddingTop: "4px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.trustDot, animation: "pulse 2s ease-in-out infinite" }} />
                      <span style={{ fontSize: "10px", color: C.slate[600] }}>All systems operational · v4.2.1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={setSectionRef("features")} style={{ position: "relative", padding: "96px 0", overflow: "hidden", ...sectionTransition("features") }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.sky[600], 0.1), border: `1px solid ${rgba(C.sky[600], 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Core Features</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>Everything Your Logistics Needs</h2>
            <p style={{ color: C.slate400, maxWidth: "672px", margin: "0 auto" }}>A complete suite of tools designed for modern logistics operations. Each feature is modular — use what you need, customize the rest.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {features.map(({ icon: Icon, title, desc, color, textColor }) => (
              <div key={title} style={{ ...cardBase, padding: "24px", position: "relative", overflow: "hidden" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = rgba(color, 0.4); }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: "128px", height: "128px", backgroundColor: rgba(color, 0.05), borderRadius: "50%", transform: "translate(50%, -50%)" }} />
                <div style={{ position: "relative" }}>
                  <div style={{ width: "48px", height: "48px", backgroundColor: rgba(color, 0.1), borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", transition: "background-color 0.3s" }}>
                    <Icon style={{ color: textColor, width: "24px", height: "24px" }} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "18px", marginBottom: "8px", color: "#ffffff" }}>{title}</h3>
                  <p style={{ fontSize: "14px", color: C.slate400, lineHeight: 1.625 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipment Lifecycle */}
      <section id="lifecycle" ref={setSectionRef("lifecycle")} style={{ position: "relative", padding: "96px 0", overflow: "hidden", backgroundColor: "rgba(10,15,28,0.5)", ...sectionTransition("lifecycle") }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "relative", maxWidth: "1280px", margin: "0 auto", padding: "0 24px", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.sky[600], 0.1), border: `1px solid ${rgba(C.sky[600], 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Shipment Lifecycle</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>From Booking to Closure</h2>
            <p style={{ color: C.slate400, maxWidth: "672px", margin: "0 auto" }}>Every shipment passes through 9 defined stages. Sidebar menus and documents adapt automatically.</p>
          </div>
          <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "16px", scrollbarWidth: "none" }}>
            {lifecycleSteps.map((step, i) => (
              <div key={step.title} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <div style={{ ...cardBase, flexShrink: 0, width: "176px", padding: "16px", textAlign: "center" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = rgba(step.color, 0.4); }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                  <step.icon style={{ color: step.textColor, width: "32px", height: "32px", marginBottom: "12px", display: "block", margin: "0 auto 12px" }} />
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", marginBottom: "4px", color: "#ffffff" }}>{step.title}</h4>
                  <p style={{ fontSize: "10px", color: C.slate500, marginBottom: "8px" }}>{step.roles}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
                    {step.docs.map((d) => (
                      <span key={d} style={badgeStyle(step.textColor)}>{d}</span>
                    ))}
                  </div>
                </div>
                {i < lifecycleSteps.length - 1 && (
                  <div style={{ display: "none", alignItems: "center", color: rgba(C.sky[400], 0.3) }} className="lifecycle-connector">
                    <ChevronDown style={{ transform: "rotate(-90deg)" }} size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transport */}
      <section id="transport" ref={setSectionRef("transport")} style={{ padding: "96px 0", ...sectionTransition("transport") }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.sky[600], 0.1), border: `1px solid ${rgba(C.sky[600], 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Multi-Modal</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>Every Transport Mode, One Platform</h2>
            <p style={{ color: C.slate400, maxWidth: "672px", margin: "0 auto" }}>Document requirements and tracking fields adapt automatically based on transport mode.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
            {transportModes.map(({ icon: Icon, title, fields, tracking, docs, color, textColor }) => (
              <div key={title} style={{ ...cardBase, padding: "24px" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = rgba(color, 0.4); }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "40px", height: "40px", backgroundColor: rgba(color, 0.1), borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon style={{ color: textColor, width: "20px", height: "20px" }} />
                  </div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, color: "#ffffff" }}>{title}</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: C.slate400 }}>
                  <div style={{ display: "flex", justifyContent: "between" }}><span>Key Fields</span><span style={{ color: C.slate300, marginLeft: "auto" }}>{fields}</span></div>
                  <div style={{ display: "flex", justifyContent: "between" }}><span>Tracking</span><span style={{ color: C.sky[400], marginLeft: "auto" }}>{tracking}</span></div>
                  <div style={{ display: "flex", justifyContent: "between" }}><span>Documents</span><span style={{ color: C.slate300, marginLeft: "auto" }}>{docs}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blueprint */}
      <section id="blueprint" ref={setSectionRef("blueprint")} style={{ position: "relative", padding: "96px 0", overflow: "hidden", backgroundColor: "rgba(10,15,28,0.5)", ...sectionTransition("blueprint") }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "relative", maxWidth: "1280px", margin: "0 auto", padding: "0 24px", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.sky[600], 0.1), border: `1px solid ${rgba(C.sky[600], 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>App Blueprint</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>Architecture & Flow</h2>
          </div>
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", padding: "48px", position: "relative", overflow: "hidden", boxShadow: "0 0 40px rgba(59,130,246,0.15)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px", marginBottom: "40px" }}>
              {[
                { icon: Zap, title: "Input Layer", desc: "Orders, bookings, API webhooks", color: C.sky[600], textColor: C.sky[400] },
                { icon: Cpu, title: "Processing Engine", desc: "Route optimization, auto-assignment", color: C.purple[600], textColor: C.purple[400] },
                { icon: Play, title: "Execution Layer", desc: "Dispatch, tracking, driver app", color: C.green[600], textColor: C.green[400] },
                { icon: BarChart3, title: "Analytics & Output", desc: "Reports, dashboards, invoices", color: C.amber[600], textColor: C.amber[400] },
              ].map(({ icon: Icon, title, desc, color, textColor }) => (
                <div key={title} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(255,255,255,0.1)", transition: "border-color 0.3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = rgba(color, 0.4))}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
                  <div style={{ width: "40px", height: "40px", backgroundColor: rgba(color, 0.1), borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                    <Icon style={{ color: textColor, width: "20px", height: "20px" }} />
                  </div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", marginBottom: "4px", color: "#ffffff" }}>{title}</h4>
                  <p style={{ fontSize: "12px", color: C.slate500 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "40px" }}>
              <div style={{ padding: "20px 32px", backgroundColor: rgba(C.sky[600], 0.1), border: `2px solid ${rgba(C.sky[600], 0.3)}`, borderRadius: "16px", textAlign: "center", position: "relative", boxShadow: "0 0 60px rgba(59,130,246,0.25)" }}>
                <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", padding: "2px 12px", backgroundColor: C.sky[600], fontSize: "10px", color: "#fff", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderRadius: "9999px" }}>Central Hub</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
                  <div style={{ width: "42px", height: "42px", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Image src="/LogisticsProLogo.png" alt="LogisticsPro" width={42} height={42} style={{ objectFit: "contain" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "0.95rem", color: "#f0f9ff", lineHeight: 1.1 }}>LogisticsPro</span>
                    <span style={{ fontSize: "0.47rem", color: C.slate500, textTransform: "uppercase", letterSpacing: "0.2em", marginTop: "2px" }}>Core Engine</span>
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: C.slate500, marginTop: "4px" }}>Unified data layer · Real-time sync · API gateway</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "16px" }}>
              {[
                { icon: Smartphone, title: "Driver App" },
                { icon: Monitor, title: "Admin Panel" },
                { icon: Globe, title: "Client Portal" },
                { icon: Plug, title: "API / Webhooks" },
                { icon: MapPin, title: "GPS Tracking" },
              ].map(({ icon: Icon, title }) => (
                <div key={title} style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.1)", textAlign: "center", transition: "border-color 0.3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = rgba(C.sky[600], 0.3))}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
                  <Icon style={{ color: C.slate400, width: "24px", height: "24px", marginBottom: "8px", display: "block", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "12px", fontWeight: 500 }}>{title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" ref={setSectionRef("roles")} style={{ position: "relative", padding: "96px 0", overflow: "hidden", backgroundColor: "rgba(10,15,28,0.5)", ...sectionTransition("roles") }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "relative", maxWidth: "1280px", margin: "0 auto", padding: "0 24px", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.sky[600], 0.1), border: `1px solid ${rgba(C.sky[600], 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>14 User Roles</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>Complete Role Ecosystem</h2>
            <p style={{ color: C.slate400, maxWidth: "672px", margin: "0 auto" }}>From platform administrators to customers — every user gets a tailored dashboard with scoped access.</p>
          </div>

          {/* Platform & Administration */}
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: C.sky[400], marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><ShieldCheck size={16} />Platform & Administration</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {roles.slice(0, 2).map(({ icon: Icon, title, sub, desc, color, textColor }) => (
                <div key={title} style={{ ...cardBase, padding: "20px", position: "relative", overflow: "hidden" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = rgba(color, 0.4); }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${color}, ${textColor})`, borderRadius: "3px 3px 0 0", opacity: 0, transition: "opacity 0.3s" }} className="role-top-bar" />
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ width: "40px", height: "40px", backgroundColor: rgba(color, 0.1), borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon style={{ color: textColor, width: "18px", height: "18px" }} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", color: "#ffffff" }}>{title}</h4>
                      <span style={{ fontSize: "10px", color: textColor }}>{sub}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: C.slate400 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Operations Core */}
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: C.green[400], marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Briefcase size={16} />Operations Core</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {roles.slice(2, 5).map(({ icon: Icon, title, sub, desc, color, textColor }) => (
                <div key={title} style={{ ...cardBase, padding: "20px", position: "relative", overflow: "hidden" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = rgba(color, 0.4); }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ width: "36px", height: "36px", backgroundColor: rgba(color, 0.1), borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon style={{ color: textColor, width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", color: "#ffffff" }}>{title}</h4>
                      <span style={{ fontSize: "10px", color: textColor }}>{sub}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: C.slate400 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specialized Agents */}
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: C.purple[400], marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Settings2 size={16} />Specialized Agents</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
              {roles.slice(5, 10).map(({ icon: Icon, title, sub, desc, color, textColor }) => (
                <div key={title} style={{ ...cardBase, padding: "16px", textAlign: "center", position: "relative", overflow: "hidden" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = rgba(color, 0.4); }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                  <div style={{ width: "40px", height: "40px", backgroundColor: rgba(color, 0.1), borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                    <Icon style={{ color: textColor, width: "18px", height: "18px" }} />
                  </div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", color: "#ffffff" }}>{title}</h4>
                  <p style={{ fontSize: "10px", color: C.slate500, marginTop: "4px" }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: C.slate400, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}><Layers size={16} />Support, Oversight & Self-Service</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {roles.slice(10).map(({ icon: Icon, title, sub, desc, color, textColor }) => (
                <div key={title} style={{ ...cardBase, padding: "20px", position: "relative", overflow: "hidden" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = rgba(color, 0.4); }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <div style={{ width: "36px", height: "36px", backgroundColor: rgba(color, 0.1), borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon style={{ color: textColor, width: "16px", height: "16px" }} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", color: "#ffffff" }}>{title}</h4>
                      <span style={{ fontSize: "10px", color: textColor }}>{sub}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "12px", color: C.slate400 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" ref={setSectionRef("modules")} style={{ position: "relative", padding: "96px 0", backgroundColor: "rgba(10,15,28,0.5)", ...sectionTransition("modules") }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "relative", maxWidth: "1280px", margin: "0 auto", padding: "0 24px", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.sky[600], 0.1), border: `1px solid ${rgba(C.sky[600], 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Modular System</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>Pick Your Modules</h2>
            <p style={{ color: C.slate400, maxWidth: "672px", margin: "0 auto" }}>Select the modules your business requires.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {modules.map(({ icon: Icon, title, desc, color, textColor }, i) => {
              const isSelected = selectedModules.has(i);
              return (
                <div key={title} onClick={() => toggleModule(i)} style={{ ...cardBase, padding: "20px", cursor: "pointer", borderColor: isSelected ? rgba(C.sky[600], 0.5) : "rgba(255,255,255,0.1)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = isSelected ? rgba(C.sky[600], 0.5) : rgba(color, 0.4); }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = isSelected ? rgba(C.sky[600], 0.5) : "rgba(255,255,255,0.1)"; }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ width: "40px", height: "40px", backgroundColor: rgba(color, 0.1), borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.3s" }}>
                      <Icon style={{ color: textColor, width: "20px", height: "20px" }} />
                    </div>
                    <div style={{ width: "20px", height: "20px", borderRadius: "6px", border: `2px solid ${isSelected ? C.sky[500] : "rgba(255,255,255,0.2)"}`, backgroundColor: isSelected ? C.sky[600] : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                      {isSelected && <Check size={12} style={{ color: "#fff" }} />}
                    </div>
                  </div>
                  <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", marginBottom: "4px", color: "#ffffff" }}>{title}</h4>
                  <p style={{ fontSize: "12px", color: C.slate500, lineHeight: 1.5 }}>{desc}</p>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "12px 24px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span style={{ fontSize: "14px", color: C.slate400 }}>Selected:</span>
              <span style={{ fontSize: "18px", fontWeight: 700, color: C.sky[400] }}>{selectedModules.size}</span>
              <span style={{ fontSize: "14px", color: C.slate400 }}>/ 8</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" ref={setSectionRef("security")} style={{ padding: "96px 0", ...sectionTransition("security") }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.sky[600], 0.1), border: `1px solid ${rgba(C.sky[600], 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Enterprise Grade</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>Security, Tenancy & Compliance</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "24px" }}>
            {[
              { icon: Building, title: "Multi-Tenancy", desc: "Company-scoped data isolation. Each company sees only their own data.", color: C.sky[600], textColor: C.sky[400] },
              { icon: KeyRound, title: "Strict RBAC", desc: "14 roles with granular permissions. Role-to-dashboard mapping.", color: C.purple[600], textColor: C.purple[400] },
              { icon: FileSearch, title: "Audit Trails", desc: "Complete audit, access, and error logs for every action.", color: C.amber[600], textColor: C.amber[400] },
              { icon: ShieldCheck, title: "Compliance", desc: "Customs, DG rules, country restrictions, HS code library.", color: C.green[600], textColor: C.green[400] },
            ].map(({ icon: Icon, title, desc, color, textColor }) => (
              <div key={title} style={{ ...cardBase, padding: "24px", textAlign: "center" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.borderColor = rgba(color, 0.4); }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                <div style={{ width: "56px", height: "56px", backgroundColor: rgba(color, 0.1), borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Icon style={{ color: textColor, width: "28px", height: "28px" }} />
                </div>
                <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, marginBottom: "8px", color: "#ffffff" }}>{title}</h4>
                <p style={{ fontSize: "12px", color: C.slate400 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Preview */}
      <section id="login-preview" ref={setSectionRef("login-preview")} style={{ position: "relative", padding: "96px 0", overflow: "hidden", backgroundColor: "rgba(10,15,28,0.5)", ...sectionTransition("login-preview") }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "relative", maxWidth: "1280px", margin: "0 auto", padding: "0 24px", zIndex: 10 }}>
          <div className="text-center mb-16" style={{ textAlign: "center", marginBottom: "64px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.orbBg, 0.1), border: `1px solid ${rgba(C.orbBg, 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Live Preview</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>Interactive Login</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "32px", alignItems: "start" }}>
            <div style={{ gridColumn: "span 2 / span 2" }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", color: "#ffffff" }}><Zap size={16} style={{ color: C.amber[400] }} />Quick Login</h4>
                </div>
                <div style={{ maxHeight: "480px", overflowY: "auto", scrollbarWidth: "none" }}>
                  {quickLoginRoles.map(({ username, name, role, icon: Icon, color, textColor }) => (
                    <button key={username} onClick={() => handleQuickLogin(username)} style={{ width: "100%", padding: "12px 20px", display: "flex", alignItems: "center", gap: "12px", background: "none", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", textAlign: "left", transition: "background-color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                      <div style={{ width: "32px", height: "32px", backgroundColor: rgba(color, 0.1), borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon style={{ color: textColor, width: "14px", height: "14px" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 500 }}>{name}</div>
                        <div style={{ fontSize: "11px", color: C.slate500 }}>{role} · /{username.split("_")[0]}/</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ gridColumn: "span 3 / span 3", display: "flex", justifyContent: "center" }}>
              <div style={{ width: "100%", maxWidth: "448px" }}>
                <div style={{ backgroundColor: C.cardBg, backdropFilter: "blur(20px)", borderRadius: "24px", border: `1px solid ${rgba(C.orbBg, 0.2)}`, overflow: "hidden", transition: "all 0.5s", boxShadow: loginResult?.success ? "0 0 60px rgba(34,197,94,0.2)" : "0 0 60px rgba(6,182,212,0.08), 0 30px 60px rgba(0,0,0,0.5)" }}>
                  <div style={{ padding: "32px 32px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                      <div style={{ width: "50px", height: "50px", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Image src="/LogisticsProLogo.png" alt="LogisticsPro" width={50} height={50} style={{ objectFit: "contain" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#f0f9ff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>LogisticsPro</span>
                        <span style={{ fontSize: "0.52rem", color: C.slate500, textTransform: "uppercase", letterSpacing: "0.2em", lineHeight: 1, marginTop: "3px" }}>Connecting Local Resources</span>
                      </div>
                    </div>
                    <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "24px", marginBottom: "4px", color: "#ffffff" }}>Welcome back</h2>
                    <p style={{ fontSize: "14px", color: C.slate400 }}>Sign in to your account to continue</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    {stats.map(({ value, label, color }) => (
                      <div key={label} style={{ padding: "12px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color }}>{value}</div>
                        <div style={{ fontSize: "9px", color: C.slate500, textTransform: "uppercase" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                    {loginResult && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "8px", fontSize: "14px", backgroundColor: loginResult.success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${loginResult.success ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, color: loginResult.success ? C.green[400] : C.red[400] }}>
                        {loginResult.success ? <CheckCircle size={16} /> : <X size={16} />}
                        <div>
                          <div style={{ fontWeight: 600 }}>{loginResult.success ? "Login Successful!" : "Invalid Credentials"}</div>
                          {loginResult.success && <div style={{ fontSize: "12px", color: C.slate400, marginTop: "2px" }}>Redirecting to login page...</div>}
                        </div>
                      </div>
                    )}
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Username</label>
                      <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
                      <div style={{ position: "relative" }}>
                        <input type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} style={inputStyle} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.slate400, cursor: "pointer", display: "flex", padding: "4px" }}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button onClick={handleSignIn} disabled={loginLoading} className="spotlight-btn" style={{ ...btnPrimary, width: "100%", padding: "14px", fontSize: "14px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loginLoading ? 0.7 : 1, cursor: loginLoading ? "not-allowed" : "pointer" }} onMouseMove={handleSpotlight}>
                      {loginLoading ? (
                        <>Signing in<span style={{ display: "inline-flex", gap: "3px", marginLeft: "4px" }}><span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)", animation: "bounce 1s infinite" }} /><span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)", animation: "bounce 1s infinite 0.15s" }} /><span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)", animation: "bounce 1s infinite 0.3s" }} /></span></>
                      ) : (
                        <>Sign In <Zap size={14} /></>
                      )}
                    </button>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", paddingTop: "4px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.trustDot, animation: "pulse 2s ease-in-out infinite" }} />
                      <span style={{ fontSize: "10px", color: C.slate[600] }}>All systems operational · v4.2.1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" ref={setSectionRef("contact")} style={{ position: "relative", padding: "96px 0", overflow: "hidden", ...sectionTransition("contact") }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "relative", maxWidth: "896px", margin: "0 auto", padding: "0 24px", zIndex: 10 }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", backgroundColor: rgba(C.sky[600], 0.1), border: `1px solid ${rgba(C.sky[600], 0.2)}`, borderRadius: "9999px", color: C.sky[400], fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Get Started</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", letterSpacing: "-0.025em", marginBottom: "16px", color: "#ffffff" }}>Ready to Build Your Logistics Platform?</h2>
          </div>
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.1)", padding: "40px", boxShadow: "0 0 40px rgba(59,130,246,0.15)" }}>
            <form onSubmit={handleContactSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Full Name</label>
                  <input type="text" required value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Your name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Company</label>
                  <input type="text" required value={contactForm.company} onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })} placeholder="Company name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
                  <input type="email" required value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="you@company.com" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Phone</label>
                  <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>What do you need?</label>
                <select value={contactForm.need} onChange={(e) => setContactForm({ ...contactForm, need: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Select an option</option>
                  <option>Use LogisticsPro as-is</option>
                  <option>Custom app with selected modules</option>
                  <option>White-label solution</option>
                  <option>Need custom modules built</option>
                  <option>Just want a demo first</option>
                </select>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: C.slate400, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Message</label>
                <textarea rows={4} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} placeholder="Tell us about your logistics needs..." style={{ ...inputStyle, resize: "none" }} />
              </div>
              <button type="submit" className="spotlight-btn" style={{ ...btnPrimary, width: "100%", padding: "16px", fontSize: "14px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} onMouseMove={handleSpotlight}>
                <Send size={16} />
                {contactSubmitted ? "Thank You!" : "Send Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "48px 0" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "32px", marginBottom: "40px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", backgroundColor: "#ffffff", borderRadius: "8px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image src="/LogisticsProLogo.png" alt="LogisticsPro" width={36} height={36} style={{ objectFit: "contain" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "0.82rem", color: "#f0f9ff", lineHeight: 1.1 }}>LogisticsPro</span>
                  <span style={{ fontSize: "0.42rem", color: C.slate500, textTransform: "uppercase", letterSpacing: "0.2em", marginTop: "2px" }}>Connecting Local Resources</span>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: C.slate500, lineHeight: 1.625 }}>Complete logistics platform with 14 roles, multi-modal transport, and enterprise security.</p>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>Platform</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {["Features", "Lifecycle", "Transport", "Roles"].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} style={{ fontSize: "12px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>Solutions</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {["Standard Platform", "Custom Build", "White-Label", "Enterprise"].map((item) => (
                  <a key={item} href="#contact" style={{ fontSize: "12px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>{item}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "14px", marginBottom: "16px" }}>Contact</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="mailto:hello@logisticspro.io" style={{ fontSize: "12px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>hello@logisticspro.io</a>
                <a href="tel:+919876543210" style={{ fontSize: "12px", color: C.slate400, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = C.slate400)}>+91 98765 43210</a>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: "32px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <p style={{ fontSize: "12px", color: C.slate600 }}>© 2026 LogisticsPro. All rights reserved.</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.trustDot }} />
              <p style={{ fontSize: "12px", color: C.slate[600] }}>v4.2.1 · All systems operational</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS */}
      <style jsx global>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-30px) translateX(10px); opacity: 0.7; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes bounce {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-4px); }
        }
        .spotlight-btn {
          position: relative;
          overflow: hidden;
        }
        .spotlight-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle 120px at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,.18), transparent 60%);
          pointer-events: none;
          z-index: 1;
        }
        .spotlight-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(37,99,235,0.45) !important;
        }
        .spotlight-btn:active {
          transform: translateY(1px);
        }
        .gradient-text {
          background: linear-gradient(135deg, #60a5fa, #3b82f6, #2563eb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        html {
          scroll-behavior: smooth;
        }
        input::placeholder, textarea::placeholder, select::placeholder {
          color: #475569;
        }
        select option {
          background-color: #0c1322;
          color: #ffffff;
        }
        @media (max-width: 1024px) {
          .lg\\:flex { display: none !important; }
          .lg\\:hidden { display: block !important; }
        }
        @media (max-width: 768px) {
          section > div > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
