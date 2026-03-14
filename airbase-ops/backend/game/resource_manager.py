from models.aircraft import Aircraft, AircraftStatus
from models.mission import Mission
from models.resources import BaseResources

# Constants
FUEL_CONSUMPTION_PER_FLIGHT_HOUR = 200
FUEL_TAKEOFF_COST = 50
REFUEL_RATE_PER_HOUR = 500
MAX_FUEL_CAPACITY = 1000
DEFAULT_TIME_STEP_HOURS = 1.0


def refuel_aircraft(aircraft: Aircraft, resources: BaseResources, step_hours: float = DEFAULT_TIME_STEP_HOURS) -> float:
    """
    Refuel an aircraft from base storage. Returns liters added.
    Only refuels MISSION_CAPABLE or HANGAR aircraft on the ground.
    """
    if aircraft.status not in (AircraftStatus.MISSION_CAPABLE, AircraftStatus.HANGAR):
        return 0.0

    needed = aircraft.fuel_capacity - aircraft.fuel_level
    if needed <= 0:
        return 0.0

    can_add = min(needed, REFUEL_RATE_PER_HOUR * step_hours, resources.fuel_storage)
    if can_add <= 0:
        return 0.0

    aircraft.fuel_level += can_add
    resources.fuel_storage -= can_add
    return can_add


def arm_aircraft(aircraft: Aircraft, mission: Mission, resources: BaseResources) -> tuple[bool, str]:
    """
    Load weapons onto a MISSION_CAPABLE aircraft from base inventory.
    Returns (success, message).
    """
    if aircraft.status != AircraftStatus.MISSION_CAPABLE:
        return False, f"Aircraft {aircraft.id} is not mission capable — cannot arm"

    missiles_needed = mission.missiles_per_aircraft - aircraft.weapon_loadout.missiles
    bombs_needed = mission.bombs_per_aircraft - aircraft.weapon_loadout.bombs
    pods_needed = (1 if mission.requires_pods else 0) - aircraft.weapon_loadout.pods

    missiles_needed = max(0, missiles_needed)
    bombs_needed = max(0, bombs_needed)
    pods_needed = max(0, pods_needed)

    if missiles_needed > resources.missiles:
        return False, f"Insufficient missiles (need {missiles_needed}, have {resources.missiles})"
    if bombs_needed > resources.bombs:
        return False, f"Insufficient bombs (need {bombs_needed}, have {resources.bombs})"
    if pods_needed > resources.pods:
        return False, f"Insufficient pods (need {pods_needed}, have {resources.pods})"

    resources.missiles -= missiles_needed
    resources.bombs -= bombs_needed
    resources.pods -= pods_needed

    aircraft.weapon_loadout.missiles += missiles_needed
    aircraft.weapon_loadout.bombs += bombs_needed
    aircraft.weapon_loadout.pods += pods_needed

    return True, (
        f"Aircraft {aircraft.id} armed: "
        f"{aircraft.weapon_loadout.missiles} missiles, "
        f"{aircraft.weapon_loadout.bombs} bombs, "
        f"{aircraft.weapon_loadout.pods} pods"
    )


def consume_fuel_in_flight(aircraft: Aircraft, step_hours: float = DEFAULT_TIME_STEP_HOURS) -> str | None:
    """Deduct fuel during mission. Returns warning message or None."""
    aircraft.fuel_level -= FUEL_CONSUMPTION_PER_FLIGHT_HOUR * step_hours
    if aircraft.fuel_level < 0:
        aircraft.fuel_level = 0
        return f"Aircraft {aircraft.id} emergency — fuel critically low"
    return None


def check_resource_warnings(resources: BaseResources) -> list[str]:
    """Generate warning messages when resources are low."""
    warnings = []

    fuel_pct = resources.fuel_storage / resources.fuel_storage_capacity if resources.fuel_storage_capacity > 0 else 0
    if fuel_pct < 0.2:
        warnings.append(f"Low fuel reserves: {resources.fuel_storage:.0f}L ({fuel_pct*100:.0f}%)")

    if resources.exchange_units < 3:
        warnings.append(f"Low exchange units: {resources.exchange_units} remaining")

    if resources.missiles < 10:
        warnings.append(f"Low missile stock: {resources.missiles} remaining")

    if resources.bombs < 8:
        warnings.append(f"Low bomb stock: {resources.bombs} remaining")

    if resources.spare_parts < 5:
        warnings.append(f"Low spare parts: {resources.spare_parts} remaining")

    return warnings
