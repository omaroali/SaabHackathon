"""All API route handlers for AirBase Ops."""
import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from models.game_state import GameState
from models.aircraft import AircraftStatus
from models.mission import MissionStatus
from game.turn_engine import PRE_FLIGHT_DURATION_HOURS, TIME_STEP_HOURS, execute_turn
from game.resource_manager import arm_aircraft as arm_aircraft_fn, check_resource_warnings
from game.metrics import compute_metrics
from game.simulator import simulate_forward
from scenarios.default_scenario import CAMPAIGN_DAYS, create_initial_game_state, get_ato_for_day
from ai.advisor import ai_suggest, ai_chat, ai_recommend

router = APIRouter()

DAY_TURNS = int(24 / TIME_STEP_HOURS)
FAST_FORWARD_PRESETS = [
    {"label": "1d", "turns": DAY_TURNS},
    {"label": "3d", "turns": DAY_TURNS * 3},
]

# In-memory game state
_game_state: GameState | None = None

SAVE_FILE = "savegame.json"


# --- Request Models ---

class AssignRequest(BaseModel):
    mission_id: str
    aircraft_ids: list[str]


class UnassignRequest(BaseModel):
    mission_id: str
    aircraft_id: str


class PlanRequest(BaseModel):
    mission_id: str


class AdvanceMultipleRequest(BaseModel):
    turns: int


class PrepRequest(BaseModel):
    aircraft_id: str


class ArmRequest(BaseModel):
    aircraft_id: str
    missiles: int = 0
    bombs: int = 0
    pods: int = 0


class ChatRequest(BaseModel):
    message: str


# --- Helpers ---

def _get_state() -> GameState:
    global _game_state
    if _game_state is None:
        raise HTTPException(status_code=400, detail="No active game. Start a new game first.")
    return _game_state


def _apply_assignment(state: GameState, mission_id: str, aircraft_id: str) -> None:
    """Assign an aircraft to a mission, moving it off any other pending assignment."""
    if state.current_ato is None:
        raise HTTPException(status_code=400, detail="No active ATO")

    mission = next((m for m in state.current_ato.missions if m.id == mission_id), None)
    if mission is None:
        raise HTTPException(status_code=404, detail=f"Mission {mission_id} not found")

    aircraft = next((a for a in state.aircraft if a.id == aircraft_id), None)
    if aircraft is None:
        raise HTTPException(status_code=404, detail=f"Aircraft {aircraft_id} not found")

    for other_mission in state.current_ato.missions:
        if aircraft_id not in other_mission.assigned_aircraft_ids or other_mission.id == mission_id:
            continue
        other_mission.assigned_aircraft_ids.remove(aircraft_id)
        if not other_mission.assigned_aircraft_ids and other_mission.status == MissionStatus.AIRCRAFT_ASSIGNED:
            other_mission.status = MissionStatus.PENDING

    if aircraft.status == AircraftStatus.HANGAR:
        aircraft.status = AircraftStatus.PRE_FLIGHT
        aircraft.pre_flight_hours_remaining = PRE_FLIGHT_DURATION_HOURS

    if aircraft_id not in mission.assigned_aircraft_ids:
        mission.assigned_aircraft_ids.append(aircraft_id)
    if mission.assigned_aircraft_ids:
        mission.status = MissionStatus.AIRCRAFT_ASSIGNED


def _apply_assignments(state: GameState, assignments: list[dict], clear_existing: bool = False) -> None:
    """Apply a batch of mission assignments to a state."""
    if state.current_ato is None:
        return

    if clear_existing:
        for mission in state.current_ato.missions:
            if mission.status in (MissionStatus.PENDING, MissionStatus.AIRCRAFT_ASSIGNED):
                mission.assigned_aircraft_ids = []
                mission.status = MissionStatus.PENDING

    for assignment in assignments:
        mission_id = assignment.get("mission_id", "")
        for aircraft_id in assignment.get("aircraft_ids", []):
            try:
                _apply_assignment(state, mission_id, aircraft_id)
            except HTTPException:
                continue


# --- Endpoints ---

@router.get("/state")
def get_state():
    global _game_state
    if _game_state is None:
        return None
    return _game_state.model_dump()


@router.post("/start-game")
def start_game():
    global _game_state
    _game_state = create_initial_game_state()
    return _game_state.model_dump()


@router.get("/time-presets")
def get_time_presets():
    """Expose day-based fast-forward options for the frontend."""
    return {
        "time_step_hours": TIME_STEP_HOURS,
        "presets": FAST_FORWARD_PRESETS,
    }


@router.post("/assign")
def assign_aircraft(req: AssignRequest):
    state = _get_state()
    for ac_id in req.aircraft_ids:
        _apply_assignment(state, req.mission_id, ac_id)

    return state.model_dump()


@router.post("/unassign")
def unassign_aircraft(req: UnassignRequest):
    state = _get_state()
    if state.current_ato is None:
        raise HTTPException(status_code=400, detail="No active ATO")

    mission = next(
        (m for m in state.current_ato.missions if m.id == req.mission_id), None
    )
    if mission is None:
        raise HTTPException(status_code=404, detail=f"Mission {req.mission_id} not found")

    if req.aircraft_id in mission.assigned_aircraft_ids:
        mission.assigned_aircraft_ids.remove(req.aircraft_id)

    if not mission.assigned_aircraft_ids:
        mission.status = MissionStatus.PENDING

    return state.model_dump()


