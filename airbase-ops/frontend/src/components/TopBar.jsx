import { Plane, Clock, CalendarDays, Play, FastForward, RotateCcw, MessageSquare, HelpCircle } from 'lucide-react';
import ShimmerButton from './ShimmerButton';

const PHASE_STYLES = {
  PEACE: { bg: 'bg-green-900/40', text: 'text-green-400', border: 'border-green-500/50', label: 'PEACE', color: '#22c55e' },
  CRISIS: { bg: 'bg-amber-900/40', text: 'text-amber-400', border: 'border-amber-500/50', label: 'CRISIS', color: '#eab308' },
  WAR: { bg: 'bg-red-900/40', text: 'text-red-400', border: 'border-red-500/50', label: 'WAR', color: '#ef4444' },
};

export default function TopBar({ gameState, onAdvance, onAdvanceMultiple, onNewGame, onToggleChat, onToggleHelp, loading }) {
  const { current_day, current_hour, current_turn, phase } = gameState;
  const phaseStyle = PHASE_STYLES[phase] || PHASE_STYLES.PEACE;
  const timeStr = `${String(current_hour).padStart(2, '0')}:00`;
  const totalTurns = 168;
  const progressPct = (current_turn / totalTurns) * 100;

  return (
    <div className="glass-panel px-5 py-3 flex items-center justify-between gap-4 relative"
      style={{ borderBottom: '1px solid var(--border-color)' }}>

      {/* Overall progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'var(--bg-primary)' }}>
        <div className="h-full transition-all duration-700 ease-out"
          style={{
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${phaseStyle.color}80, ${phaseStyle.color})`,
            boxShadow: `0 0 8px ${phaseStyle.color}66`,
          }} />
      </div>

      {/* Left — Title */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center relative"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
          <Plane size={18} className="text-white" />
          {/* Mini breathing dot */}
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full status-breathe"
            style={{ backgroundColor: '#22c55e', '--glow-color': 'rgba(34,197,94,0.5)' }} />
        </div>
        <div>
          <h1 className="font-mono text-base font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
            AIRBASE OPS
          </h1>
          <p className="text-[10px] tracking-widest" style={{ color: 'var(--text-muted)' }}>
            GRIPEN OPERATIONS CENTER
          </p>
        </div>
      </div>

      {/* Center — Day, Phase, Time */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            DAY {current_day} / 7
          </span>
        </div>

        {/* Animated phase badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${phaseStyle.bg} ${phaseStyle.text} ${phaseStyle.border}`}
          style={{
            boxShadow: `0 0 12px ${phaseStyle.color}20`,
            transition: 'all 0.5s ease',
          }}>
          {phaseStyle.label}
        </span>

        {/* Animated clock */}
        <div className="flex items-center gap-2 relative">
          <Clock size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="font-mono text-2xl font-bold" style={{
            color: 'var(--text-primary)',
            textShadow: `0 0 20px ${phaseStyle.color}30`,
          }}>
            {timeStr}
          </span>
          {/* Colon blink */}
        </div>

        <span className="font-mono text-xs px-2 py-0.5 rounded-md" style={{
          color: 'var(--text-muted)',
          background: 'var(--bg-primary)',
        }}>
          Turn {current_turn} / {totalTurns}
        </span>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <ShimmerButton
          onClick={onAdvance}
          disabled={loading || gameState.is_game_over}
          variant="primary"
          className="px-4 py-2 rounded-lg"
        >
          <Play size={12} /> 1H
        </ShimmerButton>

        <ShimmerButton
          onClick={() => onAdvanceMultiple(4)}
          disabled={loading || gameState.is_game_over}
          variant="ghost"
          className="px-4 py-2 rounded-lg"
        >
          <FastForward size={12} /> 4H
        </ShimmerButton>

        <ShimmerButton
          onClick={onToggleChat}
          variant="cyan"
          className="px-3 py-2 rounded-lg"
        >
          <MessageSquare size={12} /> AI
        </ShimmerButton>

        <button onClick={onToggleHelp}
          title="How to Play (?)"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs transition-all duration-200"
          style={{
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#8b5cf6';
            e.currentTarget.style.color = '#8b5cf6';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}>
          <HelpCircle size={12} />
        </button>

        <button onClick={onNewGame}
          title="Reset Game"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs transition-all duration-200"
          style={{
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--status-maintenance)';
            e.currentTarget.style.color = 'var(--status-maintenance)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}>
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
}
