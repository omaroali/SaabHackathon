import { useState } from 'react';
import { Shield, Eye, Target, Crosshair, Radio, Zap, Clock, X, Plus, ChevronDown } from 'lucide-react';
import { formatClockTime, formatHours, formatHoursUntil, formatNumber } from '../lib/format';

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

export default function MissionRow({ mission, aircraft, currentHour, onAssign, onUnassign, onPlan }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const Icon = MISSION_ICONS[mission.type] || Shield;
  const missionColor = MISSION_COLORS[mission.type] || '#6b7280';
  const statusStyle = STATUS_STYLES[mission.status] || STATUS_STYLES.PENDING;

  const getAvailability = (ac) => {
    const hoursUntilMission = mission.scheduled_hour - currentHour;
    
    if (hoursUntilMission < 0) return { available: false, reason: 'Missed' };

    if (ac.status === 'MISSION_CAPABLE' || ac.status === 'HANGAR') {
      return { available: true, reason: 'Ready' };
    }
    
    if (ac.status === 'MAINTENANCE') {
      const maintLeft = ac.maintenance?.hours_remaining || 0;
      if (maintLeft > hoursUntilMission) {
        return { available: false, reason: `Maint ${formatHours(maintLeft)}` };
      } else {
        return { available: true, reason: `Ready ${formatHoursUntil(maintLeft)}` };
      }
    }
    
    if (ac.status === 'POST_FLIGHT') {
       if (0.5 > hoursUntilMission) {
         return { available: false, reason: `Turnaround` };
       } else {
         return { available: true, reason: `Ready in ${formatHours(0.5)}` };
       }
    }
    
    return { available: false, reason: 'Unavailable' };
  };

  const assignableAircraftList = aircraft
    .filter(a => !mission.assigned_aircraft_ids.includes(a.id) && a.status !== 'ON_MISSION' && a.status !== 'PRE_FLIGHT')
    .map(a => ({ ...a, availability: getAvailability(a) }));

  const canAssign = mission.status === 'PENDING' || mission.status === 'AIRCRAFT_ASSIGNED';
  const needsMore = mission.assigned_aircraft_ids.length < mission.required_aircraft;

  return (
    <div className="relative rounded-lg p-2.5 mb-1.5 animate-fade-in-up"
      style={{ background: 'var(--bg-primary)', border: `1px solid ${missionColor}22`, zIndex: showDropdown ? 50 : 1 }}>
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
              {mission.is_planned && (
                <span className="font-mono text-[8px] px-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PLANNED
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[9px]" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-0.5"><Clock size={8} />{formatClockTime(mission.scheduled_hour)}</span>
              <span>{formatHours(mission.duration_hours)}</span>
              <span>{mission.required_aircraft} aircraft</span>
              {mission.missiles_per_aircraft > 0 && (
                <span className="flex items-center gap-0.5"><Crosshair size={8} />{formatNumber(mission.missiles_per_aircraft, 0)}/ac</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status and Plan action */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded"
            style={{ background: statusStyle.bg, color: statusStyle.color }}>
            {statusStyle.label}
          </span>
          {!mission.is_planned && (mission.status === 'PENDING' || mission.status === 'AIRCRAFT_ASSIGNED') && (
            <button
              onClick={() => onPlan(mission.id)}
              className="px-2 py-0.5 rounded font-mono text-[9px] font-bold transition-all border border-blue-500/50 hover:bg-blue-500/20 text-blue-400"
            >
              APPROVE PLAN
            </button>
          )}
        </div>
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
                  opacity: assignableAircraftList.some(a => a.availability.available) ? 1 : 0.4,
                }}
                disabled={!assignableAircraftList.some(a => a.availability.available)}>
                <Plus size={10} /> Assign
              </button>

              {showDropdown && assignableAircraftList.length > 0 && (
                <div className="absolute top-full left-0 mt-1 z-30 glass-panel rounded-lg py-1 min-w-[140px]"
                  style={{ border: '1px solid var(--border-accent)' }}>
                  {assignableAircraftList.map(ac => (
                    <button key={ac.id}
                      onClick={() => { 
                        if (ac.availability.available) {
                           onAssign(mission.id, [ac.id]); 
                           setShowDropdown(false); 
                        }
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-mono transition-colors flex items-center justify-between gap-3"
                      style={{ 
                        color: 'var(--text-primary)',
                        opacity: ac.availability.available ? 1 : 0.5,
                        cursor: ac.availability.available ? 'pointer' : 'not-allowed'
                      }}
                      onMouseEnter={e => { if (ac.availability.available) e.currentTarget.style.background = 'var(--bg-tertiary)'}}
                      onMouseLeave={e => { if (ac.availability.available) e.currentTarget.style.background = 'transparent'}}>
                      
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: ac.availability.available ? 'var(--status-ready)' : 'var(--status-maintenance)' }} />
                        {ac.id}
                      </div>

                      {!ac.availability.available && (
                         <span className="text-[9px] text-red-400">{ac.availability.reason}</span>
                      )}
                      {ac.availability.available && ac.availability.reason !== 'Ready' && (
                         <span className="text-[9px] text-yellow-400">{ac.availability.reason}</span>
                      )}
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