@router.post("/plan")
def plan_mission(req: PlanRequest):
    state = _get_state()
    if state.current_ato is None:
        raise HTTPException(status_code=400, detail="No active ATO")

    mission = next(
        (m for m in state.current_ato.missions if m.id == req.mission_id), None
    )
    if mission is None:
        raise HTTPException(status_code=404, detail=f"Mission {req.mission_id} not found")

    mission.is_planned = True
    return state.model_dump()


@router.post("/advance-turn")
def advance_turn():
    state = _get_state()
    if state.is_game_over:
        raise HTTPException(status_code=400, detail="Game is over")

    execute_turn(state)

    # Load next day's ATO if needed
    if abs(state.current_hour) < 1e-9 and state.current_day <= CAMPAIGN_DAYS:
        ato = get_ato_for_day(state.current_day)
        if ato:
            state.current_ato = ato

    return state.model_dump()


@router.post("/advance-multiple")
def advance_multiple(req: AdvanceMultipleRequest):
    state = _get_state()
    turns = min(req.turns, DAY_TURNS * 3)  # Cap at three full days

    for _ in range(turns):
        if state.is_game_over:
            break
        execute_turn(state)
        if abs(state.current_hour) < 1e-9 and state.current_day <= CAMPAIGN_DAYS:
            ato = get_ato_for_day(state.current_day)
            if ato:
                state.current_ato = ato

    return state.model_dump()


@router.post("/prep-aircraft")
def prep_aircraft(req: PrepRequest):
    state = _get_state()
    ac = next((a for a in state.aircraft if a.id == req.aircraft_id), None)
    if ac is None:
        raise HTTPException(status_code=404, detail=f"Aircraft {req.aircraft_id} not found")

    if ac.status != AircraftStatus.HANGAR:
        raise HTTPException(
            status_code=400,
            detail=f"Aircraft {req.aircraft_id} is {ac.status.value}, not in HANGAR"
        )

    ac.status = AircraftStatus.PRE_FLIGHT
    ac.pre_flight_hours_remaining = PRE_FLIGHT_DURATION_HOURS
    return state.model_dump()


@router.post("/arm-aircraft")
def arm_aircraft_endpoint(req: ArmRequest):
    state = _get_state()
    ac = next((a for a in state.aircraft if a.id == req.aircraft_id), None)
    if ac is None:
        raise HTTPException(status_code=404, detail=f"Aircraft {req.aircraft_id} not found")

    if ac.status != AircraftStatus.MISSION_CAPABLE:
        raise HTTPException(
            status_code=400,
            detail=f"Aircraft {req.aircraft_id} is {ac.status.value}, must be MISSION_CAPABLE to arm"
        )

    # Direct arming from base inventory
    if req.missiles > state.resources.missiles:
        raise HTTPException(status_code=400, detail="Insufficient missiles")
    if req.bombs > state.resources.bombs:
        raise HTTPException(status_code=400, detail="Insufficient bombs")
    if req.pods > state.resources.pods:
        raise HTTPException(status_code=400, detail="Insufficient pods")

    state.resources.missiles -= req.missiles
    state.resources.bombs -= req.bombs
    state.resources.pods -= req.pods

    ac.weapon_loadout.missiles += req.missiles
    ac.weapon_loadout.bombs += req.bombs
    ac.weapon_loadout.pods += req.pods

    return state.model_dump()


# --- NEW: Metrics & Compare endpoints ---

@router.get("/metrics")
def get_metrics():
    """Return current KPI metrics snapshot for Decision Impact Panel."""
    state = _get_state()
    return compute_metrics(state)


@router.post("/compare")
async def compare_plans():
    """
    Compare baseline (current plan) vs AI-optimized plan.
    Runs 1 day forward simulation on both and returns side-by-side results.
    Non-destructive — original state is never mutated.
    """
    state = _get_state()

    # Baseline: simulate current state forward 1 day
    baseline = simulate_forward(state, turns=DAY_TURNS, seed=42)

    # Optimized: get AI assignments, apply to cloned state, then simulate
    optimized_state = state.model_copy(deep=True)

    # Get AI suggestions
    try:
        ai_result = await ai_suggest(state.model_dump())
        assignments = ai_result.get("assignments", [])

        _apply_assignments(optimized_state, assignments, clear_existing=True)
    except Exception:
        # If AI fails, optimized = baseline (so comparison still works)
        optimized_state = state.model_copy(deep=True)

    optimized = simulate_forward(optimized_state, turns=DAY_TURNS, seed=42)

    return {
        "baseline": baseline,
        "optimized": optimized,
        "ai_suggestion": ai_result.get("suggestion", "") if 'ai_result' in dir() else "",
    }


# --- AI endpoints ---

@router.post("/ai/suggest")
async def ai_suggest_endpoint():
    state = _get_state()
    result = await ai_suggest(state.model_dump())
    return result


@router.post("/ai/recommend")
async def ai_recommend_endpoint():
    """Get structured AI recommendation cards for the frontend."""
    state = _get_state()
    result = await ai_recommend(state.model_dump())
    return result


@router.post("/ai/chat")
async def ai_chat_endpoint(req: ChatRequest):
    state = _get_state()
    response = await ai_chat(state.model_dump(), req.message)
    return {"response": response}


# --- Save / Load ---

@router.post("/save")
def save_game():
    state = _get_state()
    with open(SAVE_FILE, "w") as f:
        f.write(state.model_dump_json(indent=2))
    return {"status": "saved"}


@router.post("/load")
def load_game():
    global _game_state
    if not os.path.exists(SAVE_FILE):
        raise HTTPException(status_code=404, detail="No save file found")
    with open(SAVE_FILE, "r") as f:
        data = json.load(f)
    _game_state = GameState.model_validate(data)
    return _game_state.model_dump()
