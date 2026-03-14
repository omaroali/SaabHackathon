import { Activity, Gauge, Clock, AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';
import { formatNumber } from '../lib/format';

/**
 * Decision Impact Panel — persistent KPI strip below the TopBar.
 *
 * Shows 4 metrics with before/after deltas (green ▲ / red ▼ chips):
 * 1. Fleet Readiness %
 * 2. Expected Mission Throughput (next 6h)
 * 3. Turnaround Delay (minutes)
 * 4. Operational Risk Exposure (0-100)
 */

const METRIC_CONFIG = [
  {
    key: 'fleet_readiness',
    label: 'Fleet Readiness',
    unit: '%',
    icon: Activity,
    color: '#22c55e',
    higherIsBetter: true,
    tooltip: 'Percentage of fleet that is MISSION_CAPABLE or ON_MISSION. Formula: (ready + flying) / total × 100',
  },
  {
    key: 'mission_throughput',
    label: 'Mission Throughput',
    unit: ' missions',
    icon: Gauge,
    color: '#3b82f6',
    higherIsBetter: true,
    tooltip: 'Missions completable in next 6h given current fleet availability. Counts upcoming missions where available aircraft ≥ required.',
  },
  {
    key: 'turnaround_delay',
    label: 'Avg Turnaround',
    unit: ' min',
    icon: Clock,
    color: '#f59e0b',
    higherIsBetter: false,
    tooltip: 'Average minutes until non-ready aircraft become mission capable. Includes pre-flight, maintenance, and post-flight time.',
  },
  {
    key: 'risk_score',
    label: 'Risk Exposure',
    unit: '',
    icon: AlertTriangle,
    color: '#ef4444',
    higherIsBetter: false,
    tooltip: 'Composite 0–100 score: fuel shortage (25w) + UE shortage (25w) + maintenance burden (25w) + mission coverage gap (25w).',
  },
];

export default function DecisionImpactPanel({ metrics, prevMetrics }) {
  const [tooltipIdx, setTooltipIdx] = useState(null);

  if (!metrics) return null;

  return (
    <div className="flex items-stretch gap-2 px-4 py-2 animate-fade-in-up"
      style={{
        background: 'rgba(17, 24, 39, 0.6)',
        borderBottom: '1px solid var(--border-color)',
      }}>

      <span className="font-mono text-[9px] font-semibold tracking-widest self-center mr-2 shrink-0"
        style={{ color: 'var(--text-muted)' }}>
        KPI
      </span>

      {METRIC_CONFIG.map((cfg, i) => {
        const value = metrics[cfg.key];
        const prev = prevMetrics?.[cfg.key];
        const delta = prev != null ? value - prev : null;
        const Icon = cfg.icon;

        // Determine if delta is good or bad
        const isPositive = delta != null && (
          (cfg.higherIsBetter && delta > 0) ||
          (!cfg.higherIsBetter && delta < 0)
        );
        const isNegative = delta != null && (
          (cfg.higherIsBetter && delta < 0) ||
          (!cfg.higherIsBetter && delta > 0)
        );
        const deltaColor = isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'var(--text-muted)';

        return (
          <div key={cfg.key}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 cursor-help"
            style={{
              background: 'var(--bg-primary)',
              border: `1px solid ${tooltipIdx === i ? cfg.color + '40' : 'var(--border-color)'}`,
              flex: 1,
            }}
            onMouseEnter={() => setTooltipIdx(i)}
            onMouseLeave={() => setTooltipIdx(null)}
          >
            <Icon size={12} style={{ color: cfg.color, shrink: 0 }} />

            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-semibold tracking-wider truncate"
                style={{ color: 'var(--text-muted)' }}>
                {cfg.label}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-bold" style={{ color: cfg.color }}>
                  {typeof value === 'number' ? formatNumber(value, 1) : value}
                  <span className="text-[9px] opacity-60">{cfg.unit}</span>
                </span>

                {/* Delta chip */}
                {delta != null && delta !== 0 && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{
                      color: deltaColor,
                      background: deltaColor + '15',
                      border: `1px solid ${deltaColor}30`,
                    }}>
                    {delta > 0 ? '▲' : '▼'} {formatNumber(Math.abs(delta), cfg.key === 'fleet_readiness' ? 1 : 0)}
                  </span>
                )}
              </div>
            </div>

            {/* Tooltip */}
            {tooltipIdx === i && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 p-2 rounded-lg text-[10px] leading-relaxed animate-fade-in-up"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-accent)',
                  color: 'var(--text-secondary)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}>
                <div className="flex items-center gap-1 mb-1">
                  <Info size={9} style={{ color: cfg.color }} />
                  <span className="font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                </div>
                {cfg.tooltip}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45"
                  style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-accent)', borderBottom: '1px solid var(--border-accent)' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
