import { Fuel, Crosshair, Bomb, Scan, Wrench, Shield } from 'lucide-react';
import GlowCard from './GlowCard';
import AnimatedProgressBar from './AnimatedProgressBar';

const STATUS_CONFIG = {
  HANGAR: { color: '#6b7280', label: 'HANGAR', glow: '' },
  PRE_FLIGHT: { color: '#eab308', label: 'PREPPING', glow: 'status-glow-yellow' },
  MISSION_CAPABLE: { color: '#22c55e', label: 'READY', glow: 'status-glow-green' },
  ON_MISSION: { color: '#3b82f6', label: 'ON MISSION', glow: 'status-glow-blue' },
  POST_FLIGHT: { color: '#eab308', label: 'LANDING', glow: 'status-glow-yellow' },
  MAINTENANCE: { color: '#ef4444', label: 'MAINT', glow: 'status-glow-red' },
};

export default function AircraftCard({ aircraft, onSelect, onPrep }) {
  const config = STATUS_CONFIG[aircraft.status] || STATUS_CONFIG.HANGAR;
  const fuelPct = aircraft.fuel_level / aircraft.fuel_capacity;
  const svcLow = aircraft.hours_until_service < 15;

  return (
    <GlowCard
      glowColor={config.color}
      onClick={() => onSelect(aircraft)}
      className={config.glow}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {aircraft.id}
          </span>
          <span
            className="w-2.5 h-2.5 rounded-full status-breathe"
            style={{
              backgroundColor: config.color,
              '--glow-color': `${config.color}88`,
            }}
          />
        </div>

        {/* Status Badge */}
        <div
          className="rounded-md px-2 py-1.5 mb-2.5 text-center"
          style={{ backgroundColor: `${config.color}15`, color: config.color }}
        >
          <span className="font-mono text-[11px] font-semibold tracking-wide">{config.label}</span>
          {aircraft.status === 'PRE_FLIGHT' && aircraft.pre_flight_hours_remaining > 0 && (
            <div className="mt-1.5">
              <AnimatedProgressBar
                value={1 - aircraft.pre_flight_hours_remaining}
                max={1}
                color={config.color}
                height={3}
                glow={false}
              />
            </div>
          )}
          {aircraft.status === 'ON_MISSION' && (
            <span className="text-[10px] ml-1 opacity-80">
              {aircraft.mission_hours_remaining.toFixed(1)}h
            </span>
          )}
          {aircraft.status === 'MAINTENANCE' && aircraft.maintenance && (
            <span className="text-[10px] ml-1 opacity-80">
              {aircraft.maintenance.hours_remaining < 999
                ? `${aircraft.maintenance.hours_remaining.toFixed(1)}h`
                : 'GROUNDED'}
            </span>
          )}
        </div>

        {/* Fuel Bar — animated */}
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Fuel size={10} />
              <span>FUEL</span>
            </div>
            <span className="font-mono" style={{ color: 'var(--fuel-color)' }}>
              {Math.round(aircraft.fuel_level)}L
            </span>
          </div>
          <AnimatedProgressBar
            value={aircraft.fuel_level}
            max={aircraft.fuel_capacity}
            color="var(--fuel-color)"
            height={4}
          />
        </div>

        {/* Service & Weapons */}
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1">
            <Wrench size={10} style={{ color: svcLow ? 'var(--status-maintenance)' : 'var(--text-muted)' }} />
            <span className="font-mono" style={{ color: svcLow ? 'var(--status-maintenance)' : 'var(--text-secondary)' }}>
              {Math.round(aircraft.hours_until_service)}h
            </span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            {aircraft.weapon_loadout.missiles > 0 && (
              <span className="flex items-center gap-0.5">
                <Crosshair size={9} style={{ color: 'var(--weapons-color)' }} />
                <span className="font-mono">{aircraft.weapon_loadout.missiles}</span>
              </span>
            )}
            {aircraft.weapon_loadout.bombs > 0 && (
              <span className="flex items-center gap-0.5">
                <Bomb size={9} style={{ color: 'var(--weapons-color)' }} />
                <span className="font-mono">{aircraft.weapon_loadout.bombs}</span>
              </span>
            )}
            {aircraft.weapon_loadout.pods > 0 && (
              <span className="flex items-center gap-0.5">
                <Scan size={9} style={{ color: 'var(--ue-color)' }} />
                <span className="font-mono">{aircraft.weapon_loadout.pods}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        {aircraft.status === 'HANGAR' && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrep(aircraft.id); }}
            className="shimmer-btn relative overflow-hidden w-full mt-2.5 py-1.5 rounded-md font-mono text-[11px] font-semibold transition-all"
            style={{
              background: 'rgba(234, 179, 8, 0.15)',
              color: 'var(--status-prep)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
            }}
          >
            <span className="shimmer-sweep" style={{
              position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(234,179,8,0.1), transparent)',
              animation: 'shimmerSweep 3s ease-in-out infinite',
            }} />
            <span className="relative z-10">PREP</span>
          </button>
        )}
        {aircraft.status === 'MISSION_CAPABLE' && (
          <div className="flex items-center justify-center mt-2.5 gap-1">
            <Shield size={12} style={{ color: 'var(--status-ready)' }} />
            <span className="font-mono text-[10px] font-semibold animate-pulse" style={{ color: 'var(--status-ready)' }}>
              MISSION READY
            </span>
          </div>
        )}
      </div>
    </GlowCard>
  );
}
