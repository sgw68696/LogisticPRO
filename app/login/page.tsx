"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Truck, AlertCircle, Eye, EyeOff, Package, MapPin, BarChart3, Zap } from 'lucide-react';
import MagneticButton from '@/components/layout/MagneticButton';
import Image from 'next/image';
import AnimatedLogo from '../Animatedlogo';
const demoCredentials = [
  { role: 'Super Admin', username: 'superadmin', password: 'admin123' },
  { role: 'Ops Manager', username: 'ops_manager', password: 'ops123' },
  { role: 'Dispatch', username: 'dispatch', password: 'dispatch123' },
  { role: 'Warehouse', username: 'warehouse', password: 'warehouse123' },
  { role: 'Driver', username: 'driver01', password: 'driver123' },
  { role: 'Finance', username: 'finance', password: 'finance123' },
  { role: 'Support', username: 'support', password: 'support123' },
  { role: 'Customer', username: 'customer01', password: 'cust123' },
];

const stats = [
  { icon: Package, value: '3,600+', label: 'Shipments' },
  { icon: MapPin, value: '94.5%', label: 'On-Time' },
  { icon: Truck, value: '15+', label: 'Vehicles' },
  { icon: BarChart3, value: '22+', label: 'Drivers' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  // Cursor ring refs — outer ring lags behind
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringPos = useRef({ x: 0, y: 0 });
  const ringTarget = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | undefined>(undefined);
  const isHovering = useRef(false);

  // Card tilt
  const cardRef = useRef<HTMLDivElement>(null);

  // Particles
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particleBasePos = useRef<{ x: number; y: number }[]>([]);
  const positionsCaptured = useRef(false);

  // Stat cards
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);

    ringPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    ringTarget.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // RAF — outer ring lags, dot snaps instantly
    const loop = () => {
      ringPos.current.x += (ringTarget.current.x - ringPos.current.x) * 0.1;
      ringPos.current.y += (ringTarget.current.y - ringPos.current.y) * 0.1;

      if (ringRef.current) {
        const size = isHovering.current ? 48 : 32;
        ringRef.current.style.transform =
          `translate(${ringPos.current.x - size / 2}px, ${ringPos.current.y - size / 2}px)`;
        ringRef.current.style.width = `${size}px`;
        ringRef.current.style.height = `${size}px`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      ringTarget.current = { x: e.clientX, y: e.clientY };

      // Snap dot instantly to cursor
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }

      // Check if hovering interactive element
      const target = e.target as HTMLElement;
      isHovering.current = !!(
        target.closest('button') ||
        target.closest('input') ||
        target.closest('a')
      );

      // Card 3D tilt
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const rx = -((e.clientY - cy) / (rect.height / 2)) * 6;
        const ry = ((e.clientX - cx) / (rect.width / 2)) * 6;
        cardRef.current.style.transform =
          `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }

      // Lazy capture particle positions
      if (!positionsCaptured.current) {
        particleRefs.current.forEach((el, i) => {
          if (el) {
            const r = el.getBoundingClientRect();
            particleBasePos.current[i] = {
              x: r.left + r.width / 2,
              y: r.top + r.height / 2,
            };
          }
        });
        positionsCaptured.current = true;
      }

      // Particle repulsion
      particleRefs.current.forEach((el, i) => {
        if (!el || !particleBasePos.current[i]) return;
        const base = particleBasePos.current[i];
        const dx = e.clientX - base.x;
        const dy = e.clientY - base.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          const force = ((110 - dist) / 110) * 28;
          const angle = Math.atan2(dy, dx);
          el.style.transform = `translate(${-Math.cos(angle) * force}px, ${-Math.sin(angle) * force}px)`;
        } else {
          el.style.transform = 'translate(0,0)';
        }
      });

      // Stat cards attract
      statRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const pull = (1 - dist / 100) * 0.22;
          el.style.transform = `translate(${dx * pull}px, ${dy * pull}px) scale(1.05)`;
          el.style.transition = 'transform 0.1s linear';
        } else {
          el.style.transform = 'translate(0,0) scale(1)';
          el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
        }
      });
    };

    const onLeave = () => {
      if (cardRef.current) {
        cardRef.current.style.transform =
          'perspective(900px) rotateX(0deg) rotateY(0deg)';
      }
      particleRefs.current.forEach((el) => {
        if (el) el.style.transform = 'translate(0,0)';
      });
      statRefs.current.forEach((el) => {
        if (el) {
          el.style.transform = 'translate(0,0) scale(1)';
          el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
        }
      });
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const handleBtnMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--gx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--gy', `${e.clientY - rect.top}px`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await login(username, password);
      if (response.success) {
        router.push('/dashboard');
      } else {
        setError(response.error || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Normal cursor rahega — sirf ye dono elements cursor ke around float karenge */}

      {/* Small instant dot — cursor ke bilkul center pe */}
      <div ref={dotRef} className="cursor-dot" />

      {/* Lagging outer glowing ring */}
      <div ref={ringRef} className="cursor-ring" />

      <div className="lp-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />

        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            ref={(el) => { particleRefs.current[i] = el; }}
            className="particle"
            style={{
              left: `${8 + i * 8}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${6 + (i % 4) * 2}s`,
              opacity: 0.4 + (i % 3) * 0.15,
              transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1)',
            }}
          />
        ))}

        <div
          className="lp-inner"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          {/* LEFT PANEL */}
          <div >
            <div className="brand mb-4 flex items-center justify-center">
              {/* <AnimatedLogo /> */}
              <Image src="/LogisticsProLogo.png" alt="Logo" width={220} height={220} className='bg-white bg-opacity-20 rounded-lg' />
            </div>

            <p className="tagline">
              Streamline your logistics operations with real-time tracking,
              intelligent fleet management, and comprehensive analytics — all in one place.
            </p>

            <div className="stats-grid">
              {stats.map(({ icon: Icon, value, label }, i) => (
                <div
                  className="stat-card"
                  key={label}
                  ref={(el) => { statRefs.current[i] = el; }}
                  style={{ animationDelay: `${0.3 + i * 0.1}s`, willChange: 'transform' }}
                >
                  <Icon className="stat-icon" size={18} />
                  <div className="stat-val">{value}</div>
                  <div className="stat-lbl">{label}</div>
                </div>
              ))}
            </div>

            <div className="trust-row justify-center">
              <div className="trust-dot" />
              <span className="trust-text">All systems operational · v4.2.1</span>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div
            ref={cardRef}
            className="lp-card"
            style={{ transition: 'transform 0.12s ease-out' }}
          >
            <div className="card-header">
              <div className="mobile-brand">
                <div className="brand-icon" style={{ width: 40, height: 40, borderRadius: 12 }}>
                  <Truck size={22} color="white" />
                </div>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans'",
                  fontWeight: 800,
                  color: '#f0f9ff',
                  fontSize: '1.2rem',
                }}>
                  LogisticsPro
                </span>
              </div>
              <div className="card-title">Welcome back</div>
              <div className="card-sub">Sign in to your account to continue</div>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-box">
                  <AlertCircle size={16} color="#f87171" />
                  <span>{error}</span>
                </div>
              )}

              <div className="field-group">
                <label className="field-label" htmlFor="username">Username</label>
                <div className="field-wrap">
                  <input
                    id="username"
                    className={`field-input ${username ? 'has-value' : ''}`}
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
                <div className={`field-line ${focusedField === 'username' ? 'active' : ''}`} />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="password">Password</label>
                <div className="field-wrap">
                  <input
                    id="password"
                    className={`field-input ${password ? 'has-value' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className={`field-line ${focusedField === 'password' ? 'active' : ''}`} />
              </div>

              <MagneticButton
                type="submit"
                className="submit-btn spotlight-btn"
                disabled={isLoading}
                onMouseMove={handleBtnMouseMove}
                strength={0.3}
                radius={100}
              >
                {isLoading ? (
                  <>
                    Signing in
                    <span className="loading-dots"><span /><span /><span /></span>
                  </>
                ) : (
                  <>
                    Sign In{' '}
                    <Zap size={15} style={{ display: 'inline', marginLeft: 6, verticalAlign: -2 }} />
                  </>
                )}
              </MagneticButton>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">Demo Accounts</span>
              <div className="divider-line" />
            </div>

            <div className="demo-grid">
              {demoCredentials.map((cred) => (
                <MagneticButton
                  key={cred.username}
                  className="demo-btn spotlight-btn"
                  onClick={() => {
                    setUsername(cred.username);
                    setPassword(cred.password);
                  }}
                  onMouseMove={handleBtnMouseMove}
                  strength={0.35}
                  radius={85}
                >
                  {cred.role}
                </MagneticButton>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}