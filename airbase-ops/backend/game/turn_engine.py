"""
Turn execution logic. Each turn = 1 hour of game time.

Turn sequence:
1. Process aircraft currently ON_MISSION
2. Process aircraft in PRE_FLIGHT
3. Process aircraft in POST_FLIGHT
4. Process aircraft in MAINTENANCE
5. Launch missions that are due this hour
6. Consume resources (fuel for flying, refuel on ground)
7. Handle personnel shifts
8. Advance time
9. Auto-prep idle aircraft for upcoming missions
"""
import random
import math
from models.game_state import GameState, GameEvent, Phase
from models.aircraft import Aircraft, AircraftStatus
from models.mission import Mission, MissionStatus
from game.dice import (
    pre_flight_check,
    post_flight_check,
    weapon_loss_roll,
    maintenance_time_variance,
)
from game.maintenance import enter_maintenance, complete_maintenance, process_ue_cycles
from game.resource_manager import (
    refuel_aircraft,
    consume_fuel_in_flight,
    FUEL_TAKEOFF_COST,
)
from scenarios.default_scenario import CAMPAIGN_DAYS

TIME_STEP_HOURS = 1.0
PRE_FLIGHT_DURATION_HOURS = 4.0
POST_FLIGHT_DURATION_HOURS = 6.0


def _event(state: GameState, message: str, severity: str = "info", aircraft_id: str | None = None) -> GameEvent:
    return GameEvent(
        turn=state.current_turn,
        hour=state.current_hour,
        day=state.current_day,
        message=message,
        severity=severity,
        aircraft_id=aircraft_id,
    )


