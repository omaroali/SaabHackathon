import { useState } from 'react';
import { Shield, Eye, Target, Crosshair, Radio, Zap, Clock, X, Plus, ChevronDown } from 'lucide-react';

const MISSION_ICONS = {
  QRA: Zap,
  DCA: Shield,
  RECCE: Eye,
  ATTACK: Target,
  ESCORT: Radio,
  AEW: Radio,
};

const MISSION_COLORS = {
  QRA: '#eab308',
  DCA: '#3b82f6',
  RECCE: '#22c55e',
  ATTACK: '#ef4444',
  ESCORT: '#8b5cf6',
  AEW: '#06b6d4',
};

const STATUS_STYLES = {
  PENDING: { bg: 'rgba(107,114,128,0.2)', color: '#9ca3af', label: 'PENDING' },
  AIRCRAFT_ASSIGNED: { bg: 'rgba(234,179,8,0.2)', color: '#eab308', label: 'ASSIGNED' },
  IN_PROGRESS: { bg: 'rgba(59,130,246,0.2)', color: '#3b82f6', label: 'IN FLIGHT' },
  COMPLETED: { bg: 'rgba(34,197,94,0.2)', color: '#22c55e', label: 'COMPLETE' },
  FAILED: { bg: 'rgba(239,68,68,0.2)', color: '#ef4444', label: 'FAILED' },
};

export default function MissionRow({ mission, aircraft, onAssign, onUnassign }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const Icon = MISSION_ICONS[mission.type] || Shield;
  const missionColor = MISSION_COLORS[mission.type] || '#6b7280';
  const statusStyle = STATUS_STYLES[mission.status] || STATUS_STYLES.PENDING;

  const availableAircraft = aircraft.filter(
    a => a.status === 'MISSION_CAPABLE' && !mission.assigned_aircraft_ids.includes(a.id)
  );

  const canAssign = mission.status === 'PENDING' || mission.status === 'AIRCRAFT_ASSIGNED';
  const needsMore = mission.assigned_aircraft_ids.length < mission.required_aircraft;

  return (
    <div className="rounded-lg p-2.5 mb-1.5 animate-fade-in-up"
      style={{ background: 'var(--bg-primary)', border: `1px solid ${missionColor}22` }}>
      <div className="flex items-center justify-between gap-2">
        {/* Left: Mission info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${missionColor}25` }}>
            <Icon size={13} style={{ color: missionColor }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-bold" style={{ color: missionColor }}>
                {mission.type}
              </span>
              <span className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {mission.id}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-0.5"><Clock size={8} />{String(mission.scheduled_hour).padStart(2, '0')}:00</span>
              <span>{mission.duration_hours}h</span>
              <span>{mission.required_aircraft} aircraft</span>
              {mission.missiles_per_aircraft > 0 && (
                <span className="flex items-center gap-0.5"><Crosshair size={8} />{mission.missiles_per_aircraft}/ac</span>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded shrink-0"
          style={{ background: statusStyle.bg, color: statusStyle.color }}>
          {statusStyle.label}
        </span>
      </div>

      {/* Assignments */}
      {(canAssign || mission.assigned_aircraft_ids.length > 0) && (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {mission.assigned_aircraft_ids.map(acId => (
            <span key={acId} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold"
              style={{ background: `${missionColor}20`, color: missionColor }}>
              {acId}
              {canAssign && (
                <button onClick={() => onUnassign(mission.id, acId)}
                  className="hover:opacity-70 transition-opacity">
                  <X size={10} />
                </button>
              )}
            </span>
          ))}

          {canAssign && needsMore && (
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono transition-all"
                style={{
                  border: `1px dashed ${missionColor}55`,
                  color: missionColor,
                  opacity: availableAircraft.length ? 1 : 0.4,
                }}
                disabled={!availableAircraft.length}>
                <Plus size={10} /> Assign
              </button>

              {showDropdown && availableAircraft.length > 0 && (
                <div className="absolute top-full left-0 mt-1 z-30 glass-panel rounded-lg py-1 min-w-[100px]"
                  style={{ border: '1px solid var(--border-accent)' }}>
                  {availableAircraft.map(ac => (
                    <button key={ac.id}
                      onClick={() => { onAssign(mission.id, [ac.id]); setShowDropdown(false); }}
                      className="w-full px-3 py-1 text-left text-xs font-mono transition-colors flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => e.target.style.background = 'var(--bg-tertiary)'}
                      onMouseLeave={e => e.target.style.background = 'transparent'}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--status-ready)' }} />
                      {ac.id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
