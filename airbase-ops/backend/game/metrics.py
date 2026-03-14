"""
Deterministic KPI metrics for AirBase Ops.

Four key metrics computed from game state — no randomness, no side effects.
Used by Decision Impact Panel and Compare Mode.
"""
from models.game_state import GameState
from models.aircraft import AircraftStatus
from models.mission import MissionStatus

PLANNING_WINDOW_HOURS = 24.0
PREP_WINDOW_HOURS = 4.0


def compute_metrics(state: GameState) -> dict:
    """
    Compute all four KPIs from current game state.
    Returns dict with: fleet_readiness, mission_throughput, turnaround_delay, risk_score.
    """
    return {
        "fleet_readiness": _fleet_readiness(state),
        "mission_throughput": _mission_throughput(state),
        "turnaround_delay": _turnaround_delay(state),
        "risk_score": _risk_score(state),
    }


def _fleet_readiness(state: GameState) -> float:
    """
    Fleet Readiness % — what fraction of the fleet can fly right now or is flying.

    Formula:
        readiness = (aircraft in MISSION_CAPABLE + ON_MISSION) / total_aircraft * 100

    Interpretation:
        100% = entire fleet can fly
        0%   = no aircraft available
    """
    total = len(state.aircraft)
    if total == 0:
        return 0.0
    ready = sum(
        1 for ac in state.aircraft
        if ac.status in (AircraftStatus.MISSION_CAPABLE, AircraftStatus.ON_MISSION)
    )
    return round(ready / total * 100, 1)


def _mission_throughput(state: GameState) -> int:
    """
    Expected Mission Throughput (next 24 hours).

    Formula:
        Count missions in current ATO where:
        - scheduled_hour is within the next 24 hours of the current day
        - mission is not yet COMPLETED or FAILED
        - enough MISSION_CAPABLE or ON_MISSION (returning) aircraft exist
          to cover required_aircraft across all such missions

    Returns the number of missions likely completable given current fleet.
    Simplified: count launchable missions where assigned + available >= required.
    """
    if not state.current_ato:
        return 0

    # Count currently mission-capable aircraft (available for new assignments)
    available = sum(
        1 for ac in state.aircraft
        if ac.status == AircraftStatus.MISSION_CAPABLE
    )

    # Count aircraft returning within the daily planning window
    returning_soon = sum(
        1 for ac in state.aircraft
        if ac.status == AircraftStatus.ON_MISSION and ac.mission_hours_remaining <= PLANNING_WINDOW_HOURS
    )

    # Aircraft in pre-flight completing within the planning window
    prepping = sum(
        1 for ac in state.aircraft
        if ac.status == AircraftStatus.PRE_FLIGHT and ac.pre_flight_hours_remaining <= PREP_WINDOW_HOURS
    )

    effective_available = available + returning_soon + prepping
    completable = 0

    # Sort missions by priority (lower = higher priority)
    upcoming = [
        m for m in state.current_ato.missions
        if (state.current_hour <= m.scheduled_hour < state.current_hour + PLANNING_WINDOW_HOURS)
        and m.status not in (MissionStatus.COMPLETED, MissionStatus.FAILED, MissionStatus.IN_PROGRESS)
    ]
    upcoming.sort(key=lambda m: m.priority)

    pool = effective_available
    for mission in upcoming:
        already_assigned = len(mission.assigned_aircraft_ids)
        still_needed = max(0, mission.required_aircraft - already_assigned)
        if pool >= still_needed:
            pool -= still_needed
            completable += 1

    return completable


def _turnaround_delay(state: GameState) -> float:
    """
    Average Turnaround Delay (minutes).

    Formula:
        For each non-ready aircraft, compute hours until it could be mission-capable:
        - PRE_FLIGHT: pre_flight_hours_remaining
        - POST_FLIGHT: post_flight_hours_remaining + pre-flight cycle after turnaround
        - MAINTENANCE: maintenance.hours_remaining (capped at 24h for grounded)
        - HANGAR: 4.0 (needs klargoring before flight)

        turnaround_delay = avg(delay_hours) * 60 minutes

    Returns 0 if all aircraft are ready.
    """
    delays = []
    for ac in state.aircraft:
        if ac.status == AircraftStatus.MISSION_CAPABLE or ac.status == AircraftStatus.ON_MISSION:
            continue  # Already ready or flying
        elif ac.status == AircraftStatus.PRE_FLIGHT:
            delays.append(ac.pre_flight_hours_remaining)
        elif ac.status == AircraftStatus.POST_FLIGHT:
            delays.append(ac.post_flight_hours_remaining + PREP_WINDOW_HOURS)
        elif ac.status == AircraftStatus.MAINTENANCE:
            if ac.maintenance:
                # Cap grounded aircraft at 24h for display purposes
                hrs = min(ac.maintenance.hours_remaining, 24.0)
                delays.append(hrs)
            else:
                delays.append(8.0)  # Unknown maintenance — assume most of a work day
        elif ac.status == AircraftStatus.HANGAR:
            delays.append(4.0)

    if not delays:
        return 0.0
    return round(sum(delays) / len(delays) * 60, 0)


def _risk_score(state: GameState) -> int:
    """
    Operational Risk Exposure (0–100 composite).

    Formula (4 equally-weighted components, each 0–25):

    1. Fuel risk (0–25):
       fuel_ratio = fuel_storage / fuel_storage_capacity
       fuel_risk = (1 - fuel_ratio) * 25

    2. UE risk (0–25):
       ue_ratio = exchange_units / 16 (initial max)
       ue_risk = (1 - ue_ratio) * 25

    3. Maintenance burden (0–25):
       maint_ratio = aircraft_in_maintenance / total_aircraft
       maint_risk = maint_ratio * 25

    4. Mission coverage gap (0–25):
       If ATO exists, compute what fraction of upcoming missions (next 24h)
       cannot be staffed with current MISSION_CAPABLE count.
       gap_risk = (unmet_missions / total_upcoming) * 25

    Total risk = sum of all 4 components, capped at 100.
    """
    total_ac = len(state.aircraft)
    if total_ac == 0:
        return 0

    # 1. Fuel risk
    fuel_cap = state.resources.fuel_storage_capacity or 1
    fuel_ratio = state.resources.fuel_storage / fuel_cap
    fuel_risk = (1 - fuel_ratio) * 25

    # 2. UE risk (initial stock = 16)
    ue_ratio = min(state.resources.exchange_units / 16, 1.0)
    ue_risk = (1 - ue_ratio) * 25

    # 3. Maintenance burden
    in_maint = sum(1 for ac in state.aircraft if ac.status == AircraftStatus.MAINTENANCE)
    maint_risk = (in_maint / total_ac) * 25

    # 4. Mission coverage gap
    gap_risk = 0
    if state.current_ato:
        upcoming = [
            m for m in state.current_ato.missions
            if m.status not in (MissionStatus.COMPLETED, MissionStatus.FAILED, MissionStatus.IN_PROGRESS)
            and state.current_hour <= m.scheduled_hour < state.current_hour + PLANNING_WINDOW_HOURS
        ]
        if upcoming:
            available = sum(
                1 for ac in state.aircraft
                if ac.status == AircraftStatus.MISSION_CAPABLE
            )
            total_needed = sum(m.required_aircraft - len(m.assigned_aircraft_ids) for m in upcoming)
            unmet = max(0, total_needed - available)
            gap_ratio = min(unmet / max(total_needed, 1), 1.0)
            gap_risk = gap_ratio * 25

    total = fuel_risk + ue_risk + maint_risk + gap_risk
    return min(round(total), 100)
