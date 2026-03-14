import { useState } from 'react';
import { AnimatedCounter } from './AnimatedCounter';
import AnimatedProgressBar from './AnimatedProgressBar';
import { Fuel, Crosshair, Bomb, Scan, Wrench, Box, Users, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { formatHours, formatInteger, formatPercent } from '../lib/format';

export default function ResourcePanel({ resources, personnel }) {
  const [expanded, setExpanded] = useState(false); // default collapsed to save space or true? Let's default to true for visibility but allow collapse
  
  return (
    <div className="flex flex-col">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between mb-3 px-1 w-full hover:opacity-80 transition-opacity cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Box size={14} style={{ color: 'var(--text-secondary)' }} />
          <h2 className="font-mono text-xs font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            BASE RESOURCES
          </h2>
        </div>
        {expanded ? 
          <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" /> : 
          <ChevronRight size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
        }
      </button>

      {expanded && (
        <div className="flex-1 overflow-y-auto space-y-1.5 stagger-fade-in pr-1">
          {/* Fuel Storage */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Fuel size={11} style={{ color: 'var(--fuel-color)' }} />
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>FUEL STORAGE</span>
            </div>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--fuel-color)' }}>
              <AnimatedCounter value={Math.round(resources.fuel_storage)} />
              <span className="text-[10px] opacity-60"> / {formatInteger(resources.fuel_storage_capacity)}</span>
            </span>
          </div>
          <AnimatedProgressBar
            value={resources.fuel_storage}
            max={resources.fuel_storage_capacity}
            color="var(--fuel-color)"
            height={5}
          />
          <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {formatPercent((resources.fuel_storage / resources.fuel_storage_capacity) * 100)} capacity
          </p>
        </div>

        {/* Missiles */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Crosshair size={11} style={{ color: 'var(--weapons-color)' }} />
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>MISSILES</span>
            </div>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--weapons-color)' }}>
              <AnimatedCounter value={resources.missiles} /> / 180
            </span>
          </div>
          <AnimatedProgressBar value={resources.missiles} max={180} color="var(--weapons-color)" height={4} />
        </div>

        {/* Bombs */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Bomb size={11} style={{ color: 'var(--weapons-color)' }} />
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>BOMBS</span>
            </div>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--weapons-color)' }}>
              <AnimatedCounter value={resources.bombs} /> / 120
            </span>
          </div>
          <AnimatedProgressBar value={resources.bombs} max={120} color="var(--weapons-color)" height={4} />
        </div>

        {/* Recon Pods */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Scan size={11} style={{ color: 'var(--ue-color)' }} />
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>RECON PODS</span>
            </div>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--ue-color)' }}>
              <AnimatedCounter value={resources.pods} />
            </span>
          </div>
        </div>

        {/* Spare Parts */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Wrench size={11} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>SPARE PARTS</span>
            </div>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <AnimatedCounter value={resources.spare_parts} /> / 60
            </span>
          </div>
          <AnimatedProgressBar value={resources.spare_parts} max={60} color="var(--text-secondary)" height={4} />
        </div>

        {/* Exchange Units */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Box size={11} style={{ color: 'var(--ue-color)' }} />
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>EXCHANGE UNITS</span>
            </div>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--ue-color)' }}>
              <AnimatedCounter value={resources.exchange_units} /> / 16
            </span>
          </div>
          <AnimatedProgressBar value={resources.exchange_units} max={16} color="var(--ue-color)" height={4} />
          <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {resources.exchange_units_in_repair} in MRO, {resources.exchange_units_in_transit} in transit
          </p>
        </div>

        {/* Personnel */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Users size={11} style={{ color: 'var(--personnel-color)' }} />
            <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>
              PERSONNEL
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              <AnimatedCounter value={personnel.maintenance_crews_on_duty} /> / {personnel.maintenance_crews_total} crews
            </span>
            <span
              className="w-2 h-2 rounded-full status-breathe"
              style={{
                backgroundColor: 'var(--personnel-color)',
                '--glow-color': 'rgba(6,182,212,0.5)',
              }}
            />
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-[9px]" style={{ color: 'var(--text-muted)' }}>
            <Clock size={9} />
            <span>Shift change in {formatHours(personnel.shift_hours_remaining, 0)}</span>
          </div>
          <AnimatedProgressBar
            value={personnel.shift_hours_remaining}
            max={8}
            color="var(--personnel-color)"
            height={3}
            glow={false}
            className="mt-1"
          />
        </div>
        </div>
      )}
    </div>
  );
}