def execute_turn(state: GameState) -> None:
    """Execute one turn (1 hour). Mutates state in-place."""
    state.turn_results = []

    # --- Step 1: Process ON_MISSION aircraft ---
    for ac in state.aircraft:
        if ac.status != AircraftStatus.ON_MISSION:
            continue
        ac.mission_hours_remaining -= TIME_STEP_HOURS
        ac.total_flight_hours += TIME_STEP_HOURS
        ac.hours_until_service -= TIME_STEP_HOURS
        warning = consume_fuel_in_flight(ac, TIME_STEP_HOURS)
        if warning:
            ev = _event(state, warning, "critical", ac.id)
            state.turn_results.append(ev)
            state.event_log.append(ev)
        if ac.mission_hours_remaining <= 0:
            ac.status = AircraftStatus.POST_FLIGHT
            ac.post_flight_hours_remaining = POST_FLIGHT_DURATION_HOURS
            ac.assigned_mission_id = None
            # Mark mission completed
            if state.current_ato:
                for m in state.current_ato.missions:
                    if ac.id in m.assigned_aircraft_ids:
                        m.assigned_aircraft_ids.remove(ac.id)
                        if not m.assigned_aircraft_ids and m.status == MissionStatus.IN_PROGRESS:
                            m.status = MissionStatus.COMPLETED
                            ev = _event(state, f"Mission {m.id} completed", "success")
                            state.turn_results.append(ev)
                            state.event_log.append(ev)
            ev = _event(state, f"Aircraft {ac.id} returned from mission", "info", ac.id)
            state.turn_results.append(ev)
            state.event_log.append(ev)

    # --- Step 2: Process PRE_FLIGHT aircraft ---
    for ac in state.aircraft:
        if ac.status != AircraftStatus.PRE_FLIGHT:
            continue
        ac.pre_flight_hours_remaining -= TIME_STEP_HOURS
        if ac.pre_flight_hours_remaining <= 0:
            ok, maint_info = pre_flight_check()
            if ok:
                ac.status = AircraftStatus.MISSION_CAPABLE
                ev = _event(state, f"Aircraft {ac.id} passed pre-flight checks — mission capable", "success", ac.id)
            else:
                msg = enter_maintenance(ac, maint_info, state.resources)
                severity = "critical" if "GROUNDED" in msg else "warning"
                ev = _event(state, msg, severity, ac.id)
            state.turn_results.append(ev)
            state.event_log.append(ev)

    # --- Step 3: Process POST_FLIGHT aircraft ---
    for ac in state.aircraft:
        if ac.status != AircraftStatus.POST_FLIGHT:
            continue
        ac.post_flight_hours_remaining -= TIME_STEP_HOURS
        if ac.post_flight_hours_remaining <= 0:
            # Weapon loss roll
            if ac.weapon_loadout.missiles > 0:
                loss = weapon_loss_roll()
                lost_missiles = math.ceil(ac.weapon_loadout.missiles * loss)
                ac.weapon_loadout.missiles = max(0, ac.weapon_loadout.missiles - lost_missiles)
                ev = _event(state, f"Aircraft {ac.id} weapons expenditure: {lost_missiles} missiles consumed", "info", ac.id)
                state.turn_results.append(ev)
                state.event_log.append(ev)

            if ac.weapon_loadout.bombs > 0:
                loss = weapon_loss_roll()
                lost_bombs = math.ceil(ac.weapon_loadout.bombs * loss)
                ac.weapon_loadout.bombs = max(0, ac.weapon_loadout.bombs - lost_bombs)

            ok, maint_info = post_flight_check()
            if ok:
                ac.status = AircraftStatus.MISSION_CAPABLE
                ev = _event(state, f"Aircraft {ac.id} post-flight OK — mission capable", "success", ac.id)
            else:
                msg = enter_maintenance(ac, maint_info, state.resources)
                severity = "critical" if "GROUNDED" in msg else "warning"
                ev = _event(state, msg, severity, ac.id)
            state.turn_results.append(ev)
            state.event_log.append(ev)

    # --- Step 4: Process MAINTENANCE aircraft ---
    crews_available = state.personnel.maintenance_crews_on_duty
    crews_used = 0
    for ac in state.aircraft:
        if ac.status != AircraftStatus.MAINTENANCE or ac.maintenance is None:
            continue
        if ac.maintenance.hours_remaining >= 999:
            # Grounded, waiting for UE
            if state.resources.exchange_units > 0:
                state.resources.exchange_units -= 1
                ac.maintenance.hours_remaining = ac.maintenance.total_hours
                ev = _event(state, f"UE now available for {ac.id} — maintenance can proceed", "info", ac.id)
                state.turn_results.append(ev)
                state.event_log.append(ev)
            continue
        if crews_used >= crews_available:
            continue  # No available crews
        crews_used += 1
        ac.maintenance.hours_remaining -= TIME_STEP_HOURS
        if ac.maintenance.hours_remaining <= 0:
            variance = maintenance_time_variance()
            if variance > 1.0:
                extra = ac.maintenance.total_hours * (variance - 1.0)
                ac.maintenance.hours_remaining = extra
                ev = _event(state, f"Aircraft {ac.id} maintenance delayed — extra {extra:.1f}h needed (T++)", "warning", ac.id)
                state.turn_results.append(ev)
                state.event_log.append(ev)
            else:
                msg = complete_maintenance(ac, state.resources)
                ev = _event(state, msg, "success", ac.id)
                state.turn_results.append(ev)
                state.event_log.append(ev)

    # --- Step 5: Launch scheduled missions ---
    if state.current_ato and state.runway_damaged_hours <= 0:
        for mission in state.current_ato.missions:
            if not (state.current_hour <= mission.scheduled_hour < state.current_hour + TIME_STEP_HOURS):
                continue
            if mission.status not in (MissionStatus.AIRCRAFT_ASSIGNED, MissionStatus.PENDING):
                continue

            # Realism: Missions must be planned at least 24h in advance
            if not mission.is_planned:
                mission.status = MissionStatus.FAILED
                ev = _event(state, f"Mission {mission.id} FAILED — No approved flight plan (planning deadline missed)", "critical")
                state.turn_results.append(ev)
                state.event_log.append(ev)
                continue

            if mission.status == MissionStatus.PENDING and not mission.assigned_aircraft_ids:
                mission.status = MissionStatus.FAILED
                ev = _event(state, f"Mission {mission.id} FAILED — no aircraft assigned", "critical")
                state.turn_results.append(ev)
                state.event_log.append(ev)
                continue

            launched = []
            not_ready = []
            for ac_id in list(mission.assigned_aircraft_ids):
                ac = next((a for a in state.aircraft if a.id == ac_id), None)
                if ac is None:
                    continue
                if ac.status != AircraftStatus.MISSION_CAPABLE:
                    not_ready.append(ac_id)
                    ev = _event(state, f"Aircraft {ac_id} not ready for mission {mission.id} — skipping", "warning", ac_id)
                    state.turn_results.append(ev)
                    state.event_log.append(ev)
                    continue
                # Launch
                ac.status = AircraftStatus.ON_MISSION
                ac.mission_hours_remaining = mission.duration_hours
                ac.assigned_mission_id = mission.id
                ac.fuel_level = max(0, ac.fuel_level - FUEL_TAKEOFF_COST)
                launched.append(ac_id)
                ev = _event(state, f"Aircraft {ac_id} launched on {mission.type.value} mission {mission.id}", "info", ac_id)
                state.turn_results.append(ev)
                state.event_log.append(ev)

            for ac_id in not_ready:
                if ac_id in mission.assigned_aircraft_ids:
                    mission.assigned_aircraft_ids.remove(ac_id)

            if len(launched) >= mission.required_aircraft:
                mission.status = MissionStatus.IN_PROGRESS
                ev = _event(state, f"Mission {mission.id} launched with {len(launched)} aircraft", "success")
                state.turn_results.append(ev)
                state.event_log.append(ev)
            elif launched:
                mission.status = MissionStatus.IN_PROGRESS
                ev = _event(state, f"Mission {mission.id} launched understaffed ({len(launched)}/{mission.required_aircraft})", "warning")
                state.turn_results.append(ev)
                state.event_log.append(ev)
            else:
                mission.status = MissionStatus.FAILED
                ev = _event(state, f"Mission {mission.id} FAILED — no aircraft could launch", "critical")
                state.turn_results.append(ev)
                state.event_log.append(ev)

    # --- Step 6: Resource management ---
    # Refuel on-ground aircraft
    for ac in state.aircraft:
        if ac.status in (AircraftStatus.MISSION_CAPABLE, AircraftStatus.HANGAR):
            refuel_aircraft(ac, state.resources, TIME_STEP_HOURS)

    # UE cycles at hour 0
    if abs(state.current_hour) < 1e-9:
        ue_messages = process_ue_cycles(state.resources)
        for msg in ue_messages:
            ev = _event(state, msg, "info")
            state.turn_results.append(ev)
            state.event_log.append(ev)

    # --- Step 7: Personnel ---
    state.personnel.shift_hours_remaining -= TIME_STEP_HOURS
    if state.personnel.shift_hours_remaining <= 0:
        state.personnel.maintenance_crews_on_duty = (
            state.personnel.maintenance_crews_total - state.personnel.maintenance_crews_on_duty
        )
        state.personnel.shift_hours_remaining = 8.0
        ev = _event(state, f"Shift change — {state.personnel.maintenance_crews_on_duty} maintenance crews now on duty", "info")
        state.turn_results.append(ev)
        state.event_log.append(ev)

    # Runway repair countdown
    if state.runway_damaged_hours > 0:
        state.runway_damaged_hours -= TIME_STEP_HOURS
        if state.runway_damaged_hours <= 0:
            ev = _event(state, "Runway repairs complete — operations resuming", "success")
            state.turn_results.append(ev)
            state.event_log.append(ev)

    # --- Step 8: Advance time ---
    previous_hour = state.current_hour
    state.current_hour += TIME_STEP_HOURS
    state.current_turn += 1

    if state.current_hour >= 24:
        state.current_hour = 0
        state.current_day += 1
        state.phase = GameState.phase_for_day(state.current_day)
        ev = _event(state, f"Day {state.current_day} begins — Phase: {state.phase.value}", "info")
        state.turn_results.append(ev)
        state.event_log.append(ev)

        if state.current_day > CAMPAIGN_DAYS:
            state.is_game_over = True
            ev = _event(state, f"Scenario complete! {CAMPAIGN_DAYS}-day exercise finished.", "success")
            state.turn_results.append(ev)
            state.event_log.append(ev)

    # --- Day 4 CM Attack Event ---
    if state.current_day == 4 and previous_hour < 12 <= state.current_hour:
        _cm_attack_event(state)

    # --- Step 9: Auto-prep ---
    if state.current_ato:
        upcoming_needs = sum(
            m.required_aircraft - len(m.assigned_aircraft_ids)
            for m in state.current_ato.missions
            if m.status in (MissionStatus.PENDING, MissionStatus.AIRCRAFT_ASSIGNED)
        )
        hangar_aircraft = [ac for ac in state.aircraft if ac.status == AircraftStatus.HANGAR and ac.assigned_mission_id is None]
        for ac in hangar_aircraft[:max(0, upcoming_needs)]:
            ac.status = AircraftStatus.PRE_FLIGHT
            ac.pre_flight_hours_remaining = PRE_FLIGHT_DURATION_HOURS
            ev = _event(state, f"Aircraft {ac.id} auto-starting pre-flight preparation", "info", ac.id)
            state.turn_results.append(ev)
            state.event_log.append(ev)


