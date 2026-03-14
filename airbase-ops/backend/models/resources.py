from pydantic import BaseModel


class BaseResources(BaseModel):
    fuel_storage: float = 50000.0
    fuel_storage_capacity: float = 50000.0
    missiles: int = 40
    bombs: int = 30
    pods: int = 6
    spare_parts: int = 20
    exchange_units: int = 8
    exchange_units_in_repair: int = 0
    exchange_units_in_transit: int = 0
    ue_repair_days_remaining: list[int] = []
    ue_transit_days_remaining: list[int] = []


class PersonnelShift(BaseModel):
    maintenance_crews_on_duty: int = 3
    maintenance_crews_total: int = 6
    shift_hours_remaining: float = 8.0
    crews_resting_hours: dict[str, float] = {}
