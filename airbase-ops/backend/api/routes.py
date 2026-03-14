"""All API route handlers for AirBase Ops."""
import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from models.game_state import GameState
from models.aircraft import AircraftStatus
from models.mission import MissionStatus
from game.turn_engine import execute_turn
from game.resource_manager import arm_aircraft as arm_aircraft_fn, check_resource_warnings
from scenarios.default_scenario import create_initial_game_state, get_ato_for_day
from ai.advisor import ai_suggest, ai_chat

router = APIRouter()

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


@router.post("/assign")
def assign_aircraft(req: AssignRequest):
    state = _get_state()
    if state.current_ato is None:
        raise HTTPException(status_code=400, detail="No active ATO")

    mission = next(
        (m for m in state.current_ato.missions if m.id == req.mission_id), None
    )
    if mission is None:
        raise HTTPException(status_code=404, detail=f"Mission {req.mission_id} not found")

    for ac_id in req.aircraft_ids:
        ac = next((a for a in state.aircraft if a.id == ac_id), None)
        if ac is None:
            raise HTTPException(status_code=404, detail=f"Aircraft {ac_id} not found")

        # Check if already assigned to another mission
        for m in state.current_ato.missions:
            if ac_id in m.assigned_aircraft_ids and m.id != req.mission_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Aircraft {ac_id} already assigned to mission {m.id}"
                )

        if ac.status == AircraftStatus.HANGAR:
            # Auto-start pre-flight
            ac.status = AircraftStatus.PRE_FLIGHT
            ac.pre_flight_hours_remaining = 1.0

        if ac_id not in mission.assigned_aircraft_ids:
            mission.assigned_aircraft_ids.append(ac_id)

    if mission.assigned_aircraft_ids:
        mission.status = MissionStatus.AIRCRAFT_ASSIGNED

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


@router.post("/advance-turn")
def advance_turn():
    state = _get_state()
    if state.is_game_over:
        raise HTTPException(status_code=400, detail="Game is over")

    execute_turn(state)

    # Load next day's ATO if needed
    if state.current_hour == 0 and state.current_day <= 7:
        ato = get_ato_for_day(state.current_day)
        if ato:
            state.current_ato = ato

    return state.model_dump()


@router.post("/advance-multiple")
def advance_multiple(req: AdvanceMultipleRequest):
    state = _get_state()
    turns = min(req.turns, 24)  # Cap at 24 turns

    for _ in range(turns):
        if state.is_game_over:
            break
        execute_turn(state)
        if state.current_hour == 0 and state.current_day <= 7:
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
    ac.pre_flight_hours_remaining = 1.0
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


@router.post("/ai/suggest")
async def ai_suggest_endpoint():
    state = _get_state()
    result = await ai_suggest(state.model_dump())
    return result


@router.post("/ai/chat")
async def ai_chat_endpoint(req: ChatRequest):
    state = _get_state()
    response = await ai_chat(state.model_dump(), req.message)
    return {"response": response}


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