def _cm_attack_event(state: GameState) -> None:
    """Day 4 cruise missile attack event."""
    ev = _event(state, "BASE UNDER CRUISE MISSILE ATTACK! Runway damaged — 8h repair needed!", "critical")
    state.turn_results.append(ev)
    state.event_log.append(ev)
    state.runway_damaged_hours = 8

    # All PRE_FLIGHT aircraft reset to HANGAR
    for ac in state.aircraft:
        if ac.status == AircraftStatus.PRE_FLIGHT:
            ac.status = AircraftStatus.HANGAR
            ac.pre_flight_hours_remaining = 0
            ev = _event(state, f"Aircraft {ac.id} prep interrupted by attack — returned to hangar", "warning", ac.id)
            state.turn_results.append(ev)
            state.event_log.append(ev)

    # 2 random HANGAR aircraft take light damage
    hangar_ids = [ac for ac in state.aircraft if ac.status == AircraftStatus.HANGAR]
    damaged = random.sample(hangar_ids, min(2, len(hangar_ids)))
    for ac in damaged:
        from models.aircraft import MaintenanceInfo, MaintenanceType
        ac.status = AircraftStatus.MAINTENANCE
        ac.maintenance = MaintenanceInfo(
            type=MaintenanceType.COMPOSITE_REPAIR,
            total_hours=240.0,
            hours_remaining=240.0,
            requires_ue=False,
            facility="Battle Damage Repair"
        )
        ev = _event(state, f"Aircraft {ac.id} damaged in attack — 240h (10-day) repair needed", "critical", ac.id)
        state.turn_results.append(ev)
        state.event_log.append(ev)
