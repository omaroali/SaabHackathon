"""
Default 30-day scenario for AirBase Ops.
Creates the initial game state with 10 Gripen E aircraft and a 30-day campaign.
Adds geographic coordinates for missions (Baltic Sea / Gotland).
"""
import random
from models.game_state import GameState, Phase
from models.aircraft import Aircraft, AircraftStatus, WeaponLoadout
from models.resources import BaseResources, PersonnelShift
from models.mission import Mission, MissionType, MissionStatus, DailyATO

CAMPAIGN_DAYS = 30


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

# Helper to generate random coordinates near a center point
def _jitter(lat, lon, variance=0.3):
    return round(lat + random.uniform(-variance, variance), 3), round(lon + random.uniform(-variance, variance), 3)

def create_ato_day1() -> DailyATO:
    return DailyATO(day=1, missions=[
        Mission(id="DAY1-QRA-1", type=MissionType.QRA, required_aircraft=2,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=0,
                target_lat=56.9, target_lon=18.3, area_name="Gotland Airspace"),
        Mission(id="DAY1-QRA-2", type=MissionType.QRA, required_aircraft=2,
                scheduled_hour=18, duration_hours=2, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=0,
                target_lat=57.1, target_lon=18.1, area_name="Gotland West"),
        Mission(id="DAY1-RECCE-1", type=MissionType.RECCE, required_aircraft=1,
                scheduled_hour=10, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=55.5, target_lon=15.0, area_name="Bornholm Basin"),
    ])


