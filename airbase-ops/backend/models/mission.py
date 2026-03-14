from enum import Enum
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


class DailyATO(BaseModel):
    day: int
    missions: list[Mission]
