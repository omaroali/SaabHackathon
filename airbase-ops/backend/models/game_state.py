from enum import Enum
from pydantic import BaseModel
from typing import Optional
from .aircraft import Aircraft
from .resources import BaseResources, PersonnelShift
from .mission import DailyATO


class Phase(str, Enum):
    PEACE = "PEACE"
    CRISIS = "CRISIS"
    WAR = "WAR"


class GameEvent(BaseModel):
    turn: int
    hour: float
    day: int
    message: str
    severity: str = "info"
    aircraft_id: Optional[str] = None


class GameState(BaseModel):
    current_day: int = 1
    current_hour: float = 0.0
    current_turn: int = 0
    phase: Phase = Phase.PEACE
    aircraft: list[Aircraft] = []
    resources: BaseResources = BaseResources()
    personnel: PersonnelShift = PersonnelShift()
    current_ato: Optional[DailyATO] = None
    event_log: list[GameEvent] = []
    turn_results: list[GameEvent] = []
    is_game_over: bool = False
    runway_damaged_hours: float = 0.0
    # Air base location — F 17 Kallinge, Blekinge, Sweden
    base_lat: float = 56.256
    base_lon: float = 15.268

    @staticmethod
    def phase_for_day(day: int) -> Phase:
        if day <= 10:
            return Phase.PEACE
        elif day <= 20:
            return Phase.CRISIS
        else:
            return Phase.WAR
