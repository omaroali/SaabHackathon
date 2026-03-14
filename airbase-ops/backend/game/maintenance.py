from models.aircraft import Aircraft, AircraftStatus, MaintenanceInfo, MaintenanceType
from models.resources import BaseResources


def enter_maintenance(aircraft: Aircraft, maint_info: MaintenanceInfo, resources: BaseResources) -> str:
    """
    Transition an aircraft into maintenance. Handle UE consumption.
    Returns a log message.
    """
    aircraft.status = AircraftStatus.MAINTENANCE
    aircraft.maintenance = maint_info

    if maint_info.requires_ue:
        if resources.exchange_units > 0:
            resources.exchange_units -= 1
            return (
                f"Aircraft {aircraft.id} entered maintenance: {maint_info.type.value}, "
                f"est. {maint_info.total_hours}h. UE consumed (remaining: {resources.exchange_units})"
            )
        else:
            # Grounded — no UE available
            aircraft.maintenance.hours_remaining = 999
            return (
                f"No exchange units available! Aircraft {aircraft.id} GROUNDED — "
                f"cannot repair {maint_info.type.value} without UE"
            )
    return (
        f"Aircraft {aircraft.id} entered maintenance: {maint_info.type.value}, "
        f"est. {maint_info.total_hours}h at {maint_info.facility}"
    )


def complete_maintenance(aircraft: Aircraft, resources: BaseResources) -> str:
    """
    Complete maintenance on an aircraft. Handle UE MRO cycle.
    Returns a log message.
    """
    maint = aircraft.maintenance
    message = f"Aircraft {aircraft.id} maintenance complete — returned to hangar"

    if maint and maint.requires_ue:
        # Old UE goes to MRO for 30-day repair cycle
        resources.ue_repair_days_remaining.append(30)
        resources.exchange_units_in_repair += 1

    aircraft.status = AircraftStatus.HANGAR
    aircraft.maintenance = None
    return message


def check_ue_availability(resources: BaseResources) -> bool:
    """Check if exchange units are available."""
    return resources.exchange_units > 0


def process_ue_cycles(resources: BaseResources) -> list[str]:
    """
    Process UE repair and transit cycles. Called at hour 0 of each day.
    Returns list of log messages.
    """
    messages = []

    # Process MRO repairs
    new_repair_list = []
    for days in resources.ue_repair_days_remaining:
        remaining = days - 1
        if remaining <= 0:
            resources.exchange_units += 1
            resources.exchange_units_in_repair -= 1
            messages.append(
                f"Exchange unit returned from MRO! Available: {resources.exchange_units}"
            )
        else:
            new_repair_list.append(remaining)
    resources.ue_repair_days_remaining = new_repair_list

    # Process transit orders
    new_transit_list = []
    for days in resources.ue_transit_days_remaining:
        remaining = days - 1
        if remaining <= 0:
            resources.exchange_units += 1
            resources.exchange_units_in_transit -= 1
            messages.append(
                f"Exchange unit arrived from central depot! Available: {resources.exchange_units}"
            )
        else:
            new_transit_list.append(remaining)
    resources.ue_transit_days_remaining = new_transit_list

    return messages
