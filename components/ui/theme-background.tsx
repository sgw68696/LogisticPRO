"use client";

import { ReactNode } from 'react';

interface ThemeBackgroundProps {
  children: ReactNode;
  showOrbs?: boolean;
  showGrid?: boolean;
  showParticles?: boolean;
}

export function ThemeBackground({ 
  children, 
  showOrbs = true, 
  showGrid = true, 
  showParticles = true 
}: ThemeBackgroundProps) {
  return (
    <div className="theme-bg-primary min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      {showOrbs && (
        <>
          <div className="orb orb-1 theme-animate-float" />
          <div className="orb orb-2 theme-animate-float" style={{ animationDelay: '-4s' }} />
          <div className="orb orb-3 theme-animate-float" style={{ animationDelay: '-8s' }} />
        </>
      )}

      {/* Grid overlay */}
      {showGrid && (
        <div className="grid-overlay absolute inset-0 pointer-events-none" />
      )}

      {/* Floating particles */}
      {showParticles && (
        <>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle absolute w-1 h-1 bg-accent-primary/60 rounded-full"
              style={{
                left: `${8 + i * 8}%`,
                animation: `rise ${6 + (i % 4) * 2}s linear infinite`,
                animationDelay: `${i * 0.7}s`,
                opacity: 0.4 + (i % 3) * 0.15,
              }}
            />
          ))}
        </>
      )}

      {/* Content */}
      <div className="relative z-1">
        {children}
      </div>

      <style jsx>{`
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          pointer-events: none;
        }
        .orb-1 { 
          width: 500px; 
          height: 500px; 
          background: #0ea5e9; 
          top: -180px; 
          left: -150px; 
        }
        .orb-2 { 
          width: 400px; 
          height: 400px; 
          background: #6366f1; 
          bottom: -120px; 
          right: -100px; 
        }
        .orb-3 { 
          width: 300px; 
          height: 300px; 
          background: #14b8a6; 
          top: 40%; 
          left: 30%; 
        }

        .grid-overlay {
          background-image:
            linear-gradient(rgba(14, 165, 233, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.04) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        @keyframes rise {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100px) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
