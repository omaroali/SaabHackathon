from enum import Enum
from pydantic import BaseModel
from typing import Optional


class AircraftStatus(str, Enum):
    HANGAR = "HANGAR"
    PRE_FLIGHT = "PRE_FLIGHT"
    MISSION_CAPABLE = "MISSION_CAPABLE"
    ON_MISSION = "ON_MISSION"
    POST_FLIGHT = "POST_FLIGHT"
    MAINTENANCE = "MAINTENANCE"


class MaintenanceType(str, Enum):
    QUICK_LRU = "QUICK_LRU"
    COMPLEX_LRU = "COMPLEX_LRU"
    DIRECT_REPAIR = "DIRECT_REPAIR"
    TROUBLESHOOT = "TROUBLESHOOT"
    WHEEL_REPLACEMENT = "WHEEL_REPLACEMENT"
    COMPOSITE_REPAIR = "COMPOSITE_REPAIR"
    SERVICE_A = "SERVICE_A"
    SERVICE_B = "SERVICE_B"
    SERVICE_C = "SERVICE_C"


class MaintenanceInfo(BaseModel):
    type: MaintenanceType
    total_hours: float
    hours_remaining: float
    requires_ue: bool = False
    facility: str = "Service Bay"


class WeaponLoadout(BaseModel):
    missiles: int = 0
    bombs: int = 0
    pods: int = 0


class Aircraft(BaseModel):
    id: str
    display_name: str
    status: AircraftStatus = AircraftStatus.HANGAR
    fuel_level: float = 1000.0
    fuel_capacity: float = 1000.0
    total_flight_hours: float = 0.0
    hours_until_service: float = 100.0
    weapon_loadout: WeaponLoadout = WeaponLoadout()
    maintenance: Optional[MaintenanceInfo] = None
    assigned_mission_id: Optional[str] = None
    mission_hours_remaining: float = 0
    pre_flight_hours_remaining: float = 0
    post_flight_hours_remaining: float = 0
