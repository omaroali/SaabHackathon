import { X, Fuel, Crosshair, Bomb, Scan, Wrench, Clock, Plane, Shield, Activity } from 'lucide-react';

const STATUS_LABEL = {
  HANGAR: 'In Hangar',
  PRE_FLIGHT: 'Pre-Flight Preparation',
  MISSION_CAPABLE: 'Mission Capable',
  ON_MISSION: 'On Mission',
  POST_FLIGHT: 'Post-Flight',
  MAINTENANCE: 'Under Maintenance',
};

export default function AircraftDetail({ aircraft, onClose, onPrep, onArm }) {
  if (!aircraft) return null;
  const fuelPct = (aircraft.fuel_level / aircraft.fuel_capacity) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div
        className="glass-panel rounded-2xl p-6 w-full max-w-md animate-fade-in-up"
        onClick={e => e.stopPropagation()}
        style={{ border: '1px solid var(--border-accent)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <Plane size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-mono text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {aircraft.id}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{aircraft.display_name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Status */}
        <div className="rounded-lg p-3 mb-4" style={{ background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>STATUS</span>
            <span className="font-mono text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {STATUS_LABEL[aircraft.status]}
            </span>
          </div>
          {aircraft.status === 'MAINTENANCE' && aircraft.maintenance && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Type</span>
                  <p className="font-mono" style={{ color: 'var(--text-primary)' }}>{aircraft.maintenance.type}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Facility</span>
                  <p className="font-mono" style={{ color: 'var(--text-primary)' }}>{aircraft.maintenance.facility}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Time Left</span>
                  <p className="font-mono" style={{ color: 'var(--status-maintenance)' }}>
                    {aircraft.maintenance.hours_remaining < 999 ? `${aircraft.maintenance.hours_remaining.toFixed(1)}h` : 'GROUNDED'}
                  </p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>UE Required</span>
                  <p className="font-mono" style={{ color: aircraft.maintenance.requires_ue ? 'var(--ue-color)' : 'var(--text-secondary)' }}>
                    {aircraft.maintenance.requires_ue ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-lg p-3" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Fuel size={12} style={{ color: 'var(--fuel-color)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>FUEL</span>
            </div>
            <p className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
              {Math.round(aircraft.fuel_level)}L / {aircraft.fuel_capacity}L
            </p>
            <div className="w-full rounded-full h-1.5 mt-1.5" style={{ background: 'var(--bg-secondary)' }}>
              <div className="rounded-full h-1.5 transition-all"
                style={{ width: `${fuelPct}%`, backgroundColor: 'var(--fuel-color)' }} />
            </div>
          </div>

          <div className="rounded-lg p-3" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Activity size={12} style={{ color: 'var(--personnel-color)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>FLIGHT HOURS</span>
            </div>
            <p className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
              {aircraft.total_flight_hours.toFixed(1)}h
            </p>
          </div>

          <div className="rounded-lg p-3" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Wrench size={12} style={{ color: aircraft.hours_until_service < 15 ? 'var(--status-maintenance)' : 'var(--text-muted)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>NEXT SERVICE</span>
            </div>
            <p className="font-mono text-sm" style={{
              color: aircraft.hours_until_service < 15 ? 'var(--status-maintenance)' : 'var(--text-primary)'
            }}>
              {Math.round(aircraft.hours_until_service)}h
            </p>
          </div>

          <div className="rounded-lg p-3" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Crosshair size={12} style={{ color: 'var(--weapons-color)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>WEAPONS</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-primary)' }}>
              <span className="flex items-center gap-0.5"><Crosshair size={10} />{aircraft.weapon_loadout.missiles}</span>
              <span className="flex items-center gap-0.5"><Bomb size={10} />{aircraft.weapon_loadout.bombs}</span>
              <span className="flex items-center gap-0.5"><Scan size={10} />{aircraft.weapon_loadout.pods}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {aircraft.status === 'HANGAR' && (
            <button onClick={() => { onPrep(aircraft.id); onClose(); }}
              className="flex-1 py-2 rounded-lg font-mono text-xs font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--status-prep), #ca8a04)',
                color: '#000',
              }}>
              Start Pre-Flight Prep
            </button>
          )}
          {aircraft.status === 'MISSION_CAPABLE' && (
            <button onClick={() => { onArm(aircraft.id); onClose(); }}
              className="flex-1 py-2 rounded-lg font-mono text-xs font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, var(--status-ready), #15803d)',
                color: '#fff',
              }}>
              Arm Aircraft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
