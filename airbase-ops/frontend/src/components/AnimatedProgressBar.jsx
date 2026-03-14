import { useEffect, useState, useRef } from 'react';

/**
 * Animated progress bar with smooth transitions and optional glow.
 * Inspired by 21st.dev animated progress components.
 */
export default function AnimatedProgressBar({
  value,
  max = 100,
  color = '#22c55e',
  height = 6,
  glow = true,
  animated = true,
  showPercentage = false,
  className = '',
}) {
  const [displayWidth, setDisplayWidth] = useState(0);
  const barRef = useRef(null);
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  useEffect(() => {
    // Slight delay for mount animation
    const timer = setTimeout(() => setDisplayWidth(pct), 50);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className={`relative ${className}`}>
      {/* Track */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: 'rgba(255,255,255,0.06)' }}
      >
        {/* Fill */}
        <div
          ref={barRef}
          className="h-full rounded-full relative"
          style={{
            width: `${displayWidth}%`,
            backgroundColor: color,
            transition: animated ? 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            boxShadow: glow ? `0 0 ${height * 2}px ${color}66` : 'none',
          }}
        >
          {/* Animated stripe overlay */}
          {animated && displayWidth > 0 && (
            <div
              className="absolute inset-0 overflow-hidden rounded-full"
              style={{
                background: `repeating-linear-gradient(
                  -45deg,
                  transparent,
                  transparent 4px,
                  rgba(255,255,255,0.08) 4px,
                  rgba(255,255,255,0.08) 8px
                )`,
                animation: 'stripedMove 1s linear infinite',
                backgroundSize: '14px 14px',
              }}
            />
          )}
        </div>
      </div>

      {showPercentage && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-mono pr-1"
          style={{ color }}>
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}
