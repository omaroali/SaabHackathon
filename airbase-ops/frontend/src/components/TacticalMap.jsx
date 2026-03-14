import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plane, MapPinned, TimerReset, Route, Crosshair, ShieldAlert } from 'lucide-react';
import { formatClockTime, formatHours, formatInteger } from '../lib/format';

const baseIcon = L.divIcon({
  html: `
    <div style="background: rgba(59, 130, 246, 0.18); border: 2px solid #3b82f6; border-radius: 999px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(59, 130, 246, 0.45);">
      <div style="background: #60a5fa; width: 9px; height: 9px; border-radius: 999px;"></div>
    </div>
  `,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function createAircraftIcon(color = '#22c55e', active = false) {
  const ring = active ? 'box-shadow: 0 0 0 2px rgba(255,255,255,0.2), 0 0 18px rgba(255,255,255,0.18);' : '';
  return L.divIcon({
    html: `
      <div style="width: 26px; height: 26px; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: rgba(10,11,14,0.85); border: 1px solid ${color}; color: ${color}; ${ring}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.7l-1.6 4.7 6.1 2.3-3.6 3.6-3.8-1-1.6 1.6 5.5 1.5 1.5 5.5 1.6-1.6-1-3.8 3.6-3.6 2.3 6.1c.5-.2.8-.6.7-1.1z"/>
        </svg>
      </div>
    `,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function MapAdjuster({ baseLat, baseLon, missions }) {
  const map = useMap();
  const lastMissionSignatureRef = useRef('');

  useEffect(() => {
    const missionSignature = missions
      .map((mission) => `${mission.id}:${mission.status}:${mission.target_lat}:${mission.target_lon}`)
      .join('|');
    if (missionSignature === lastMissionSignatureRef.current) {
      return;
    }
    lastMissionSignatureRef.current = missionSignature;

    let minLat = baseLat;
    let maxLat = baseLat;
    let minLon = baseLon;
    let maxLon = baseLon;

    missions.forEach((mission) => {
      if (!mission.target_lat || !mission.target_lon) return;
      minLat = Math.min(minLat, mission.target_lat);
      maxLat = Math.max(maxLat, mission.target_lat);
      minLon = Math.min(minLon, mission.target_lon);
      maxLon = Math.max(maxLon, mission.target_lon);
    });

    const bounds = L.latLngBounds(
      [minLat - 0.45, minLon - 0.55],
      [maxLat + 0.45, maxLon + 0.55],
    );

    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 8, animate: true, duration: 1.1 });
  }, [baseLat, baseLon, map, missions]);

  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function MapFocus({ focusPoint }) {
  const map = useMap();
  useEffect(() => {
    if (!focusPoint) return;
    map.flyTo([focusPoint.lat, focusPoint.lon], focusPoint.zoom || map.getZoom(), {
      animate: true,
      duration: 0.9,
    });
  }, [focusPoint, map]);
  return null;
}

function hashCode(value) {
  return String(value || '').split('').reduce((acc, ch) => ((acc * 31) + ch.charCodeAt(0)) >>> 0, 7);
}

function deterministicOffset(key, range) {
  const hash = hashCode(key);
  return (((hash % 1000) / 999) - 0.5) * range;
}

function missionColor(type) {
  if (type === 'QRA') return '#ef4444';
  if (type === 'RECCE') return '#eab308';
  if (type === 'ATTACK') return '#f97316';
  return '#38bdf8';
}

function aircraftColor(status) {
  if (status === 'MISSION_CAPABLE') return '#22c55e';
  if (status === 'ON_MISSION') return '#38bdf8';
  if (status === 'POST_FLIGHT') return '#f59e0b';
  if (status === 'PRE_FLIGHT') return '#eab308';
  if (status === 'MAINTENANCE') return '#ef4444';
  return '#94a3b8';
}

function findMissionForAircraft(gameState, aircraft) {
  const missions = gameState.current_ato?.missions || [];
  if (aircraft.assigned_mission_id) {
    const direct = missions.find((mission) => mission.id === aircraft.assigned_mission_id);
    if (direct) return direct;
  }
  return missions.find((mission) => mission.assigned_aircraft_ids.includes(aircraft.id)) || null;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function statusLabel(status) {
  return String(status || '').replace(/_/g, ' ');
}

function buildAircraftTrack(gameState, aircraft) {
  const mission = findMissionForAircraft(gameState, aircraft);
  const baseLat = gameState.base_lat || 56.256;
  const baseLon = gameState.base_lon || 15.268;

  let lat = baseLat + deterministicOffset(`${aircraft.id}-lat`, 0.06);
  let lon = baseLon + deterministicOffset(`${aircraft.id}-lon`, 0.09);
  let phaseLabel = 'At base';
  let etaToDestination = null;

  if (mission?.target_lat && mission?.target_lon) {
    if (aircraft.status === 'ON_MISSION') {
      const duration = mission.duration_hours || 2;
      const progress = 1 - (aircraft.mission_hours_remaining / duration);
      const outboundProgress = progress <= 0.5 ? progress * 2 : 1 - ((progress - 0.5) * 2);

      lat = baseLat + (mission.target_lat - baseLat) * outboundProgress;
      lon = baseLon + (mission.target_lon - baseLon) * outboundProgress;
      lat += deterministicOffset(`${aircraft.id}-mission-lat`, 0.025);
      lon += deterministicOffset(`${aircraft.id}-mission-lon`, 0.03);

      if (progress <= 0.5) {
        phaseLabel = 'Outbound';
        etaToDestination = Math.max(0, aircraft.mission_hours_remaining - (duration / 2));
      } else {
        phaseLabel = 'Returning';
      }
    } else if (aircraft.status === 'POST_FLIGHT') {
      phaseLabel = 'Recovery';
    } else if (mission.assigned_aircraft_ids.includes(aircraft.id)) {
      phaseLabel = 'Assigned on ground';
      const prepDelay = aircraft.status === 'HANGAR' ? 1 : aircraft.status === 'PRE_FLIGHT' ? aircraft.pre_flight_hours_remaining : 0;
      const launchDelay = Math.max(0, (mission.scheduled_hour ?? gameState.current_hour) - gameState.current_hour);
      etaToDestination = launchDelay + prepDelay + ((mission.duration_hours || 2) / 2);
    }
  }

  return {
    ...aircraft,
    mission,
    lat,
    lon,
    phaseLabel,
    etaToDestination,
    color: aircraftColor(aircraft.status),
  };
}

export default function TacticalMap({ gameState, onSelectAircraft }) {
  const [selectedAircraftId, setSelectedAircraftId] = useState(null);
  const [selectedMissionId, setSelectedMissionId] = useState(null);

  if (!gameState) return null;

  const baseLat = gameState.base_lat || 56.256;
  const baseLon = gameState.base_lon || 15.268;
  const allMissions = gameState.current_ato?.missions || [];
  const activeMissions = useMemo(
    () => allMissions.filter((mission) => mission.status !== 'FAILED' && mission.status !== 'COMPLETED'),
    [allMissions],
  );
  const tracks = useMemo(
    () => gameState.aircraft.map((aircraft) => buildAircraftTrack(gameState, aircraft)),
    [gameState],
  );
  const visibleTracks = useMemo(
    () => tracks.filter((aircraft) => aircraft.status !== 'HANGAR' && aircraft.status !== 'MAINTENANCE'),
    [tracks],
  );

  const selectedAircraft = tracks.find((aircraft) => aircraft.id === selectedAircraftId) || null;
  const selectedMission = activeMissions.find((mission) => mission.id === selectedMissionId)
    || selectedAircraft?.mission
    || null;

  const focusPoint = selectedAircraft
    ? { lat: selectedAircraft.lat, lon: selectedAircraft.lon, zoom: 8 }
    : selectedMission?.target_lat && selectedMission?.target_lon
      ? { lat: selectedMission.target_lat, lon: selectedMission.target_lon, zoom: 7 }
      : null;

  const missionDistance = selectedMission?.target_lat && selectedMission?.target_lon
    ? distanceKm(baseLat, baseLon, selectedMission.target_lat, selectedMission.target_lon)
    : null;

  const selectedMissionAircraft = selectedMission
    ? selectedMission.assigned_aircraft_ids
      .map((aircraftId) => tracks.find((aircraft) => aircraft.id === aircraftId))
      .filter(Boolean)
    : [];

  return (
    <div className="absolute inset-0 bg-[#0f1014]">
      <MapContainer
        center={[baseLat, baseLon]}
        zoom={6}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          opacity={0.82}
        />

        <MapResizer />
        <MapAdjuster baseLat={baseLat} baseLon={baseLon} missions={activeMissions} />
        <MapFocus focusPoint={focusPoint} />

        <Marker position={[baseLat, baseLon]} icon={baseIcon}>
          <Tooltip direction="right" offset={[14, 0]} opacity={0.92} permanent className="bg-transparent border-0 text-blue-300 font-mono text-xs shadow-none">
            F 17 KALLINGE
          </Tooltip>
        </Marker>

        {activeMissions.map((mission) => {
          if (!mission.target_lat || !mission.target_lon) return null;

          const color = missionColor(mission.type);
          const selected = mission.id === selectedMission?.id;
          const assignedCount = mission.assigned_aircraft_ids.length;

          return (
            <Fragment key={mission.id}>
              <Polyline
                positions={[[baseLat, baseLon], [mission.target_lat, mission.target_lon]]}
                pathOptions={{
                  color,
                  weight: selected ? 3 : 1.5,
                  dashArray: selected ? '8 4' : '5 8',
                  opacity: selected ? 0.95 : 0.35,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedMissionId(mission.id);
                    setSelectedAircraftId(null);
                  },
                }}
              />
              <Circle
                center={[mission.target_lat, mission.target_lon]}
                radius={mission.type === 'QRA' ? 30000 : 42000}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: selected ? 0.18 : 0.08,
                  weight: selected ? 2 : 1,
                  dashArray: mission.type === 'QRA' ? undefined : '4 6',
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedMissionId(mission.id);
                    setSelectedAircraftId(null);
                  },
                }}
              >
                <Tooltip direction="top" opacity={0.9} className="bg-slate-950 border border-slate-700 text-slate-200 font-mono text-[10px]">
                  <strong style={{ color }}>{mission.id}</strong><br />
                  {mission.area_name}<br />
                  {assignedCount}/{mission.required_aircraft} assigned
                </Tooltip>
              </Circle>
            </Fragment>
          );
        })}

        {visibleTracks.map((aircraft) => {
          const isActive = aircraft.id === selectedAircraft?.id;
          const mission = aircraft.mission;
          const shouldDrawTrack = Boolean(mission?.target_lat && mission?.target_lon);

          return (
            <Fragment key={aircraft.id}>
              {shouldDrawTrack && isActive && (
                <Polyline
                  positions={[[baseLat, baseLon], [mission.target_lat, mission.target_lon]]}
                  pathOptions={{
                    color: aircraft.color,
                    weight: 2,
                    opacity: 0.85,
                  }}
                />
              )}
              <Marker
                position={[aircraft.lat, aircraft.lon]}
                icon={createAircraftIcon(aircraft.color, isActive)}
                eventHandlers={{
                  click: () => {
                    setSelectedAircraftId(aircraft.id);
                    setSelectedMissionId(mission?.id || null);
                  },
                }}
              >
                <Tooltip direction="bottom" offset={[0, 12]} opacity={0.92} className="bg-slate-950 border border-slate-700 text-slate-200 font-mono text-[10px]">
                  <strong style={{ color: aircraft.color }}>{aircraft.id}</strong><br />
                  {statusLabel(aircraft.status)}<br />
                  {mission ? `Mission ${mission.id}` : 'Unassigned'}
                </Tooltip>
              </Marker>
            </Fragment>
          );
        })}
      </MapContainer>

      <div className="absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: 'rgba(10,11,14,0.8)', border: '1px solid rgba(148,163,184,0.18)', backdropFilter: 'blur(14px)' }}>
        <MapPinned size={14} style={{ color: '#38bdf8' }} />
        <div className="font-mono text-[10px] tracking-wider" style={{ color: '#cbd5e1' }}>
          TACTICAL MAP
        </div>
        <div className="font-mono text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(56,189,248,0.12)', color: '#7dd3fc' }}>
          {activeMissions.length} active routes
        </div>
        <div className="font-mono text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(34,197,94,0.12)', color: '#86efac' }}>
          {visibleTracks.length} aircraft shown
        </div>
      </div>

      <div className="absolute right-4 top-4 z-[500] w-[320px] max-w-[calc(100%-2rem)] rounded-2xl overflow-hidden"
        style={{ background: 'rgba(8,10,14,0.84)', border: '1px solid rgba(148,163,184,0.16)', backdropFilter: 'blur(16px)', boxShadow: '0 20px 40px rgba(0,0,0,0.28)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(148,163,184,0.14)' }}>
          <div className="font-mono text-[10px] tracking-[0.24em]" style={{ color: '#94a3b8' }}>
            INTERACTIVE OPS PANEL
          </div>
          <div className="text-sm font-semibold mt-1" style={{ color: '#f8fafc' }}>
            {selectedAircraft ? `Aircraft ${selectedAircraft.id}` : selectedMission ? selectedMission.id : 'Select a route or aircraft'}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {selectedAircraft ? (
            <>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.76)' }}>
                  <div className="text-[9px] font-mono mb-1" style={{ color: '#94a3b8' }}>STATUS</div>
                  <div className="font-semibold" style={{ color: selectedAircraft.color }}>{statusLabel(selectedAircraft.status)}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.76)' }}>
                  <div className="text-[9px] font-mono mb-1" style={{ color: '#94a3b8' }}>FUEL</div>
                  <div className="font-semibold" style={{ color: '#f8fafc' }}>{formatInteger(selectedAircraft.fuel_level)} L</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.76)' }}>
                  <div className="text-[9px] font-mono mb-1" style={{ color: '#94a3b8' }}>MISSION PHASE</div>
                  <div className="font-semibold" style={{ color: '#f8fafc' }}>{selectedAircraft.phaseLabel}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.76)' }}>
                  <div className="text-[9px] font-mono mb-1" style={{ color: '#94a3b8' }}>ETA DEST</div>
                  <div className="font-semibold" style={{ color: '#f8fafc' }}>{formatHours(selectedAircraft.etaToDestination)}</div>
                </div>
              </div>

              {selectedAircraft.mission ? (
                <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(2,6,23,0.72)', border: '1px solid rgba(56,189,248,0.16)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crosshair size={13} style={{ color: missionColor(selectedAircraft.mission.type) }} />
                      <span className="font-mono text-xs font-bold" style={{ color: '#f8fafc' }}>{selectedAircraft.mission.id}</span>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(56,189,248,0.12)', color: '#7dd3fc' }}>
                      {selectedAircraft.mission.type}
                    </span>
                  </div>
                  <div className="text-[11px]" style={{ color: '#cbd5e1' }}>
                    {selectedAircraft.mission.area_name || 'No named target area'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <div style={{ color: '#94a3b8' }}>Scheduled</div>
                      <div style={{ color: '#f8fafc' }}>{formatClockTime(selectedAircraft.mission.scheduled_hour)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#94a3b8' }}>Duration</div>
                      <div style={{ color: '#f8fafc' }}>{formatHours(selectedAircraft.mission.duration_hours)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-3 text-[11px]" style={{ background: 'rgba(2,6,23,0.72)', color: '#cbd5e1' }}>
                  No mission attached. Use Fleet Ops to prep, arm, or reassign this aircraft.
                </div>
              )}

              <button
                onClick={() => onSelectAircraft?.(gameState.aircraft.find((aircraft) => aircraft.id === selectedAircraft.id))}
                className="w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-colors"
                style={{ background: 'rgba(59,130,246,0.18)', color: '#bfdbfe', border: '1px solid rgba(96,165,250,0.28)' }}
              >
                Open Detailed Aircraft Card
              </button>
            </>
          ) : selectedMission ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Route size={14} style={{ color: missionColor(selectedMission.type) }} />
                  <span className="font-mono text-sm font-bold" style={{ color: '#f8fafc' }}>{selectedMission.id}</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(248,250,252,0.06)', color: '#cbd5e1' }}>
                  {selectedMission.type}
                </span>
              </div>

              <div className="text-[12px]" style={{ color: '#cbd5e1' }}>
                {selectedMission.area_name || 'Unnamed target area'}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.76)' }}>
                  <div className="text-[9px] font-mono mb-1" style={{ color: '#94a3b8' }}>TIME ON TARGET</div>
                  <div className="font-semibold" style={{ color: '#f8fafc' }}>{formatClockTime(selectedMission.scheduled_hour)}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.76)' }}>
                  <div className="text-[9px] font-mono mb-1" style={{ color: '#94a3b8' }}>DISTANCE</div>
                  <div className="font-semibold" style={{ color: '#f8fafc' }}>{missionDistance ? `${formatInteger(missionDistance)} km` : 'N/A'}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.76)' }}>
                  <div className="text-[9px] font-mono mb-1" style={{ color: '#94a3b8' }}>PACKAGE</div>
                  <div className="font-semibold" style={{ color: '#f8fafc' }}>{selectedMission.assigned_aircraft_ids.length}/{selectedMission.required_aircraft}</div>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.76)' }}>
                  <div className="text-[9px] font-mono mb-1" style={{ color: '#94a3b8' }}>DURATION</div>
                  <div className="font-semibold" style={{ color: '#f8fafc' }}>{formatHours(selectedMission.duration_hours)}</div>
                </div>
              </div>

              <div className="rounded-xl p-3" style={{ background: 'rgba(2,6,23,0.72)', border: '1px solid rgba(148,163,184,0.12)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <TimerReset size={13} style={{ color: '#7dd3fc' }} />
                  <span className="font-mono text-[10px]" style={{ color: '#94a3b8' }}>ASSIGNED AIRCRAFT</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMissionAircraft.length > 0 ? selectedMissionAircraft.map((aircraft) => (
                    <button
                      key={aircraft.id}
                      onClick={() => {
                        setSelectedAircraftId(aircraft.id);
                        setSelectedMissionId(selectedMission.id);
                      }}
                      className="px-2.5 py-1 rounded-full font-mono text-[10px]"
                      style={{ background: 'rgba(56,189,248,0.1)', color: '#bae6fd', border: '1px solid rgba(56,189,248,0.2)' }}
                    >
                      {aircraft.id}
                    </button>
                  )) : (
                    <span className="text-[11px]" style={{ color: '#94a3b8' }}>No aircraft assigned</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl p-4" style={{ background: 'rgba(2,6,23,0.72)', color: '#cbd5e1' }}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={14} style={{ color: '#f59e0b' }} />
                <span className="font-mono text-xs font-bold">Use the map as an operations board</span>
              </div>
              <div className="text-[11px] leading-5">
                Click a mission zone to inspect route distance, assigned package, and time-on-target.
                Click an aircraft to inspect its live track, mission phase, and ETA to destination.
                Hangar and maintenance aircraft are hidden here to keep the map clear; use Fleet Ops to manage them.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] flex items-center gap-2 rounded-xl px-3 py-2"
        style={{ background: 'rgba(10,11,14,0.74)', border: '1px solid rgba(148,163,184,0.16)', backdropFilter: 'blur(12px)' }}>
        <Plane size={13} style={{ color: '#22c55e' }} />
        <span className="font-mono text-[10px]" style={{ color: '#cbd5e1' }}>
          Click any aircraft or mission route for live details
        </span>
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: 'inset 0 0 150px 50px rgba(15, 16, 20, 1)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(15, 16, 20, 0.38) 100%)',
      }} />
    </div>
  );
}
