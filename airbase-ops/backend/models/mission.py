from enum import Enum
from typing import Optional
from pydantic import BaseModel


class MissionType(str, Enum):
    QRA = "QRA"
    DCA = "DCA"
    RECCE = "RECCE"
    ATTACK = "ATTACK"
    ESCORT = "ESCORT"
    AEW = "AEW"


class MissionStatus(str, Enum):
    PENDING = "PENDING"
    AIRCRAFT_ASSIGNED = "AIRCRAFT_ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Mission(BaseModel):
    id: str
    type: MissionType
    required_aircraft: int
    assigned_aircraft_ids: list[str] = []
    status: MissionStatus = MissionStatus.PENDING
    scheduled_hour: int
    duration_hours: float = 2.0
    priority: int = 1
    requires_weapons: bool = True
    requires_pods: bool = False
    missiles_per_aircraft: int = 2
    bombs_per_aircraft: int = 0
    is_planned: bool = False
    planning_deadline_hour: int = 24  # Hours before launch it must be planned
    # Geographic target area
    target_lat: Optional[float] = None
    target_lon: Optional[float] = None
    area_name: str = ""


class DailyATO(BaseModel):
    day: int
    missions: list[Mission]