def create_ato_day2() -> DailyATO:
    return DailyATO(day=2, missions=[
        Mission(id="DAY2-QRA-1", type=MissionType.QRA, required_aircraft=2,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=0,
                target_lat=57.5, target_lon=19.0, area_name="North Gotland"),
        Mission(id="DAY2-DCA-1", type=MissionType.DCA, required_aircraft=2,
                scheduled_hour=8, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.0, target_lon=16.5, area_name="Öland East Coast"),
        Mission(id="DAY2-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=10, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=55.8, target_lon=17.2, area_name="South Baltic"),
        Mission(id="DAY2-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=14, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=56.8, target_lon=19.5, area_name="East Gotland"),
        Mission(id="DAY2-DCA-2", type=MissionType.DCA, required_aircraft=2,
                scheduled_hour=16, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=55.2, target_lon=15.8, area_name="Bornholm East"),
    ])


def create_ato_day3() -> DailyATO:
    return DailyATO(day=3, missions=[
        Mission(id="DAY3-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=57.0, target_lon=20.0, area_name="Central Baltic"),
        Mission(id="DAY3-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=8, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=55.8, target_lon=16.0, area_name="South Baltic"),
        Mission(id="DAY3-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=10, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=57.2, target_lon=18.5, area_name="Gotland Central"),
        Mission(id="DAY3-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=11, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4,
                target_lat=56.5, target_lon=17.0, area_name="Ovelian Fleet"),
        Mission(id="DAY3-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=12, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=58.0, target_lon=20.5, area_name="North Baltic"),
        Mission(id="DAY3-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=14, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.8, target_lon=19.8, area_name="East Gotland Bassin"),
        Mission(id="DAY3-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=18, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=55.5, target_lon=18.0, area_name="Gdansk Bay Approach"),
    ])


def create_ato_day4() -> DailyATO:
    return DailyATO(day=4, missions=[
        Mission(id="DAY4-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=57.8, target_lon=19.2, area_name="Gotska Sandön"),
        Mission(id="DAY4-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=8, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=56.1, target_lon=16.8, area_name="Öland South"),
        Mission(id="DAY4-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=10, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=57.0, target_lon=18.0, area_name="Gotland West"),
        Mission(id="DAY4-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=11, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4,
                target_lat=55.0, target_lon=19.0, area_name="Enemy Staging Area"),
        Mission(id="DAY4-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=12, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=58.2, target_lon=21.0, area_name="Gulf of Finland Approach"),
        Mission(id="DAY4-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=14, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.3, target_lon=18.5, area_name="Mid Baltic"),
        Mission(id="DAY4-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=18, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=55.2, target_lon=18.5, area_name="Bomber Escort"),
    ])

def create_ato_day5() -> DailyATO:
    return DailyATO(day=5, missions=[
        Mission(id="DAY5-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=6, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.5, target_lon=16.5, area_name="Öland Approach"),
        Mission(id="DAY5-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=7, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=57.5, target_lon=19.5, area_name="Gotland Approach"),
        Mission(id="DAY5-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=8, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4,
                target_lat=55.5, target_lon=17.5, area_name="Hostile Fleet"),
        Mission(id="DAY5-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=10, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=57.1, target_lon=19.1, area_name="Slite Port"),
        Mission(id="DAY5-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=13, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=58.5, target_lon=20.0, area_name="Stockholm Archipelago"),
        Mission(id="DAY5-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=14, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.8, target_lon=17.8, area_name="Karlsöarna"),
        Mission(id="DAY5-ATTACK-2", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=15, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4,
                target_lat=55.0, target_lon=18.0, area_name="Enemy Landing Prep"),
        Mission(id="DAY5-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=18, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.0, target_lon=15.5, area_name="Hanö Bay"),
    ])


def create_ato_day6() -> DailyATO:
    return DailyATO(day=6, missions=[
        Mission(id="DAY6-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=5, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=57.3, target_lon=18.8, area_name="Gotland East"),
        Mission(id="DAY6-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=7, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=55.8, target_lon=16.8, area_name="South Baltic Central"),
        Mission(id="DAY6-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=8, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4,
                target_lat=54.5, target_lon=18.5, area_name="Enemy Forward Base"),
        Mission(id="DAY6-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=9, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.9, target_lon=18.3, area_name="Gotland Airspace"),
        Mission(id="DAY6-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=11, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=58.0, target_lon=21.5, area_name="Gulf of Riga Approach"),
        Mission(id="DAY6-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=13, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.5, target_lon=17.5, area_name="Mid Baltic South"),
        Mission(id="DAY6-ATTACK-2", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=14, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4,
                target_lat=55.2, target_lon=19.5, area_name="Surface Threat"),
        Mission(id="DAY6-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=17, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=57.5, target_lon=18.0, area_name="Gotland North"),
        Mission(id="DAY6-DCA-5", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=21, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.0, target_lon=16.0, area_name="Öland South"),
    ])


def create_ato_day7() -> DailyATO:
    return DailyATO(day=7, missions=[
        Mission(id="DAY7-DCA-1", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=4, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.2, target_lon=15.5, area_name="Base Defense"),
        Mission(id="DAY7-ATTACK-1", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=6, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4,
                target_lat=54.8, target_lon=19.2, area_name="Strategic Target Alpha"),
        Mission(id="DAY7-DCA-2", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=8, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=57.0, target_lon=18.3, area_name="Gotland Defense"),
        Mission(id="DAY7-RECCE-1", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=10, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=55.5, target_lon=16.5, area_name="Bornholm Sector"),
        Mission(id="DAY7-DCA-3", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=12, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.8, target_lon=19.5, area_name="East Gotland Bassin"),
        Mission(id="DAY7-ATTACK-2", type=MissionType.ATTACK, required_aircraft=2,
                scheduled_hour=14, duration_hours=3, priority=1,
                missiles_per_aircraft=2, bombs_per_aircraft=4,
                target_lat=55.0, target_lon=18.5, area_name="Strategic Target Bravo"),
        Mission(id="DAY7-DCA-4", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=16, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.5, target_lon=16.0, area_name="Kalmar Strait"),
        Mission(id="DAY7-RECCE-2", type=MissionType.RECCE, required_aircraft=2,
                scheduled_hour=18, duration_hours=2, priority=2,
                requires_pods=True, missiles_per_aircraft=0, bombs_per_aircraft=0,
                target_lat=58.0, target_lon=20.5, area_name="North Baltic Sector"),
        Mission(id="DAY7-DCA-5", type=MissionType.DCA, required_aircraft=4,
                scheduled_hour=20, duration_hours=2, priority=1,
                missiles_per_aircraft=4, bombs_per_aircraft=0,
                target_lat=56.0, target_lon=15.0, area_name="Base Defense Screen"),
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
    """Get the ATO for a specific day in the 30-day campaign."""
    if day < 1 or day > CAMPAIGN_DAYS:
        return None

    if day in ATO_BY_DAY:
        ato = ATO_BY_DAY[day]()
    else:
        template_day = _template_day_for_campaign(day)
        creator = ATO_BY_DAY[template_day]
        template = creator()
        ato = DailyATO(
            day=day,
            missions=[
                mission.model_copy(
                    update={
                        "id": mission.id.replace(f"DAY{template.day}", f"DAY{day}"),
                    }
                )
                for mission in template.missions
            ],
        )

    # Realism: Pre-plan Day 1 and Day 2 missions (since campaign is already set up)
    if day <= 2:
        for m in ato.missions:
            m.is_planned = True
    
    return ato


def _template_day_for_campaign(day: int) -> int:
    """Map a 30-day campaign day to a representative mission template."""
    if day <= 10:
        return 1 + ((day - 1) % 2)
    if day <= 20:
        crisis_templates = [3, 4, 5]
        return crisis_templates[(day - 11) % len(crisis_templates)]
    war_templates = [6, 7]
    return war_templates[(day - 21) % len(war_templates)]


def create_initial_game_state() -> GameState:
    """Create a fresh game state with all initial values."""
    initial_ato = create_ato_day1()
    for m in initial_ato.missions:
        m.is_planned = True

    return GameState(
        current_day=1,
        current_hour=0,
        current_turn=0,
        phase=Phase.PEACE,
        aircraft=create_initial_fleet(),
        resources=BaseResources(
            fuel_storage=180000.0,
            fuel_storage_capacity=180000.0,
            missiles=180,
            bombs=120,
            pods=10,
            spare_parts=60,
            exchange_units=16,
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
        current_ato=initial_ato,
        event_log=[],
        turn_results=[],
        is_game_over=False,
        # Base location: F 17 Kallinge
        base_lat=56.256,
        base_lon=15.268,
    )
