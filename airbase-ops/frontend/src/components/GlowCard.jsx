/**
 * Animated gradient border card — inspired by 21st.dev glowing card components.
 * Creates a subtle animated gradient that rotates around the card border.
 */
export default function GlowCard({
  children,
  glowColor = '#3b82f6',
  intensity = 0.3,
  className = '',
  onClick,
  animate = true,
  ...props
}) {
  return (
    <div
      className={`glow-card relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${className}`}
      onClick={onClick}
      style={{
        background: 'var(--bg-secondary)',
      }}
      onMouseEnter={e => {
        if (animate) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = `0 8px 32px ${glowColor}22, 0 0 16px ${glowColor}15`;
        }
      }}
      onMouseLeave={e => {
        if (animate) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      {...props}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          border: `1px solid ${glowColor}25`,
          transition: 'border-color 0.3s ease',
        }}
      />

      {/* Animated corner glow */}
      {animate && (
        <div className="absolute -top-1 -right-1 w-16 h-16 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${glowColor}${Math.round(intensity * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
            animation: 'cornerGlow 3s ease-in-out infinite',
            opacity: 0.5,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
