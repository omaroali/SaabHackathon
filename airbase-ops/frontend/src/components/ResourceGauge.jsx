export default function ResourceGauge({ label, current, max, color, icon: Icon, subtitle }) {
  const pct = max ? Math.min(100, (current / max) * 100) : null;
  const isLow = pct !== null && pct < 20;
  const displayColor = isLow ? 'var(--status-maintenance)' : color;

  return (
    <div className="rounded-lg p-2.5 mb-2" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={11} style={{ color: displayColor }} />}
          <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {label}
          </span>
        </div>
        <span className="font-mono text-xs font-semibold" style={{ color: displayColor }}>
          {typeof current === 'number' ? (Number.isInteger(current) ? current : current.toFixed(0)) : current}
          {max ? ` / ${Number.isInteger(max) ? max : max.toFixed(0)}` : ''}
        </span>
      </div>

      {pct !== null && (
        <div className="w-full rounded-full h-1.5" style={{ background: 'var(--bg-secondary)' }}>
          <div className="rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: displayColor }} />
        </div>
      )}

      {subtitle && (
        <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      )}
    </div>
  );
}
