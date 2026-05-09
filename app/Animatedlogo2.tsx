"use client";

import { useRef } from "react";

export default function AnimatedLogo() {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <>
      <style>{`
        @keyframes drawArrow {
          from {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          to {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes haloPulse {
          0% {
            opacity: 0.08;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.22;
            transform: scale(1.04);
          }
          100% {
            opacity: 0.08;
            transform: scale(0.96);
          }
        }

        @keyframes orbitSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbitDotPulse {
          0%,100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.45;
            transform: scale(0.75);
          }
        }

        @keyframes fillFade {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmerSweep {
          0% {
            transform: translateX(-90px) skewX(-18deg);
            opacity: 0;
          }

          15% {
            opacity: 0.35;
          }

          45% {
            transform: translateX(90px) skewX(-18deg);
            opacity: 0;
          }

          100% {
            transform: translateX(90px) skewX(-18deg);
            opacity: 0;
          }
        }

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

        .lp-arrow-1,
        .lp-arrow-2,
        .lp-arrow-3 {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
        }

        .lp-arrow-1 {
          animation: drawArrow .7s cubic-bezier(0.4,0,0.2,1) .4s forwards;
        }

        .lp-arrow-2 {
          animation: drawArrow .7s cubic-bezier(0.4,0,0.2,1) .6s forwards;
        }

        .lp-arrow-3 {
          animation: drawArrow .6s cubic-bezier(0.4,0,0.2,1) .8s forwards;
        }

        .lp-halo {
          transform-origin: center;
          animation: haloPulse 3.5s ease-in-out infinite;
        }

        .lp-orbit-group {
          transform-origin: 50px 50px;
          animation: orbitSpin 7s linear infinite;
        }

        .lp-orbit-dot {
          transform-origin: center;
          animation: orbitDotPulse 2.5s ease-in-out infinite;
        }

        .lp-fill {
          animation: fillFade .5s ease .2s both;
        }

        .lp-shimmer {
          animation: shimmerSweep 3s ease-in-out 1.2s infinite;
        }

        .lp-spark-1 {
          --sx: -10px;
          --sy: -12px;
          animation: sparkOut .6s ease-out .9s both;
        }

        .lp-spark-2 {
          --sx: 12px;
          --sy: -8px;
          animation: sparkOut .6s ease-out 1s both;
        }

        .lp-spark-3 {
          --sx: -6px;
          --sy: 14px;
          animation: sparkOut .6s ease-out 1.05s both;
        }
      `}</style>

      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: 42,
          height: 42,
          overflow: "visible",
          flexShrink: 0,
        }}
        aria-label="LogisticsPro"
      >
        {/* <defs>
          <linearGradient
            id="lpBlueGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <linearGradient
            id="lpShimmer"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          <clipPath id="lpIconClip">
            <circle cx="50" cy="50" r="40" />
          </clipPath>
        </defs> */}

        {/* Halo */}
        <circle
          className="lp-halo"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#2563EB"
          strokeWidth="1.4"
        />

        {/* Orbit Ring */}
        <g className="lp-orbit-group">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="1"
            strokeDasharray="6 10"
            opacity="0.45"
          />

          <circle
            className="lp-orbit-dot"
            cx="50"
            cy="2"
            r="3.2"
            fill="#38BDF8"
          />
        </g>

        {/* Main Circle */}
        <circle
          className="lp-fill"
          cx="50"
          cy="50"
          r="40"
          fill="url(#lpBlueGradient)"
        />

        {/* Shimmer */}
        <rect
          className="lp-shimmer"
          x="10"
          y="8"
          width="26"
          height="84"
          fill="url(#lpShimmer)"
          clipPath="url(#lpIconClip)"
        />

        {/* Arrows */}
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
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
        />

        {/* Sparks */}
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
      </svg>
    </>
  );
}