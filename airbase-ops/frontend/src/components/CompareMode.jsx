import { useState } from 'react';
import { GitCompareArrows, X, Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ShimmerButton from './ShimmerButton';
import { formatNumber } from '../lib/format';

/**
 * Compare Mode — side-by-side Baseline vs AI-Optimized outcomes.
 *
 * Shows projected 6h outcomes:
 * - Missions completed / failed
 * - Average readiness %
 * - Fuel burned, missiles used, UE used
 * - Final risk score
 *
 * Triggered by "Compare Plans" button. Runs non-destructive simulation on backend.
 */

const COMPARE_ROWS = [
  { key: 'missions_completed', label: 'Missions Completed', higherBetter: true, unit: '' },
  { key: 'missions_failed', label: 'Missions Failed', higherBetter: false, unit: '' },
  { key: 'avg_readiness', label: 'Avg Readiness', higherBetter: true, unit: '%' },
  { key: 'fuel_burned', label: 'Fuel Burned', higherBetter: false, unit: ' L' },
  { key: 'missiles_used', label: 'Missiles Used', higherBetter: false, unit: '' },
  { key: 'ue_used', label: 'Exchange Units Used', higherBetter: false, unit: '' },
  { key: 'final_risk', label: 'Final Risk Score', higherBetter: false, unit: '' },
];

export default function CompareMode({ isOpen, onClose, comparison, loading, onCompare }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>

      <div className="w-full max-w-2xl mx-4 rounded-2xl overflow-hidden animate-scale-pop"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <GitCompareArrows size={16} style={{ color: '#8b5cf6' }} />
            <h2 className="font-mono text-sm font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
              PLAN COMPARISON
            </h2>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-mono"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}>
              6H FORECAST
            </span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {loading && !comparison ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 size={24} className="animate-spin" style={{ color: '#8b5cf6' }} />
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                Simulating 6h forecast...
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Running AI optimization + forward simulation
              </span>
            </div>
          ) : comparison ? (
            <>
              {/* Table header */}
              <div className="grid grid-cols-4 gap-2 mb-3 px-2">
                <span className="font-mono text-[9px] font-semibold tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>METRIC</span>
                <span className="font-mono text-[9px] font-semibold tracking-wider text-center"
                  style={{ color: 'var(--text-muted)' }}>BASELINE</span>
                <span className="font-mono text-[9px] font-semibold tracking-wider text-center"
                  style={{ color: '#8b5cf6' }}>AI-OPTIMIZED</span>
                <span className="font-mono text-[9px] font-semibold tracking-wider text-center"
                  style={{ color: 'var(--text-muted)' }}>DELTA</span>
              </div>

              {/* Rows */}
              {COMPARE_ROWS.map((row, i) => {
                const baseVal = comparison.baseline?.[row.key] ?? 0;
                const optVal = comparison.optimized?.[row.key] ?? 0;
                const delta = optVal - baseVal;
                const isBetter = row.higherBetter ? delta > 0 : delta < 0;
                const isWorse = row.higherBetter ? delta < 0 : delta > 0;
                const deltaColor = isBetter ? '#22c55e' : isWorse ? '#ef4444' : 'var(--text-muted)';

                return (
                  <div key={row.key}
                    className="grid grid-cols-4 gap-2 items-center px-2 py-2 rounded-lg transition-colors"
                    style={{
                      background: i % 2 === 0 ? 'var(--bg-primary)' : 'transparent',
                      animationDelay: `${i * 50}ms`,
                    }}>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {row.label}
                    </span>
                    <span className="font-mono text-xs text-center font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {typeof baseVal === 'number' ? formatNumber(baseVal, 1) : baseVal}{row.unit}
                    </span>
                    <span className="font-mono text-xs text-center font-bold" style={{ color: '#8b5cf6' }}>
                      {typeof optVal === 'number' ? formatNumber(optVal, 1) : optVal}{row.unit}
                    </span>
                    <div className="flex items-center justify-center gap-1">
                      {delta !== 0 ? (
                        <>
                          {isBetter ? <TrendingUp size={10} style={{ color: deltaColor }} /> :
                           isWorse ? <TrendingDown size={10} style={{ color: deltaColor }} /> :
                           <Minus size={10} style={{ color: deltaColor }} />}
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              color: deltaColor,
                              background: deltaColor + '15',
                            }}>
                            {delta > 0 ? '+' : ''}{typeof delta === 'number' ? formatNumber(delta, 1) : delta}{row.unit}
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Summary badge */}
              {(() => {
                const riskDelta = (comparison.optimized?.final_risk ?? 0) - (comparison.baseline?.final_risk ?? 0);
                const missionDelta = (comparison.optimized?.missions_completed ?? 0) - (comparison.baseline?.missions_completed ?? 0);
                const improved = missionDelta > 0 || riskDelta < 0;
                return (
                  <div className="mt-4 px-3 py-2 rounded-lg text-center"
                    style={{
                      background: improved ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${improved ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>
                    <span className="font-mono text-xs font-semibold"
                      style={{ color: improved ? '#22c55e' : '#ef4444' }}>
                      {improved ?
                        `AI plan improves outcome: +${missionDelta} missions, ${riskDelta} risk` :
                        'AI plan shows similar outcomes — consider manual adjustments'}
                    </span>
                  </div>
                );
              })()}
            </> 
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Compare your current plan against AI-optimized allocation.
                <br />Simulates 6 hours forward — non-destructive.
              </p>
              <ShimmerButton onClick={onCompare} variant="primary" className="px-6 py-2 rounded-lg">
                <GitCompareArrows size={14} /> Run Comparison
              </ShimmerButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
