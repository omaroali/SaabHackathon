import { Clock, Shield, Eye, Target, Zap, Radio } from 'lucide-react';

const MISSION_COLORS = {
  QRA: '#eab308',
  DCA: '#3b82f6',
  RECCE: '#22c55e',
  ATTACK: '#ef4444',
  ESCORT: '#8b5cf6',
  AEW: '#06b6d4',
};

const MISSION_ICONS = {
  QRA: Zap,
  DCA: Shield,
  RECCE: Eye,
  ATTACK: Target,
  ESCORT: Radio,
  AEW: Radio,
};

export default function TimelineBar({ ato, currentHour }) {
  if (!ato) return null;
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="glass-panel rounded-xl p-3" style={{ border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Clock size={12} style={{ color: 'var(--text-secondary)' }} />
        <span className="font-mono text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          24H TIMELINE
        </span>
      </div>

      <div className="relative">
        {/* Hour marks */}
        <div className="flex">
          {hours.map(h => (
            <div key={h} className="flex-1 text-center">
              <span className="font-mono text-[8px]"
                style={{ color: h === currentHour ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {String(h).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline track */}
        <div className="relative h-8 mt-1 rounded"
          style={{ background: 'var(--bg-primary)' }}>

          {/* Current hour indicator */}
          <div className="absolute top-0 bottom-0 w-0.5 z-10"
            style={{
              left: `${(currentHour / 24) * 100}%`,
              background: '#ef4444',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)',
            }} />

          {/* Mission blocks */}
          {ato.missions.map(mission => {
            const color = MISSION_COLORS[mission.type] || '#6b7280';
            const left = (mission.scheduled_hour / 24) * 100;
            const width = (mission.duration_hours / 24) * 100;
            const completed = mission.status === 'COMPLETED';
            const failed = mission.status === 'FAILED';
            const Icon = MISSION_ICONS[mission.type] || Shield;

            return (
              <div key={mission.id}
                className="absolute top-1 flex items-center gap-0.5 rounded px-1 text-[8px] font-mono font-semibold"
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 3)}%`,
                  height: '24px',
                  backgroundColor: `${color}${completed ? '30' : failed ? '20' : '50'}`,
                  color: completed ? `${color}88` : color,
                  border: `1px solid ${color}${completed ? '30' : '60'}`,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}>
                <Icon size={8} />
                <span>{mission.type}</span>
                <span className="opacity-60">{mission.required_aircraft}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
