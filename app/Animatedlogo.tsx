"use client";

import { useRef } from "react";

export default function AnimatedLogo() {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <>
      <style>{`
        /* ── Icon outer hexagon stroke draw-on ── */
        @keyframes drawHex {
          from { stroke-dashoffset: 520; opacity: 0.3; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }

        /* ── Inner chevron/arrow paths draw-on ── */
        @keyframes drawArrow {
          from { stroke-dashoffset: 200; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }

        /* ── Glowing halo pulse ── */
        @keyframes haloPulse {
          0%   { opacity: 0.12; r: 38px; }
          50%  { opacity: 0.28; r: 46px; }
          100% { opacity: 0.12; r: 38px; }
        }

        /* ── Rotating orbit ring ── */
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Orbit dot pulse ── */
        @keyframes orbitDotPulse {
          0%, 100% { opacity: 1; r: 3.5px; }
          50%      { opacity: 0.5; r: 2px; }
        }

        /* ── Icon fill flicker-in ── */
        @keyframes fillFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Shimmer sweep across icon ── */
        @keyframes shimmerSweep {
          0%   {
            transform: translateX(-80px) skewX(-15deg);
            opacity: 0;
          }
          10% {
            opacity: 0.45;
          }
          50%  {
            transform: translateX(80px) skewX(-15deg);
            opacity: 0;
          }
          100% {
            transform: translateX(80px) skewX(-15deg);
            opacity: 0;
          }
        }

        /* ── Text slide up + fade ── */
        @keyframes textRise {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ── Tagline letter shimmer ── */
        @keyframes taglineGlow {
          0%,100% { opacity: 0.75; }
          50%     { opacity: 1; }
        }

        /* ── Spark burst ── */
        @keyframes sparkOut {
          0% {
            transform: translate(0,0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--sx), var(--sy)) scale(0);
            opacity: 0;
          }
        }

        /* ── Animation classes ── */
        .lp-hex-stroke {
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
          animation: drawHex 1.1s cubic-bezier(0.4,0,0.2,1) 0.1s forwards;
        }

        .lp-arrow-1 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawArrow 0.7s cubic-bezier(0.4,0,0.2,1) 0.8s forwards;
        }

        .lp-arrow-2 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawArrow 0.7s cubic-bezier(0.4,0,0.2,1) 1s forwards;
        }

        .lp-arrow-3 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: drawArrow 0.6s cubic-bezier(0.4,0,0.2,1) 1.15s forwards;
        }

        .lp-halo {
          animation: haloPulse 3s ease-in-out 1.4s infinite;
        }

        .lp-orbit-group {
          transform-origin: 50px 50px;
          animation: orbitSpin 5s linear 1.2s infinite;
        }

        .lp-orbit-dot {
          animation: orbitDotPulse 2.5s ease-in-out infinite;
        }

        .lp-fill {
          animation: fillFade 0.5s ease 0.6s both;
        }

        .lp-shimmer {
          animation: shimmerSweep 2.8s ease-in-out 1.6s infinite;
        }

        .lp-title {
          animation: textRise 0.7s cubic-bezier(0.4,0,0.2,1) 1.1s both;
        }

        .lp-tagline {
          animation:
            textRise 0.7s cubic-bezier(0.4,0,0.2,1) 1.35s both,
            taglineGlow 3s ease-in-out 2.2s infinite;
        }

        .lp-spark-1 {
          --sx: -10px;
          --sy: -12px;
          animation: sparkOut 0.6s ease-out 1.3s both;
        }

        .lp-spark-2 {
          --sx: 12px;
          --sy: -8px;
          animation: sparkOut 0.6s ease-out 1.4s both;
        }

        .lp-spark-3 {
          --sx: -6px;
          --sy: 14px;
          animation: sparkOut 0.6s ease-out 1.45s both;
        }
      `}</style>

      <svg
        ref={svgRef}
        viewBox="0 0 340 110"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: 300,
          height: 90,
          overflow: "visible",
        }}
        aria-label="LogisticsPro"
      >
        {/* <defs>
          <linearGradient id="lpBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <linearGradient id="lpShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <clipPath id="lpIconClip">
            <circle cx="50" cy="50" r="40" />
          </clipPath>
        </defs> */}

        {/* ── Halo ── */}
        <circle
          className="lp-halo"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#2563EB"
          strokeWidth="1.5"
          opacity="0"
        />

        {/* ── Orbit Ring ── */}
        <g className="lp-orbit-group">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="1"
            strokeDasharray="6 10"
            opacity="0.4"
          />

          <circle
            className="lp-orbit-dot"
            cx="50"
            cy="2"
            r="3.5"
            fill="#38BDF8"
          />
        </g>

        {/* ── Main Logo Circle ── */}
        <circle
          className="lp-fill"
          cx="50"
          cy="50"
          r="40"
          fill="url(#lpBlueGradient)"
          opacity="0"
        />

        {/* ── Shimmer ── */}
        <rect
          className="lp-shimmer"
          x="10"
          y="8"
          width="28"
          height="84"
          fill="url(#lpShimmer)"
          clipPath="url(#lpIconClip)"
        />

        {/* ── Logistics arrows ── */}
        <polyline
          className="lp-arrow-1"
          points="32,38 50,26 68,38"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
        />

        <polyline
          className="lp-arrow-2"
          points="32,50 50,38 68,50"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
        />

        <polyline
          className="lp-arrow-3"
          points="35,62 50,56 65,62"
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
        />

        {/* ── Spark particles ── */}
        <circle
          className="lp-spark-1"
          cx="50"
          cy="50"
          r="3"
          fill="#38BDF8"
          opacity="0"
        />

        <circle
          className="lp-spark-2"
          cx="50"
          cy="50"
          r="3"
          fill="#06B6D4"
          opacity="0"
        />

        <circle
          className="lp-spark-3"
          cx="50"
          cy="50"
          r="2"
          fill="#FFFFFF"
          opacity="0"
        />

        {/* ── Brand Text ── */}
        <text
          className="lp-title"
          x="108"
          y="48"
          fontFamily="'Plus Jakarta Sans', 'Segoe UI', sans-serif"
          fontWeight="800"
          fontSize="30"
          fill="#F0F9FF"
          letterSpacing="-0.5"
          opacity="0"
        >
          Logistics
          <tspan fill="#38BDF8">Pro</tspan>
        </text>

        {/* ── Tagline ── */}
        <text
          className="lp-tagline"
          x="108"
          y="70"
          fontFamily="'Plus Jakarta Sans', 'Segoe UI', sans-serif"
          fontWeight="500"
          fontSize="10"
          fill="#38BDF8"
          letterSpacing="2.5"
          opacity="0"
        >
          SMART SOLUTIONS. RELIABLE DELIVERY.
        </text>

        {/* ── Accent underline ── */}
        <line
          className="lp-title"
          x1="108"
          y1="54"
          x2="320"
          y2="54"
          stroke="#38BDF8"
          strokeWidth="0.8"
          strokeOpacity="0.35"
          opacity="0"
        />
      </svg>
    </>
  );
}