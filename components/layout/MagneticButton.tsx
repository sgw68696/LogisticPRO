"use client";
import { useEffect, useRef } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onMouseMove?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  strength?: number;
  radius?: number;
}

export default function MagneticButton({
  children,
  className,
  onClick,
  type = 'button',
  disabled,
  onMouseMove,
  strength = 0.38,
  radius = 90,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        const pull = 1 - dist / radius;
        const mx = dx * pull * strength;
        const my = dy * pull * strength;
        el.style.transform = `translate(${mx}px, ${my}px) scale(${1 + pull * 0.07})`;
        el.style.transition = 'transform 0.08s linear';
        const inner = el.querySelector('.mag-inner') as HTMLElement;
        if (inner) {
          inner.style.transform = `translate(${mx * 0.3}px, ${my * 0.3}px)`;
          inner.style.transition = 'transform 0.08s linear';
        }
      } else {
        el.style.transform = 'translate(0,0) scale(1)';
        el.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
        const inner = el.querySelector('.mag-inner') as HTMLElement;
        if (inner) {
          inner.style.transform = 'translate(0,0)';
          inner.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
        }
      }
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [strength, radius]);

  return (
    <button
      ref={ref}
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={onMouseMove}
      style={{ willChange: 'transform', position: 'relative' }}
    >
      <span className="mag-inner" style={{ display: 'block', pointerEvents: 'none' }}>
        {children}
      </span>
    </button>
  );
}