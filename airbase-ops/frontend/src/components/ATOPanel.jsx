import MissionRow from './MissionRow';
import ShimmerButton from './ShimmerButton';
import { FileText, Sparkles } from 'lucide-react';

const PHASE_STYLES = {
  PEACE: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'PEACE' },
  CRISIS: { bg: 'rgba(234,179,8,0.15)', color: '#eab308', label: 'CRISIS' },
  WAR: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'WAR' },
};

export default function ATOPanel({ ato, aircraft, phase, currentHour, onAssign, onUnassign, onPlan, onAiSuggest, loading }) {
  if (!ato) return null;

  const phaseStyle = PHASE_STYLES[phase] || PHASE_STYLES.PEACE;

  const pending = ato.missions.filter(m => m.status === 'PENDING' || m.status === 'AIRCRAFT_ASSIGNED').length;
  const inProgress = ato.missions.filter(m => m.status === 'IN_PROGRESS').length;
  const completed = ato.missions.filter(m => m.status === 'COMPLETED').length;
  const failed = ato.missions.filter(m => m.status === 'FAILED').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={14} style={{ color: 'var(--text-secondary)' }} />
          <h2 className="font-mono text-xs font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            AIR TASKING ORDER
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: phaseStyle.bg, color: phaseStyle.color }}>
            DAY {ato.day}
          </span>
        </div>

        {/* Summary — animated badges */}
        <div className="flex items-center gap-2 text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>
          {pending > 0 && (
            <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(107,114,128,0.15)' }}>
              {pending} pending
            </span>
          )}
          {inProgress > 0 && (
            <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
              {inProgress} active
            </span>
          )}
          {completed > 0 && (
            <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
              {completed} done
            </span>
          )}
          {failed > 0 && (
            <span className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
              {failed} failed
            </span>
          )}
        </div>
      </div>

      {/* AI Suggest Button — shimmer */}
      <ShimmerButton
        onClick={onAiSuggest}
        disabled={loading}
        variant="cyan"
        className="w-full py-2.5 rounded-lg mb-3"
      >
        <Sparkles size={13} />
        {loading ? 'Analyzing Fleet...' : 'AI Suggest Allocation'}
      </ShimmerButton>

      {/* Mission List — staggered + padding for dropdowns */}
      <div className="flex-1 overflow-y-auto pb-24 stagger-fade-in">
        {ato.missions
          .sort((a, b) => a.scheduled_hour - b.scheduled_hour)
          .map(mission => (
            <MissionRow
              key={mission.id}
              mission={mission}
              aircraft={aircraft}
              currentHour={currentHour}
              onAssign={onAssign}
              onUnassign={onUnassign}
              onPlan={onPlan}
            />
          ))}
      </div>
    </div>
  );
}
