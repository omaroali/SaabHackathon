/**
 * Shimmer button with animated gradient sweep — inspired by 21st.dev CTA components.
 * Creates a premium, attention-grabbing button effect.
 */
export default function ShimmerButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  ...props
}) {
  const variants = {
    primary: {
      bg: 'linear-gradient(135deg, #22c55e, #16a34a)',
      shimmer: 'rgba(255,255,255,0.15)',
      shadow: '0 0 30px rgba(34, 197, 94, 0.3)',
      hoverShadow: '0 0 40px rgba(34, 197, 94, 0.5)',
    },
    cyan: {
      bg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      shimmer: 'rgba(255,255,255,0.15)',
      shadow: '0 0 20px rgba(6, 182, 212, 0.3)',
      hoverShadow: '0 0 35px rgba(6, 182, 212, 0.5)',
    },
    danger: {
      bg: 'linear-gradient(135deg, #ef4444, #dc2626)',
      shimmer: 'rgba(255,255,255,0.15)',
      shadow: '0 0 20px rgba(239, 68, 68, 0.3)',
      hoverShadow: '0 0 35px rgba(239, 68, 68, 0.5)',
    },
    ghost: {
      bg: 'var(--bg-tertiary)',
      shimmer: 'rgba(255,255,255,0.05)',
      shadow: 'none',
      hoverShadow: '0 0 15px rgba(255,255,255,0.05)',
    }
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`shimmer-btn relative overflow-hidden font-mono text-xs font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none ${className}`}
      style={{
        background: v.bg,
        boxShadow: v.shadow,
        color: '#fff',
        border: variant === 'ghost' ? '1px solid var(--border-color)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => { if (!disabled) e.target.style.boxShadow = v.hoverShadow; }}
      onMouseLeave={e => { e.target.style.boxShadow = v.shadow; }}
      {...props}
    >
      {/* Shimmer sweep overlay */}
      <span className="shimmer-sweep" style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: `linear-gradient(90deg, transparent, ${v.shimmer}, transparent)`,
        animation: 'shimmerSweep 2.5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <span className="relative z-10 flex items-center justify-center gap-1.5">
        {children}
      </span>
    </button>
  );
}
