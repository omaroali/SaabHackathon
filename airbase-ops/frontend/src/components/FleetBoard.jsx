import { useState } from 'react';
import AircraftCard from './AircraftCard';
import { Plane, ChevronDown, ChevronRight } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

export default function FleetBoard({ aircraft, onSelect, onPrep }) {
  const [expanded, setExpanded] = useState(true); // default expanded because fleet is critical
  const missionCapable = aircraft.filter(a => a.status === 'MISSION_CAPABLE').length;
  const onMission = aircraft.filter(a => a.status === 'ON_MISSION').length;
  const inMaintenance = aircraft.filter(a => a.status === 'MAINTENANCE').length;

  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between mb-3 px-1 w-full hover:opacity-80 transition-opacity cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Plane size={14} style={{ color: 'var(--text-secondary)' }} />
          <h2 className="font-mono text-xs font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            FLEET STATUS
          </h2>
          {expanded ? 
            <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors ml-1" /> : 
            <ChevronRight size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors ml-1" />
          }
        </div>

        {/* Enhanced status summary */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1"
            style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--status-ready)' }}>
            <AnimatedCounter value={missionCapable} /> Ready
          </span>
          {onMission > 0 && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1"
              style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--status-mission)' }}>
              <AnimatedCounter value={onMission} /> Flying
            </span>
          )}
          {inMaintenance > 0 && (
            <span className="font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1"
              style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--status-maintenance)' }}>
              <AnimatedCounter value={inMaintenance} /> Maint
            </span>
          )}
        </div>
      </button>

      {expanded && (
        <>
          {/* Staggered grid animation */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 stagger-fade-in">
             {aircraft.map(ac => (
               <AircraftCard key={ac.id} aircraft={ac} onSelect={onSelect} onPrep={onPrep} />
             ))}
          </div>
        </>
      )}
    </div>
  );
}
