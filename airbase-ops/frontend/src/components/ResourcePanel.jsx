import { AnimatedCounter } from './AnimatedCounter';
import AnimatedProgressBar from './AnimatedProgressBar';
import { Fuel, Crosshair, Bomb, Scan, Wrench, Box, Users, Clock } from 'lucide-react';

export default function ResourcePanel({ resources, personnel }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Box size={14} style={{ color: 'var(--text-secondary)' }} />
        <h2 className="font-mono text-xs font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          BASE RESOURCES
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 stagger-fade-in">
        {/* Fuel Storage */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Fuel size={11} style={{ color: 'var(--fuel-color)' }} />
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>FUEL STORAGE</span>
            </div>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--fuel-color)' }}>
              <AnimatedCounter value={Math.round(resources.fuel_storage)} />
              <span className="text-[10px] opacity-60"> / {resources.fuel_storage_capacity}</span>
            </span>
          </div>
          <AnimatedProgressBar
            value={resources.fuel_storage}
            max={resources.fuel_storage_capacity}
            color="var(--fuel-color)"
            height={5}
          />
          <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {((resources.fuel_storage / resources.fuel_storage_capacity) * 100).toFixed(0)}% capacity
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
              <AnimatedCounter value={resources.missiles} /> / 40
            </span>
          </div>
          <AnimatedProgressBar value={resources.missiles} max={40} color="var(--weapons-color)" height={4} />
        </div>

        {/* Bombs */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Bomb size={11} style={{ color: 'var(--weapons-color)' }} />
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>BOMBS</span>
            </div>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--weapons-color)' }}>
              <AnimatedCounter value={resources.bombs} /> / 30
            </span>
          </div>
          <AnimatedProgressBar value={resources.bombs} max={30} color="var(--weapons-color)" height={4} />
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
              <AnimatedCounter value={resources.spare_parts} /> / 20
            </span>
          </div>
          <AnimatedProgressBar value={resources.spare_parts} max={20} color="var(--text-secondary)" height={4} />
        </div>

        {/* Exchange Units */}
        <div className="rounded-lg p-2.5" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Box size={11} style={{ color: 'var(--ue-color)' }} />
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>EXCHANGE UNITS</span>
            </div>
            <span className="font-mono text-xs font-semibold" style={{ color: 'var(--ue-color)' }}>
              <AnimatedCounter value={resources.exchange_units} /> / 8
            </span>
          </div>
          <AnimatedProgressBar value={resources.exchange_units} max={8} color="var(--ue-color)" height={4} />
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
            <span>Shift change in {personnel.shift_hours_remaining.toFixed(0)}h</span>
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
    </div>
  );
}
