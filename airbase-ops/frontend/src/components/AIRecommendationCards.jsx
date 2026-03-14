import { X, Brain, ChevronDown, ChevronUp, AlertCircle, Lightbulb, TrendingUp, Loader2 } from 'lucide-react';
import { useState } from 'react';

/**
 * AI Recommendation Cards — structured, explainable AI suggestions.
 *
 * Each card shows:
 * - Action title
 * - Why (2-3 bullet reasons)
 * - Expected Effect (metric deltas)
 * - Confidence bar (0-100)
 * - Assumptions
 * - Tradeoff / failure mode
 *
 * Falls back gracefully to raw text display if AI returns unstructured output.
 */

function ConfidenceBar({ value }) {
  const color = value >= 75 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px] font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

function EffectChips({ effects }) {
  if (!effects || Object.keys(effects).length === 0) return null;

  const labels = {
    fleet_readiness: 'Readiness',
    mission_throughput: 'Throughput',
    turnaround_delay: 'Turnaround',
    risk_score: 'Risk',
  };

  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(effects).map(([key, val]) => {
        const str = String(val);
        const isPositive = str.startsWith('+') || str.startsWith('-');
        const color = str.includes('+') && !key.includes('risk') && !key.includes('delay')
          ? '#22c55e'
          : str.includes('-') && (key.includes('risk') || key.includes('delay'))
          ? '#22c55e'
          : '#ef4444';

        return (
          <span key={key} className="font-mono text-[9px] px-1.5 py-0.5 rounded"
            style={{
              color,
              background: color + '15',
              border: `1px solid ${color}25`,
            }}>
            {labels[key] || key}: {val}
          </span>
        );
      })}
    </div>
  );
}

function RecommendationCard({ rec, index }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200 animate-fade-in-up"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        animationDelay: `${index * 80}ms`,
      }}>

      {/* Header — always visible */}
      <button
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors"
        onClick={() => setExpanded(!expanded)}
        style={{ color: 'var(--text-primary)' }}>

        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'rgba(6,182,212,0.15)' }}>
          <span className="font-mono text-[9px] font-bold" style={{ color: 'var(--ai-accent)' }}>
            {index + 1}
          </span>
        </div>

        <span className="text-xs font-semibold flex-1 truncate">{rec.action}</span>

        <ConfidenceBar value={rec.confidence} />

        {expanded ? <ChevronUp size={12} style={{ color: 'var(--text-muted)' }} /> :
                    <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 animate-fade-in-up"
          style={{ borderTop: '1px solid var(--border-color)' }}>

          {/* Why */}
          {rec.why && rec.why.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-1 mb-1">
                <Lightbulb size={9} style={{ color: '#f59e0b' }} />
                <span className="font-mono text-[9px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  REASONING
                </span>
              </div>
              <ul className="space-y-0.5">
                {rec.why.map((reason, j) => (
                  <li key={j} className="text-[11px] leading-relaxed flex items-start gap-1.5"
                    style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-[8px] mt-1 shrink-0" style={{ color: 'var(--ai-accent)' }}>●</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expected Effect */}
          {rec.expected_effect && Object.keys(rec.expected_effect).length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp size={9} style={{ color: '#22c55e' }} />
                <span className="font-mono text-[9px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  EXPECTED EFFECT
                </span>
              </div>
              <EffectChips effects={rec.expected_effect} />
            </div>
          )}

          {/* Assumptions */}
          {rec.assumptions && rec.assumptions.length > 0 && (
            <div className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold">Assumes: </span>
              {rec.assumptions.join('; ')}
            </div>
          )}

          {/* Tradeoff */}
          {rec.tradeoff && (
            <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.15)',
              }}>
              <AlertCircle size={10} className="mt-0.5 shrink-0" style={{ color: '#ef4444' }} />
              <span className="text-[10px]" style={{ color: '#fca5a5' }}>{rec.tradeoff}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AIRecommendationCards({ isOpen, recommendations, loading, onClose, onApply }) {
  if (!isOpen && !loading) return null;

  const recs = recommendations?.recommendations || [];
  const hasAssignments = recommendations?.assignments?.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>

      <div className="w-full max-w-lg mx-4 max-h-[80vh] rounded-2xl overflow-hidden flex flex-col animate-scale-pop"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(6,182,212,0.15)' }}>
              <Brain size={14} style={{ color: 'var(--ai-accent)' }} />
            </div>
            <div>
              <h2 className="font-mono text-xs font-bold tracking-wider" style={{ color: 'var(--ai-accent)' }}>
                AI RECOMMENDATIONS
              </h2>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {recs.length} suggestion{recs.length !== 1 ? 's' : ''} — review & apply
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--ai-accent)' }} />
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                Analyzing fleet state...
              </span>
            </div>
          ) : recs.length > 0 ? (
            recs.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No recommendations available.
              </p>
            </div>
          )}
        </div>

        {/* Footer — apply button */}
        {hasAssignments && !loading && (
          <div className="px-4 py-3 shrink-0 flex items-center justify-between"
            style={{ borderTop: '1px solid var(--border-color)' }}>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {recommendations.assignments.length} assignment{recommendations.assignments.length !== 1 ? 's' : ''} ready to apply
            </span>
            <button
              onClick={onApply}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all duration-200"
              style={{
                background: 'var(--ai-accent)',
                color: '#fff',
              }}>
              Apply All Assignments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
