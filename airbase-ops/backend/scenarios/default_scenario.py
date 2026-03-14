"""
Default 7-day scenario for AirBase Ops.
Creates the initial game state with 10 Gripen E aircraft and 7 days of ATO.
"""
from models.game_state import GameState, Phase
from models.aircraft import Aircraft, AircraftStatus, WeaponLoadout
from models.resources import BaseResources, PersonnelShift
from models.mission import Mission, MissionType, MissionStatus, DailyATO


def create_initial_fleet() -> list[Aircraft]:
    """Create the initial fleet of 10 Gripen E aircraft."""
    fleet_data = [
        ("GE-01", "Gripen E #01", 93),
        ("GE-02", "Gripen E #02", 67),
        ("GE-03", "Gripen E #03", 20),
        ("GE-04", "Gripen E #04", 54),
        ("GE-05", "Gripen E #05", 10),
        ("GE-06", "Gripen E #06", 84),
        ("GE-07", "Gripen E #07", 41),
        ("GE-08", "Gripen E #08", 78),
        ("GE-09", "Gripen E #09", 36),
        ("GE-10", "Gripen E #10", 29),
    ]
    return [
        Aircraft(
            id=ac_id,
            display_name=name,
            status=AircraftStatus.HANGAR,
            fuel_level=1000.0,
            fuel_capacity=1000.0,
            hours_until_service=float(hours),
            weapon_loadout=WeaponLoadout(),
        )
        for ac_id, name, hours in fleet_data
    ]


def create_ato_day1() -> DailyATO:
    return DailyATO(day=1, missions=[
        Mission(id="DAY1-QRA-1", type=MissionType.QRA, required_aircraft=2,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=0),
        Mission(id="DAY1-QRA-2", type=MissionType.QRA, required_aircraft=2,
                scheduled_hour=18, duration_hours=2, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=0),
        Mission(id="DAY1-RECCE-1", type=MissionType.RECCE, required_aircraft=1,
                scheduled_hour=10, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
    ])


def create_ato_day2() -> DailyATO:
    return DailyATO(day=2, missions=[
        Mission(id="DAY2-QRA-1", type=MissionType.QRA, required_aircraft=2,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=0),
        Mission(id="DAY2-DCA-1", type=MissionType.DCA, required_aircraft=2,
                scheduled_hour=8, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY2-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=10, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY2-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=14, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY2-DCA-2", type=MissionType.DCA, required_aircraft=2,
                scheduled_hour=16, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
    ])


def create_ato_day3() -> DailyATO:
    return DailyATO(day=3, missions=[
        Mission(id="DAY3-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY3-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=8, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY3-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=10, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY3-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=11, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4),
        Mission(id="DAY3-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=12, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY3-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=14, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY3-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=18, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
    ])


def create_ato_day4() -> DailyATO:
    """Day 4 — same as Day 3 pattern. CM attack handled in turn_engine."""
    return DailyATO(day=4, missions=[
        Mission(id="DAY4-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY4-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=8, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY4-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=10, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY4-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=11, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4),
        Mission(id="DAY4-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=12, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY4-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=14, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY4-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=18, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
    ])


def create_ato_day5() -> DailyATO:
    return DailyATO(day=5, missions=[
        Mission(id="DAY5-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY5-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=7, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY5-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=8, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4),
        Mission(id="DAY5-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=10, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY5-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=13, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY5-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=14, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY5-ATTACK-2", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=15, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4),
        Mission(id="DAY5-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=18, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
    ])


def create_ato_day6() -> DailyATO:
    return DailyATO(day=6, missions=[
        Mission(id="DAY6-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=5, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY6-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=7, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY6-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=8, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4),
        Mission(id="DAY6-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=9, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY6-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=11, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY6-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=13, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY6-ATTACK-2", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=14, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4),
        Mission(id="DAY6-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=17, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY6-DCA-5", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=21, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
    ])


def create_ato_day7() -> DailyATO:
    return DailyATO(day=7, missions=[
        Mission(id="DAY7-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=4, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY7-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=6, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4),
        Mission(id="DAY7-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=8, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY7-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=10, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY7-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=12, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY7-ATTACK-2", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=14, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4),
        Mission(id="DAY7-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=16, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
        Mission(id="DAY7-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=18, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0),
        Mission(id="DAY7-DCA-5", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=20, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0),
    ])


ATO_BY_DAY = {
    1: create_ato_day1,
    2: create_ato_day2,
    3: create_ato_day3,
    4: create_ato_day4,
    5: create_ato_day5,
    6: create_ato_day6,
    7: create_ato_day7,
}


def get_ato_for_day(day: int) -> DailyATO | None:
    """Get the ATO for a specific day."""
    creator = ATO_BY_DAY.get(day)
    return creator() if creator else None


def create_initial_game_state() -> GameState:
    """Create a fresh game state with all initial values."""
    return GameState(
        current_day=1,
        current_hour=6,
        current_turn=0,
        phase=Phase.PEACE,
        aircraft=create_initial_fleet(),
        resources=BaseResources(
            fuel_storage=50000.0,
            fuel_storage_capacity=50000.0,
            missiles=40,
            bombs=30,
            pods=6,
            spare_parts=20,
            exchange_units=8,
            exchange_units_in_repair=0,
            exchange_units_in_transit=0,
            ue_repair_days_remaining=[],
            ue_transit_days_remaining=[],
        ),
        personnel=PersonnelShift(
            maintenance_crews_on_duty=3,
            maintenance_crews_total=6,
            shift_hours_remaining=8.0,
        ),
        current_ato=create_ato_day1(),
        event_log=[],
        turn_results=[],
        is_game_over=False,
    )
