import { useMemo } from 'react';
import {
  ArrowRight, Plane, Target, Clock, Wrench, Fuel,
  AlertTriangle, CheckCircle, ChevronRight
} from 'lucide-react';
import { formatClockTime, formatHoursUntil } from '../lib/format';

/**
 * Smart "What to do next" hint bar — analyzes game state and
 * shows the most useful next action the player should take.
 */
export default function NextActionHint({ gameState }) {
  const hint = useMemo(() => {
    if (!gameState || !gameState.current_ato) return null;

    const aircraft = gameState.aircraft;
    const missions = gameState.current_ato.missions;

    const inHangar = aircraft.filter(a => a.status === 'HANGAR');
    const ready = aircraft.filter(a => a.status === 'MISSION_CAPABLE');
    const prepping = aircraft.filter(a => a.status === 'PRE_FLIGHT');

    const pendingMissions = missions.filter(m => m.status === 'PENDING');
    const assignedMissions = missions.filter(m => m.status === 'AIRCRAFT_ASSIGNED');
    const neededAircraft = pendingMissions.reduce((sum, m) => sum + m.required_aircraft, 0);
    const partiallyAssigned = assignedMissions.filter(m =>
      m.assigned_aircraft_ids.length < m.required_aircraft
    );

    // Game over?
    if (gameState.is_game_over) {
      return {
        icon: CheckCircle,
        color: '#22c55e',
        title: 'Scenario Complete!',
        text: 'The 30-day campaign is finished. Review your event log to see how it went.',
        action: null,
      };
    }

    // Low fuel warning
    if (gameState.resources.fuel_storage < 3000) {
      return {
        icon: Fuel,
        color: '#f59e0b',
        title: 'Low Fuel Warning',
        text: `Only ${Math.round(gameState.resources.fuel_storage)}L remaining. Be selective about which missions to fly.`,
        action: null,
      };
    }

    // Pending missions with 0 assigned and ready aircraft available
    if (pendingMissions.length > 0 && ready.length > 0) {
      const nextMission = pendingMissions.sort((a, b) => a.scheduled_hour - b.scheduled_hour)[0];
      const hoursUntil = nextMission.scheduled_hour - gameState.current_hour;
      return {
        icon: Target,
        color: '#ef4444',
        title: 'Assign Aircraft to Missions',
        text: `${pendingMissions.length} mission${pendingMissions.length > 1 ? 's' : ''} need aircraft. Next: ${nextMission.type} at ${formatClockTime(nextMission.scheduled_hour)} (${hoursUntil > 0 ? formatHoursUntil(hoursUntil) : 'now'}). Click "+ Assign" in the ATO panel.`,
        action: 'assign',
      };
    }

    // Partially assigned missions
    if (partiallyAssigned.length > 0) {
      const m = partiallyAssigned[0];
      return {
        icon: Target,
        color: '#eab308',
        title: 'Finish Assigning Aircraft',
        text: `Mission ${m.id} needs ${m.required_aircraft - m.assigned_aircraft_ids.length} more aircraft. ${ready.length > 0 ? 'Click "+ Assign" to add.' : 'Prep more aircraft from the hangar.'}`,
        action: 'assign',
      };
    }

    // Missions need aircraft but none are ready — prep some
    if (pendingMissions.length > 0 && ready.length === 0 && inHangar.length > 0 && prepping.length === 0) {
      return {
        icon: Plane,
        color: '#eab308',
        title: 'Prep Aircraft',
        text: `${pendingMissions.length} missions pending but 0 aircraft ready. Click "PREP" on aircraft in the hangar to start preparing them (takes 4 hours).`,
        action: 'prep',
      };
    }

    // Aircraft are prepping — advance time
    if (prepping.length > 0 && pendingMissions.length > 0) {
      return {
        icon: Clock,
        color: '#3b82f6',
        title: 'Advance Time',
        text: `${prepping.length} aircraft prepping. Click the green "1H" button to advance time and complete preparation.`,
        action: 'advance',
      };
    }

    // All missions assigned, waiting for launch
    if (pendingMissions.length === 0 && assignedMissions.length > 0) {
      const nextLaunch = assignedMissions.sort((a, b) => a.scheduled_hour - b.scheduled_hour)[0];
      const hoursUntil = nextLaunch.scheduled_hour - gameState.current_hour;
      return {
        icon: Clock,
        color: '#22c55e',
        title: 'All Missions Assigned',
        text: `Advance time to launch missions. Next sortie: ${nextLaunch.type} at ${formatClockTime(nextLaunch.scheduled_hour)}${hoursUntil > 0 ? ` (${formatHoursUntil(hoursUntil)}). Use "1D" to skip ahead quickly.` : ' — launching now. Click "1H".'}`,
        action: 'advance',
      };
    }

    // All missions done for the day
    const allDone = missions.every(m => m.status === 'COMPLETED' || m.status === 'FAILED');
    if (allDone) {
      return {
        icon: CheckCircle,
        color: '#22c55e',
        title: 'Day Complete',
        text: 'All missions for today are done. Advance time to proceed to the next day and receive new orders. Use "1D" to skip ahead.',
        action: 'advance',
      };
    }

    // Maintenance aircraft and nothing else to do now
    const inMaint = aircraft.filter(a => a.status === 'MAINTENANCE');
    if (inMaint.length > 0 && inHangar.length === 0 && ready.length === 0) {
      return {
        icon: Wrench,
        color: '#8b5cf6',
        title: 'Waiting for Repairs',
        text: `${inMaint.length} aircraft under maintenance. Advance time to complete repairs. Try "1D" to skip ahead.`,
        action: 'advance',
      };
    }

    // Default — advance time
    return {
      icon: ArrowRight,
      color: 'var(--text-secondary)',
      title: 'Advance Time',
      text: 'Click "1H" or "1D" to progress the simulation forward.',
      action: 'advance',
    };
  }, [gameState]);

  if (!hint) return null;

  const HintIcon = hint.icon;

  return (
    <div className="mx-3 mt-2 rounded-lg px-4 py-2.5 flex items-center gap-3 animate-fade-in-up"
      style={{
        background: `${hint.color}08`,
        border: `1px solid ${hint.color}20`,
      }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${hint.color}15` }}>
        <HintIcon size={16} style={{ color: hint.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold" style={{ color: hint.color }}>
            WHAT TO DO NOW: {hint.title}
          </span>
          <ChevronRight size={10} style={{ color: hint.color, opacity: 0.5 }} />
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {hint.text}
        </p>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
          If you are unsure, open <strong>How to Play</strong> in the top bar for a step-by-step guide.
        </p>
      </div>
    </div>
  );
}
