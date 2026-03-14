# AirBase Ops — Complete AI Coding Specification

> **Purpose of this document:** This is a complete specification for an AI coding assistant to build the entire application. Every file, component, endpoint, data structure, and interaction is described in full detail. Follow this spec exactly.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Backend — Data Models](#3-backend--data-models)
4. [Backend — Game Logic](#4-backend--game-logic)
5. [Backend — API Endpoints](#5-backend--api-endpoints)
6. [Backend — AI Service](#6-backend--ai-service)
7. [Backend — Scenario Data](#7-backend--scenario-data)
8. [Frontend — Setup & Theming](#8-frontend--setup--theming)
9. [Frontend — State Management](#9-frontend--state-management)
10. [Frontend — Components](#10-frontend--components)
11. [Frontend — Pages & Layout](#11-frontend--pages--layout)
12. [Integration & API Calls](#12-integration--api-calls)
13. [Full Game Flow](#13-full-game-flow)
14. [Environment & Running](#14-environment--running)

---

## 1. PROJECT OVERVIEW

**App Name:** AirBase Ops

**What it is:** A web-based military air base operations dashboard and simulation. It digitizes a physical board game used by Saab to train logistics staff for Gripen dispersed air base operations. The user plays as a base commander managing 10 fighter aircraft through a 7-day scenario escalating from peace to war.

**Core user flow:**
1. User sees a dashboard with 10 aircraft, their statuses, and base resources
2. An ATO (Air Tasking Order) arrives specifying required missions
3. User assigns aircraft to missions (manually or via AI suggestion)
4. User clicks "Execute Turn" — the simulation runs: aircraft fly missions, dice determine outcomes (faults, weapon loss, maintenance delays)
5. Dashboard updates with results. Resources are consumed.
6. Repeat. Each turn = 1 hour of game time. Each day = 24 turns. 7-day scenario.

**Tech stack:**
- Backend: Python 3.11+, FastAPI, Pydantic, uvicorn
- Frontend: React 18 (Vite), Tailwind CSS, Recharts, Lucide React icons
- AI: OpenRouter API with Gemini model
- No database — in-memory state with JSON file persistence

---

## 2. PROJECT STRUCTURE

```
airbase-ops/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── requirements.txt         # Python dependencies
│   ├── models/
│   │   ├── __init__.py
│   │   ├── aircraft.py          # Aircraft model & states
│   │   ├── base.py              # AirBase model
│   │   ├── mission.py           # Mission & ATO models
│   │   ├── resources.py         # Resource models (fuel, weapons, etc.)
│   │   └── game_state.py        # Top-level game state
│   ├── game/
│   │   ├── __init__.py
│   │   ├── dice.py              # Dice roll tables & outcomes
│   │   ├── turn_engine.py       # Turn execution logic
│   │   ├── maintenance.py       # Maintenance state machine
│   │   └── resource_manager.py  # Resource consumption & tracking
│   ├── ai/
│   │   ├── __init__.py
│   │   └── advisor.py           # AI advisor service (OpenRouter)
│   ├── scenarios/
│   │   ├── __init__.py
│   │   └── default_scenario.py  # Initial game state & ATO data for 7 days
│   └── api/
│       ├── __init__.py
│       └── routes.py            # All API route handlers
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.jsx             # React entry
│   │   ├── App.jsx              # Root component with layout
│   │   ├── index.css            # Tailwind imports + custom CSS
│   │   ├── api.js               # API client functions
│   │   ├── components/
│   │   │   ├── FleetBoard.jsx       # Aircraft cards grid
│   │   │   ├── AircraftCard.jsx     # Single aircraft card
│   │   │   ├── AircraftDetail.jsx   # Aircraft detail modal
│   │   │   ├── ResourcePanel.jsx    # Resource gauges sidebar
│   │   │   ├── ResourceGauge.jsx    # Single resource gauge
│   │   │   ├── ATOPanel.jsx         # Mission assignment panel
│   │   │   ├── MissionRow.jsx       # Single mission row
│   │   │   ├── AIChat.jsx           # AI advisor chat panel
│   │   │   ├── TurnResult.jsx       # Turn result summary modal
│   │   │   ├── TimelineBar.jsx      # 24h horizontal timeline
│   │   │   ├── TopBar.jsx           # Day/phase/time display + controls
│   │   │   └── EventLog.jsx         # Scrollable event log
│   │   └── hooks/
│   │       └── useGameState.js      # Custom hook for state polling
│   └── public/
│       └── favicon.ico
└── README.md
```

---

## 3. BACKEND — DATA MODELS

All models use Pydantic v2 `BaseModel`. All IDs are strings.

### 3.1 Aircraft (`models/aircraft.py`)

```python
from enum import Enum
from pydantic import BaseModel
from typing import Optional

class AircraftStatus(str, Enum):
    HANGAR = "HANGAR"                    # In hangar, not prepped
    PRE_FLIGHT = "PRE_FLIGHT"            # Being prepared (klargöring)
    MISSION_CAPABLE = "MISSION_CAPABLE"  # Ready to fly
    ON_MISSION = "ON_MISSION"            # Currently flying a mission
    POST_FLIGHT = "POST_FLIGHT"          # Just landed, being received
    MAINTENANCE = "MAINTENANCE"          # Under repair / corrective or preventive

class MaintenanceType(str, Enum):
    QUICK_LRU = "QUICK_LRU"             # Quick Line Replaceable Unit swap
    COMPLEX_LRU = "COMPLEX_LRU"         # Complex LRU replacement
    DIRECT_REPAIR = "DIRECT_REPAIR"     # Direct repair on aircraft
    TROUBLESHOOT = "TROUBLESHOOT"       # Fault investigation
    WHEEL_REPLACEMENT = "WHEEL_REPLACEMENT"
    COMPOSITE_REPAIR = "COMPOSITE_REPAIR"
    SERVICE_A = "SERVICE_A"             # 5-day scheduled service
    SERVICE_B = "SERVICE_B"             # 8-day scheduled service
    SERVICE_C = "SERVICE_C"             # 20-day scheduled service

class MaintenanceInfo(BaseModel):
    type: MaintenanceType
    total_hours: float                  # Total hours this maintenance takes
    hours_remaining: float              # Hours left until done
    requires_ue: bool = False           # Whether an exchange unit is needed
    facility: str = "Service Bay"       # Where this maintenance happens

class WeaponLoadout(BaseModel):
    missiles: int = 0                   # Air-to-air missiles
    bombs: int = 0                      # Air-to-ground bombs
    pods: int = 0                       # Sensor/recon pods (0 or 1)

class Aircraft(BaseModel):
    id: str                             # e.g. "GE-01", "GE-02", ... "GE-10"
    display_name: str                   # e.g. "Gripen E #01"
    status: AircraftStatus = AircraftStatus.HANGAR
    fuel_level: float = 1000.0          # Liters (max 1000)
    fuel_capacity: float = 1000.0
    total_flight_hours: float = 0.0     # Accumulated flight hours
    hours_until_service: float = 100.0  # Hours until next scheduled service
    weapon_loadout: WeaponLoadout = WeaponLoadout()
    maintenance: Optional[MaintenanceInfo] = None
    assigned_mission_id: Optional[str] = None
    mission_hours_remaining: float = 0  # Hours left on current mission
    pre_flight_hours_remaining: float = 0  # Hours left in pre-flight prep
    post_flight_hours_remaining: float = 0 # Hours left in post-flight
```

### 3.2 Resources (`models/resources.py`)

```python
from pydantic import BaseModel

class BaseResources(BaseModel):
    fuel_storage: float = 50000.0        # Liters of jet fuel in base tanks
    fuel_storage_capacity: float = 50000.0
    missiles: int = 40                   # Air-to-air missiles in stock
    bombs: int = 30                      # Bombs in stock
    pods: int = 6                        # Recon/sensor pods
    spare_parts: int = 20               # Generic spare parts count
    exchange_units: int = 8             # UE (Utbytes Enheter) — critical
    exchange_units_in_repair: int = 0   # UE sent to MRO (30-day cycle)
    exchange_units_in_transit: int = 0  # UE ordered from central depot (5-day)
    ue_repair_days_remaining: list[int] = []   # Days remaining for each UE in MRO
    ue_transit_days_remaining: list[int] = []  # Days remaining for each UE in transit

class PersonnelShift(BaseModel):
    maintenance_crews_on_duty: int = 3   # Number of crews currently working
    maintenance_crews_total: int = 6     # Total crews available
    shift_hours_remaining: float = 8.0   # Hours until shift change
    crews_resting_hours: dict[str, float] = {}  # crew_id → hours until available
```

### 3.3 Mission & ATO (`models/mission.py`)

```python
from enum import Enum
from pydantic import BaseModel
from typing import Optional

class MissionType(str, Enum):
    QRA = "QRA"            # Quick Reaction Alert (luftförsvar)
    DCA = "DCA"            # Defensive Counter-Air
    RECCE = "RECCE"        # Reconnaissance (spaningsuppdrag)
    ATTACK = "ATTACK"      # Air-to-ground attack (AI/DT)
    ESCORT = "ESCORT"      # Escort mission
    AEW = "AEW"            # Airborne Early Warning (GlobalEye — not player-managed, for flavor)

class MissionStatus(str, Enum):
    PENDING = "PENDING"          # Not yet started
    AIRCRAFT_ASSIGNED = "AIRCRAFT_ASSIGNED"  # Aircraft assigned but not launched
    IN_PROGRESS = "IN_PROGRESS"  # Aircraft are flying
    COMPLETED = "COMPLETED"      # Mission done
    FAILED = "FAILED"            # Not enough aircraft / failed to launch

class Mission(BaseModel):
    id: str                              # e.g. "DAY2-DCA-1"
    type: MissionType
    required_aircraft: int               # How many aircraft needed
    assigned_aircraft_ids: list[str] = []
    status: MissionStatus = MissionStatus.PENDING
    scheduled_hour: int                  # Hour of day (0-23) when this mission launches
    duration_hours: float = 2.0          # How long the mission takes
    priority: int = 1                    # 1 = highest priority
    requires_weapons: bool = True        # Whether aircraft need weapons loaded
    requires_pods: bool = False          # Whether recon pods are needed (RECCE)
    
    # Weapon requirements per aircraft for this mission
    missiles_per_aircraft: int = 2
    bombs_per_aircraft: int = 0

class DailyATO(BaseModel):
    day: int                             # Day number (1-7)
    missions: list[Mission]
```

### 3.4 Game State (`models/game_state.py`)

```python
from enum import Enum
from pydantic import BaseModel
from typing import Optional
from .aircraft import Aircraft
from .resources import BaseResources, PersonnelShift
from .mission import DailyATO, Mission

class Phase(str, Enum):
    PEACE = "PEACE"       # Fred
    CRISIS = "CRISIS"     # Kris
    WAR = "WAR"           # Krig

class GameEvent(BaseModel):
    turn: int
    hour: int
    day: int
    message: str
    severity: str = "info"   # "info", "warning", "critical", "success"
    aircraft_id: Optional[str] = None

class GameState(BaseModel):
    current_day: int = 1                 # 1-7
    current_hour: int = 6               # 0-23, start at 06:00
    current_turn: int = 0
    phase: Phase = Phase.PEACE
    aircraft: list[Aircraft] = []
    resources: BaseResources = BaseResources()
    personnel: PersonnelShift = PersonnelShift()
    current_ato: Optional[DailyATO] = None
    event_log: list[GameEvent] = []
    turn_results: list[GameEvent] = []   # Events from the most recent turn only
    is_game_over: bool = False
    
    # Phase mapping per day
    @staticmethod
    def phase_for_day(day: int) -> Phase:
        if day <= 1:
            return Phase.PEACE
        elif day <= 4:
            return Phase.CRISIS
        else:
            return Phase.WAR
```

---

## 4. BACKEND — GAME LOGIC

### 4.1 Dice System (`game/dice.py`)

This implements all the random outcome tables from the Saab board game.

```python
import random
from models.aircraft import MaintenanceType, MaintenanceInfo

def roll_d6() -> int:
    return random.randint(1, 6)

def pre_flight_check() -> tuple[bool, MaintenanceInfo | None]:
    """
    Roll for pre-flight (Loading, Fueling, Arming, BIT startup).
    Returns (success: bool, maintenance_info if fault found).
    
    Roll 1-4: OK
    Roll 5: Fault — Quick LRU replacement, 2 hours
    Roll 6: Fault — Quick LRU replacement, 2 hours
    """
    roll = roll_d6()
    if roll <= 4:
        return True, None
    else:
        return False, MaintenanceInfo(
            type=MaintenanceType.QUICK_LRU,
            total_hours=2.0,
            hours_remaining=2.0,
            requires_ue=True,
            facility="Service Bay (Flight Line)"
        )

def post_flight_check() -> tuple[bool, MaintenanceInfo | None]:
    """
    Roll for post-flight reception.
    
    Roll 1: OK — Wheel replacement needed, 2h (minor)
    Roll 2: OK — Quick LRU, 2h  
    Roll 3: OK — Quick LRU, 2h
    Roll 4: OK — Complex LRU, 6h
    Roll 5: Corrective — Direct repair, 16h
    Roll 6: Corrective — Troubleshoot, 4h
    """
    roll = roll_d6()
    outcomes = {
        1: (True, None),  # OK
        2: (True, None),  # OK
        3: (True, None),  # OK  
        4: (False, MaintenanceInfo(
            type=MaintenanceType.COMPLEX_LRU,
            total_hours=6.0,
            hours_remaining=6.0,
            requires_ue=True,
            facility="Minor Maint Workshop"
        )),
        5: (False, MaintenanceInfo(
            type=MaintenanceType.DIRECT_REPAIR,
            total_hours=16.0,
            hours_remaining=16.0,
            requires_ue=False,
            facility="Major Maint Workshop"
        )),
        6: (False, MaintenanceInfo(
            type=MaintenanceType.TROUBLESHOOT,
            total_hours=4.0,
            hours_remaining=4.0,
            requires_ue=False,
            facility="Service Bay"
        )),
    }
    return outcomes[roll]

def weapon_loss_roll() -> float:
    """
    After a mission with weapons, roll for how many weapons are consumed/lost.
    Returns fraction lost (0.1 to 1.0).
    
    Roll 1: 10%, Roll 2: 30%, Roll 3: 50%, Roll 4: 70%, Roll 5: 90%, Roll 6: 100%
    """
    roll = roll_d6()
    loss_table = {1: 0.1, 2: 0.3, 3: 0.5, 4: 0.7, 5: 0.9, 6: 1.0}
    return loss_table[roll]

def maintenance_time_variance() -> float:
    """
    When maintenance nominal time is reached, roll to see if extra time is needed.
    Returns multiplier (1.0 = no extra, 1.5 = 50% extra).
    
    Roll 1-3: 0% extra, Roll 4: +10%, Roll 5: +20%, Roll 6: +50%
    """
    roll = roll_d6()
    variance_table = {1: 1.0, 2: 1.0, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.5}
    return variance_table[roll]
```

### 4.2 Turn Engine (`game/turn_engine.py`)

This is the core simulation. Each call to `execute_turn(state)` advances the game by 1 hour.

```python
"""
Turn execution logic. Each turn = 1 hour of game time.

Turn sequence:
1. Process aircraft currently ON_MISSION — decrement mission timer, handle completion
2. Process aircraft in PRE_FLIGHT — decrement prep timer, if done → dice check
3. Process aircraft in POST_FLIGHT — decrement timer, if done → dice check
4. Process aircraft in MAINTENANCE — decrement repair timer, if done → available
5. Launch missions that are due this hour
6. Consume resources (fuel for flying aircraft)
7. Handle personnel shifts
8. Advance time
9. Check for new day → load next ATO
"""
```

**Detailed turn logic (implement all of this):**

**Step 1 — Process ON_MISSION aircraft:**
- For each aircraft with `status == ON_MISSION`:
  - Decrement `mission_hours_remaining` by 1
  - Decrement `fuel_level` by 200 (per hour of flight)
  - Increment `total_flight_hours` by 1
  - Decrement `hours_until_service` by 1
  - If `mission_hours_remaining <= 0`: set `status = POST_FLIGHT`, set `post_flight_hours_remaining = 0.5` (30 min post-flight). Log event: "Aircraft {id} returned from mission"
  - If `fuel_level < 0`: set to 0, log critical event: "Aircraft {id} emergency — fuel critically low"

**Step 2 — Process PRE_FLIGHT aircraft:**
- For each aircraft with `status == PRE_FLIGHT`:
  - Decrement `pre_flight_hours_remaining` by 1
  - If `pre_flight_hours_remaining <= 0`:
    - Call `pre_flight_check()` dice roll
    - If OK: set `status = MISSION_CAPABLE`. Log: "Aircraft {id} passed pre-flight checks — mission capable"
    - If FAULT: set `status = MAINTENANCE`, set `maintenance` field from dice result. If `requires_ue`, decrement `resources.exchange_units` by 1 (if 0, log critical: "No exchange units available! Aircraft {id} grounded"). Log warning: "Aircraft {id} fault during pre-flight: {maintenance_type}, est. {hours}h repair"

**Step 3 — Process POST_FLIGHT aircraft:**
- For each aircraft with `status == POST_FLIGHT`:
  - Decrement `post_flight_hours_remaining` by 1
  - If `post_flight_hours_remaining <= 0`:
    - Call `post_flight_check()` dice roll
    - If OK: set `status = MISSION_CAPABLE`. Log: "Aircraft {id} post-flight OK — mission capable"
    - If FAULT: set `status = MAINTENANCE`, set `maintenance` from dice. Log warning.
    - Also call `weapon_loss_roll()` for returning mission aircraft. Reduce `weapon_loadout.missiles` by the loss fraction. Log info: "Aircraft {id} weapons expenditure: {x} missiles consumed"

**Step 4 — Process MAINTENANCE aircraft:**
- For each aircraft with `status == MAINTENANCE` and `maintenance is not None`:
  - Decrement `maintenance.hours_remaining` by 1
  - If `maintenance.hours_remaining <= 0`:
    - Call `maintenance_time_variance()` dice roll
    - If variance > 1.0: set `maintenance.hours_remaining` to extra hours, log: "Aircraft {id} maintenance delayed — extra {x}h needed (T++)"
    - If variance == 1.0 (or already applied): set `status = HANGAR`, clear `maintenance`. Log success: "Aircraft {id} maintenance complete — returned to hangar"

**Step 5 — Launch scheduled missions:**
- For each mission in `current_ato.missions` where `scheduled_hour == current_hour` and `status == AIRCRAFT_ASSIGNED`:
  - For each `aircraft_id` in `assigned_aircraft_ids`:
    - Get the aircraft. If `status != MISSION_CAPABLE`: log warning "Aircraft {id} not ready for mission — skipping". Remove from assignment.
    - If ready: set `status = ON_MISSION`, set `mission_hours_remaining = mission.duration_hours`. Consume fuel: deduct 50L for takeoff from aircraft fuel. Log: "Aircraft {id} launched on {mission_type} mission"
  - If enough aircraft launched: set mission `status = IN_PROGRESS`. Log success.
  - If not enough: set `status = FAILED`. Log critical.

**Step 6 — Resource management:**
- Base fuel consumption: nothing per turn at base level (fuel is consumed per-aircraft during flight and refueling)
- For each MISSION_CAPABLE aircraft: if `fuel_level < fuel_capacity`, refuel at rate of 500L/hour from base `fuel_storage` (deduct from `fuel_storage`, add to aircraft `fuel_level`, cap at `fuel_capacity`)
- UE repair cycle: at hour 0 of each day, for each entry in `ue_repair_days_remaining`, decrement by 1. If reaches 0, increment `exchange_units` by 1, remove from list. Same for `ue_transit_days_remaining`.

**Step 7 — Personnel:**
- Decrement `personnel.shift_hours_remaining` by 1
- If reaches 0: swap shifts. Set `maintenance_crews_on_duty` to `maintenance_crews_total - maintenance_crews_on_duty`. Reset `shift_hours_remaining = 8`.
- Maintenance throughput: only `maintenance_crews_on_duty` aircraft can be actively repaired at once. If more aircraft in MAINTENANCE than crews, the rest wait (their timers don't decrement).

**Step 8 — Advance time:**
- Increment `current_hour` by 1
- Increment `current_turn` by 1
- If `current_hour >= 24`: set `current_hour = 0`, increment `current_day`, set `phase` per `phase_for_day()`, load next day's ATO

**Step 9 — Auto-prep:**
- For aircraft in HANGAR with no assignment: optionally auto-set to PRE_FLIGHT if there are upcoming missions needing aircraft. Set `pre_flight_hours_remaining = 1.0` (1 hour prep time).

### 4.3 Maintenance Logic (`game/maintenance.py`)

Implements the maintenance state machine and UE (exchange unit) cycle.

- When an aircraft enters MAINTENANCE and `requires_ue == True`:
  - Check `resources.exchange_units > 0`
  - If yes: deduct 1 from `exchange_units`. After maintenance completes, the old UE goes to MRO: append `30` to `ue_repair_days_remaining`.
  - If no: aircraft is GROUNDED. Cannot be repaired until a UE becomes available. Log critical event. Set `maintenance.hours_remaining` to 999 (blocked).
- "Plundering" (cannibalizing from another aircraft): NOT implemented in this version (the board game allows it but it's complex — mention it in the presentation as a future feature).

### 4.4 Resource Manager (`game/resource_manager.py`)

Functions for:
- `refuel_aircraft(aircraft, resources)` — refuel from base storage
- `arm_aircraft(aircraft, mission, resources)` — load weapons from base inventory onto aircraft
- `consume_fuel_in_flight(aircraft)` — deduct fuel during mission
- `check_resource_warnings(resources)` → list of warning strings when resources are low (< 20% fuel, < 5 UE, etc.)

---

## 5. BACKEND — API ENDPOINTS

All endpoints in `api/routes.py`. Use FastAPI `APIRouter`.

### `GET /api/state`
Returns the full `GameState` as JSON.

### `POST /api/start-game`
Body: `{}` (no params)
Initializes a new game from the default scenario. Returns the initial `GameState`.

### `POST /api/assign`
Body:
```json
{
  "mission_id": "DAY2-DCA-1",
  "aircraft_ids": ["GE-01", "GE-03"]
}
```
Assigns aircraft to a mission. Validates:
- Aircraft must be MISSION_CAPABLE or HANGAR (will auto-start pre-flight)
- Aircraft must not already be assigned to another mission
- Number of aircraft must match or be less than `required_aircraft`

Returns updated `GameState`.

### `POST /api/unassign`
Body:
```json
{
  "mission_id": "DAY2-DCA-1",
  "aircraft_id": "GE-01"
}
```
Removes an aircraft from a mission assignment. Returns updated `GameState`.

### `POST /api/advance-turn`
Body: `{}` 
Executes one turn (1 hour). Returns updated `GameState` with `turn_results` populated with events from this turn.

### `POST /api/advance-multiple`
Body:
```json
{
  "turns": 4
}
```
Executes multiple turns at once (useful for fast-forward). Returns updated `GameState`.

### `POST /api/prep-aircraft`
Body:
```json
{
  "aircraft_id": "GE-05"
}
```
Manually starts pre-flight preparation on a HANGAR aircraft. Sets it to PRE_FLIGHT with 1h timer.

### `POST /api/arm-aircraft`
Body:
```json
{
  "aircraft_id": "GE-01",
  "missiles": 2,
  "bombs": 0,
  "pods": 0
}
```
Loads weapons onto a MISSION_CAPABLE aircraft from base inventory.

### `POST /api/ai/suggest`
Body: `{}`
Sends current game state to AI, asks for optimal aircraft-to-mission allocation. Returns:
```json
{
  "suggestion": "I recommend assigning GE-01 and GE-03 to DCA-1 because...",
  "assignments": [
    {"mission_id": "DAY2-DCA-1", "aircraft_ids": ["GE-01", "GE-03"]},
    {"mission_id": "DAY2-RECCE-1", "aircraft_ids": ["GE-07"]}
  ]
}
```

### `POST /api/ai/chat`
Body:
```json
{
  "message": "What's our fuel situation looking like?"
}
```
Returns:
```json
{
  "response": "Current fuel reserves are at 72% capacity with 36,000L remaining..."
}
```

### `POST /api/save`
Saves current game state to `savegame.json`.

### `POST /api/load`
Loads game state from `savegame.json`.

### CORS
Enable CORS for all origins (development):
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
```

---

## 6. BACKEND — AI SERVICE

### `ai/advisor.py`

Uses OpenRouter API with Gemini.

```python
import os
import json
import httpx

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "google/gemini-2.0-flash-001"

SYSTEM_PROMPT = """You are AirBase AI, an expert Swedish military logistics advisor for dispersed air base operations (flygbasoperationer). You help base commanders (basbatchefer) optimize aircraft allocation, maintenance scheduling, and resource management for Gripen fighter jets.

You always give specific, actionable advice referencing aircraft by their IDs (e.g., GE-01). You understand the following domain:

AIRCRAFT STATES:
- HANGAR: Not prepared. Needs 1h pre-flight prep (klargöring) before becoming mission capable.
- PRE_FLIGHT: Being prepared. 1/3 chance of fault discovery.
- MISSION_CAPABLE: Ready to fly. Can be assigned to missions.
- ON_MISSION: Currently flying. Duration depends on mission type.
- POST_FLIGHT: Just landed. 50% chance of needing maintenance.
- MAINTENANCE: Under repair. Duration varies by fault type (2-16 hours).

RESOURCE CONSTRAINTS:
- Fuel: Each aircraft tank holds 1000L. Each flight hour uses ~200L. Base stores limited fuel.
- Weapons: Missiles and bombs from base inventory. 10-100% consumed per mission (random).
- Exchange Units (UE): Critical spare components. Limited supply. 30-day MRO repair cycle.
- Personnel: Maintenance crews work 8-hour shifts. Each crew handles 1 aircraft at a time.

SCENARIO:
- 7-day escalation: Day 1 Peace, Days 2-4 Crisis, Days 5-7 War
- Mission tempo increases each phase. War phase requires maximum sortie generation.

RULES FOR GOOD ADVICE:
- Never send all best aircraft at once — keep reserves
- Prioritize aircraft with most flight hours before service
- Balance maintenance to avoid fleet-wide downtime
- Watch resource burn rates — will fuel/UE last through the scenario?
- Consider personnel shift schedules

Respond concisely. Use Swedish terms naturally (klargöring, underhåll, flygplan, etc.) but write in English.
When asked for allocation suggestions, respond with a JSON block containing assignments."""


async def ai_suggest(game_state_dict: dict) -> dict:
    """Ask AI for optimal mission allocation."""
    state_summary = json.dumps(game_state_dict, indent=2, default=str)
    
    user_msg = f"""Current game state:
{state_summary}

Analyze the current ATO missions and fleet status. Suggest which aircraft should be assigned to which missions and explain your reasoning briefly.

Respond with this exact JSON format at the end of your response:
```json
{{
  "assignments": [
    {{"mission_id": "...", "aircraft_ids": ["...", "..."]}}
  ]
}}
```"""
    
    response = await _call_openrouter(SYSTEM_PROMPT, user_msg)
    return {"suggestion": response}


async def ai_chat(game_state_dict: dict, user_message: str) -> str:
    """Free-form chat about the operational situation."""
    state_summary = json.dumps(game_state_dict, indent=2, default=str)
    
    user_msg = f"""Current game state:
{state_summary}

Commander's question: {user_message}

Provide a concise, actionable answer."""
    
    response = await _call_openrouter(SYSTEM_PROMPT, user_msg)
    return response


async def _call_openrouter(system_prompt: str, user_message: str) -> str:
    """Make API call to OpenRouter."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                "max_tokens": 1000,
                "temperature": 0.7,
            },
        )
        data = resp.json()
        return data["choices"][0]["message"]["content"]
```

**Important:** The API key is passed as an environment variable `OPENROUTER_API_KEY`. Never hardcode it.

---

## 7. BACKEND — SCENARIO DATA

### `scenarios/default_scenario.py`

This creates the initial game state and all 7 days of ATO.

**Initial Aircraft Fleet (10 Gripen E):**

| ID | Display Name | Hours Until Service | Initial Status |
|----|-------------|-------------------|---------------|
| GE-01 | Gripen E #01 | 93 | HANGAR |
| GE-02 | Gripen E #02 | 67 | HANGAR |
| GE-03 | Gripen E #03 | 20 | HANGAR |
| GE-04 | Gripen E #04 | 54 | HANGAR |
| GE-05 | Gripen E #05 | 10 | HANGAR |
| GE-06 | Gripen E #06 | 84 | HANGAR |
| GE-07 | Gripen E #07 | 41 | HANGAR |
| GE-08 | Gripen E #08 | 78 | HANGAR |
| GE-09 | Gripen E #09 | 36 | HANGAR |
| GE-10 | Gripen E #10 | 29 | HANGAR |

(These "hours until service" values match the fleet management table from the Saab document, page 13)

All aircraft start with full fuel (1000L), no weapons loaded.

**ATO Per Day:**

**Day 1 — PEACE:**
- QRA: 2 aircraft, H24 (continuous — generate 2 QRA missions at hours 06, 18), 2h each, priority 1, missiles: 2/aircraft
- RECCE: 1 aircraft at hour 10, 2h, priority 2, pods: 1, missiles: 0, bombs: 0

**Day 2 — CRISIS:**
- DCA: 2 aircraft at hours 08 and 16, 2h each, priority 1, missiles: 4/aircraft
- RECCE: 2 aircraft at hours 10 and 14, 2h each, priority 2, pods: 1
- QRA: 2 aircraft at hour 06, 2h, priority 1, missiles: 2/aircraft

**Day 3 — CRISIS:**
- DCA: 4 aircraft at hours 06, 10, 14, 18, 2h each, priority 1, missiles: 4/aircraft
- RECCE: 2 aircraft at hours 08 and 12, 2h, priority 2, pods: 1
- ATTACK: 2 aircraft at hour 11, 3h, priority 1, missiles: 2, bombs: 4

**Day 4 — CRISIS + CM ATTACK:**
- Same as Day 3 but at hour 12, event: "Base under cruise missile attack! Runway damaged — 2h repair." All PRE_FLIGHT aircraft reset to HANGAR. 2 random aircraft in HANGAR take light damage (add 4h maintenance).

**Day 5 — WAR:**
- DCA: 4 aircraft at hours 06, 10, 14, 18, 2h each, priority 1
- ATTACK: 4 aircraft (2 at hour 08, 2 at hour 15), 3h, priority 1, missiles: 2, bombs: 4
- RECCE: 2 aircraft at hours 07 and 13, 2h, priority 2, pods: 1

**Day 6 — WAR:**
- Same as Day 5 with increased frequency: DCA at hours 05, 09, 13, 17, 21

**Day 7 — WAR:**
- Maximum tempo: DCA at hours 04, 08, 12, 16, 20 (5 missions), ATTACK at 06, 14 (2 missions), RECCE at 10, 18 (2 missions)

**Initial resources:**
```python
BaseResources(
    fuel_storage=50000.0,
    fuel_storage_capacity=50000.0,
    missiles=40,
    bombs=30,
    pods=6,
    spare_parts=20,
    exchange_units=8,
    exchange_units_in_repair=0,
    exchange_units_in_transit=0,
    ue_repair_days_remaining=[],
    ue_transit_days_remaining=[]
)
```

---

## 8. FRONTEND — SETUP & THEMING

### Design Direction
**Dark military command center aesthetic.** Think: dark navy/slate backgrounds, bright status colors, monospace data fonts, clean card layouts with subtle borders, glowing accent colors.

### Color Palette (Tailwind custom config + CSS variables)

```css
:root {
  --bg-primary: #0a0f1a;        /* Very dark navy — main background */
  --bg-secondary: #111827;       /* Dark card background */
  --bg-tertiary: #1f2937;        /* Lighter card/panel background */
  --border-color: #374151;       /* Subtle borders */
  --border-accent: #4b5563;      /* Hover borders */
  --text-primary: #f9fafb;       /* White text */
  --text-secondary: #9ca3af;     /* Gray text */
  --text-muted: #6b7280;         /* Muted text */
  
  /* Status colors */
  --status-ready: #22c55e;       /* Green — Mission Capable */
  --status-mission: #3b82f6;     /* Blue — On Mission */
  --status-prep: #eab308;        /* Yellow — Pre-flight / Post-flight */
  --status-maintenance: #ef4444; /* Red — Maintenance */
  --status-hangar: #6b7280;      /* Gray — Hangar */
  
  /* Resource gauge colors */
  --fuel-color: #f59e0b;         /* Amber for fuel */
  --weapons-color: #ef4444;      /* Red for weapons */
  --ue-color: #8b5cf6;           /* Purple for exchange units */
  --personnel-color: #06b6d4;    /* Cyan for personnel */
  
  /* Phase colors */
  --phase-peace: #22c55e;        /* Green */
  --phase-crisis: #f59e0b;       /* Amber */
  --phase-war: #ef4444;          /* Red */
  
  /* AI chat */
  --ai-accent: #06b6d4;          /* Cyan for AI messages */
}
```

### Fonts
- **Headings & UI:** `"JetBrains Mono", "Fira Code", monospace` — gives the military/tech feel
- **Body text:** `"Inter", system-ui, sans-serif`
- Import JetBrains Mono from Google Fonts in `index.html`

### Tailwind Config
Extend with the custom colors above. Use `darkMode: 'class'` but default to dark.

### Global Styles (`index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
}

.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }

/* Glowing status indicators */
.status-glow-green { box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }
.status-glow-blue { box-shadow: 0 0 8px rgba(59, 130, 246, 0.4); }
.status-glow-yellow { box-shadow: 0 0 8px rgba(234, 179, 8, 0.4); }
.status-glow-red { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
```

---

## 9. FRONTEND — STATE MANAGEMENT

Use React `useState` + `useEffect` for state. No Redux needed.

### `hooks/useGameState.js`

```javascript
import { useState, useCallback } from 'react';
import * as api from '../api';

export function useGameState() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchState = useCallback(async () => {
    try {
      const data = await api.getState();
      setGameState(data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const startGame = useCallback(async () => {
    setLoading(true);
    const data = await api.startGame();
    setGameState(data);
    setLoading(false);
  }, []);

  const advanceTurn = useCallback(async () => {
    setLoading(true);
    const data = await api.advanceTurn();
    setGameState(data);
    setLoading(false);
  }, []);

  const assignAircraft = useCallback(async (missionId, aircraftIds) => {
    const data = await api.assignAircraft(missionId, aircraftIds);
    setGameState(data);
  }, []);

  // ... more actions

  return { gameState, loading, error, fetchState, startGame, advanceTurn, assignAircraft };
}
```

### `api.js`

```javascript
const BASE_URL = 'http://localhost:8000/api';

export async function getState() {
  const res = await fetch(`${BASE_URL}/state`);
  return res.json();
}

export async function startGame() {
  const res = await fetch(`${BASE_URL}/start-game`, { method: 'POST' });
  return res.json();
}

export async function advanceTurn() {
  const res = await fetch(`${BASE_URL}/advance-turn`, { method: 'POST' });
  return res.json();
}

export async function advanceMultiple(turns) {
  const res = await fetch(`${BASE_URL}/advance-multiple`, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turns })
  });
  return res.json();
}

export async function assignAircraft(missionId, aircraftIds) {
  const res = await fetch(`${BASE_URL}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mission_id: missionId, aircraft_ids: aircraftIds })
  });
  return res.json();
}

export async function unassignAircraft(missionId, aircraftId) {
  const res = await fetch(`${BASE_URL}/unassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mission_id: missionId, aircraft_id: aircraftId })
  });
  return res.json();
}

export async function prepAircraft(aircraftId) {
  const res = await fetch(`${BASE_URL}/prep-aircraft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aircraft_id: aircraftId })
  });
  return res.json();
}

export async function armAircraft(aircraftId, missiles, bombs, pods) {
  const res = await fetch(`${BASE_URL}/arm-aircraft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ aircraft_id: aircraftId, missiles, bombs, pods })
  });
  return res.json();
}

export async function aiSuggest() {
  const res = await fetch(`${BASE_URL}/ai/suggest`, { method: 'POST' });
  return res.json();
}

export async function aiChat(message) {
  const res = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return res.json();
}
```

---

## 10. FRONTEND — COMPONENTS

### 10.1 `TopBar.jsx`
Horizontal bar at the top of the screen.
- Left: App title "AIRBASE OPS" in monospace bold + Saab-style icon (use a plane icon from Lucide)
- Center: Day indicator ("DAY 2 / 7"), Phase badge (colored: green PEACE, amber CRISIS, red WAR), Time display ("14:00" in large monospace)
- Right: Action buttons:
  - "Advance 1h" (primary button, runs 1 turn)
  - "Advance 4h" (secondary button, runs 4 turns)
  - "New Game" (small button)
- Show turn count below time: "Turn 32 / 168"

### 10.2 `FleetBoard.jsx`
Grid of aircraft cards (2 rows × 5 columns, or responsive).
- Title: "FLEET STATUS" with count: "6/10 Mission Capable"
- Maps over `gameState.aircraft` and renders an `AircraftCard` for each
- Clicking a card opens `AircraftDetail` modal

### 10.3 `AircraftCard.jsx`
Props: `{ aircraft, onSelect, onPrep }`

A compact card (~180×220px) showing:
- **Header:** Aircraft ID in monospace bold (e.g., "GE-01"), small status badge dot
- **Status:** Full status text with colored background:
  - HANGAR → gray bg, "HANGAR" text
  - PRE_FLIGHT → yellow bg, "PREPPING" + progress bar (hours remaining)
  - MISSION_CAPABLE → green bg, "READY"
  - ON_MISSION → blue bg, "ON MISSION" + time remaining
  - POST_FLIGHT → yellow bg, "LANDING"
  - MAINTENANCE → red bg, "MAINT: {type}" + hours remaining
- **Fuel bar:** Horizontal bar, amber colored, showing fuel_level/1000 with label "680L"
- **Service counter:** "Svc: 41h" (hours until service) — text turns red if < 15
- **Weapons:** Small icons: 🚀×2 (missiles), 💣×0 (bombs), 📡×1 (pods)
- **Bottom:** If HANGAR, show "PREP" button. If MISSION_CAPABLE, show green checkmark.

Card has subtle border that matches status color. On hover, slight lift/glow effect.

### 10.4 `AircraftDetail.jsx`
Modal overlay showing full details of one aircraft when clicked.
- All fields from the Aircraft model displayed nicely
- If in MAINTENANCE: show maintenance type, facility, time remaining, whether UE is used
- Flight hours history bar
- Action buttons: "Start Prep" (if HANGAR), "Arm" (if MISSION_CAPABLE, opens weapon selection)
- Close button (X) in corner

### 10.5 `ResourcePanel.jsx`
Vertical sidebar on the right side of the screen.
- Title: "BASE RESOURCES"
- Shows gauges/bars for each resource:

Each resource as a `ResourceGauge`:
- **Fuel:** Amber bar, "{current}L / {max}L" + percentage
- **Missiles:** Red, count display "{current} / {initial}"
- **Bombs:** Red, count
- **Pods:** Count only (small)
- **Spare Parts:** Count
- **Exchange Units:** Purple, "{available} available, {in_repair} in MRO, {in_transit} in transit"
- **Personnel:** Cyan, "{on_duty} crews on duty / {total} total" + "Shift change in {hours}h"

Each gauge changes color to red when below 20% capacity.

### 10.6 `ResourceGauge.jsx`
Props: `{ label, current, max, color, icon, subtitle }`
- Label text
- Horizontal bar (colored fill proportional to current/max)
- Numeric display
- Optional subtitle text
- If max is null, just show the number (for discrete counts)

### 10.7 `ATOPanel.jsx`
Panel showing today's missions and assignment interface.
- Title: "AIR TASKING ORDER — DAY {n}" with phase badge
- List of missions, each as a `MissionRow`
- Button: "🤖 AI Suggest Allocation" — calls `/ai/suggest`, then auto-fills assignments
- Summary: "Missions: 5 pending, 2 in progress, 1 completed"

### 10.8 `MissionRow.jsx`
Props: `{ mission, aircraft, onAssign, onUnassign }`

A row showing one mission:
- Left: Mission type badge (color-coded: DCA=blue, RECCE=green, ATTACK=red, QRA=yellow) + mission ID
- Center: "Requires {n} aircraft" + scheduled time "at 14:00"
- Assignment area: Show assigned aircraft IDs as removable tags/chips. Empty slots shown as "[ + Assign ]" buttons.
- Status badge: PENDING (gray), ASSIGNED (yellow), IN_PROGRESS (blue), COMPLETED (green), FAILED (red)
- When clicking "Assign", show a dropdown of MISSION_CAPABLE aircraft not yet assigned to other missions
- Weapon requirements shown: "Needs: 2× missiles per aircraft"

### 10.9 `AIChat.jsx`
Collapsible chat panel (right side or drawer).
- Title: "AI ADVISOR" with robot icon
- Scrollable message area:
  - AI messages: left-aligned, cyan accent border, monospace font
  - User messages: right-aligned, darker background
- Input area at bottom: text field + Send button
- Pre-built quick action buttons above input: "Assess readiness", "Fuel forecast", "Maintenance priorities"
- Loading state while AI responds (animated dots)
- Messages stored in local React state

### 10.10 `TurnResult.jsx`
After `advanceTurn` returns, show a brief animated overlay/toast system for the events.
- Slide-in notifications for each event in `turn_results`:
  - Green toast: success events ("GE-01 mission capable")
  - Yellow toast: warnings ("GE-05 fault during pre-flight")
  - Red toast: critical ("No exchange units! GE-05 grounded")
  - Blue toast: info ("GE-03 launched on DCA mission")
- Auto-dismiss after 3 seconds each, or show as a list in a panel
- Also append to the EventLog

### 10.11 `EventLog.jsx`
Scrollable log at the bottom or in a collapsible drawer.
- Shows all `gameState.event_log` entries
- Each entry: timestamp (Day X, HH:00), colored severity icon, message text
- Auto-scrolls to bottom on new entries
- Filter buttons: All / Critical / Warnings / Info

### 10.12 `TimelineBar.jsx`
Horizontal 24-hour timeline at the bottom of the screen.
- Hours 00-23 marked along the top
- Current hour highlighted with a vertical red line
- Missions shown as colored blocks at their scheduled hours:
  - Width proportional to duration
  - Color matches mission type
  - Label: mission type + aircraft count
- Completed missions slightly faded

---

## 11. FRONTEND — PAGES & LAYOUT

### Single-page layout (`App.jsx`)

```
┌──────────────────────────────────────────────────────────────┐
│  TopBar (Day, Phase, Time, Action Buttons)                    │
├───────────────┬────────────────────────────┬─────────────────┤
│               │                            │                 │
│  ATO Panel    │    Fleet Board             │  Resource Panel │
│  (left,       │    (center, main area)     │  (right,        │
│   ~300px)     │    (2×5 grid of aircraft)  │   ~250px)       │
│               │                            │                 │
│               │                            │                 │
│               │                            │                 │
├───────────────┴────────────────────────────┴─────────────────┤
│  TimelineBar (24h horizontal timeline)                        │
├──────────────────────────────────────────────────────────────┤
│  EventLog (collapsible, 3-4 lines visible)                    │
└──────────────────────────────────────────────────────────────┘

AI Chat: Floating panel, toggled by a button in TopBar. 
         Appears as a right-side drawer overlaying the ResourcePanel.
```

**Responsive:** On smaller screens, stack ATO Panel above FleetBoard, move ResourcePanel below.

**Initial state:** When no game is running, show a centered "START NEW GAME" screen with the app title, a brief description, and a big button. When clicked, calls `/api/start-game` and transitions to the dashboard.

---

## 12. INTEGRATION & API CALLS

### Startup Flow
1. `App.jsx` mounts → calls `GET /api/state`
2. If no game state (null/error) → show Start Game screen
3. User clicks "Start New Game" → `POST /api/start-game` → receive full state → render dashboard

### Turn Flow
1. User clicks "Advance 1h" → `POST /api/advance-turn`
2. Receive new state with `turn_results`
3. Display turn result events as toasts
4. Update all components with new state

### Assignment Flow
1. User clicks [+ Assign] on a mission row
2. Dropdown shows MISSION_CAPABLE aircraft (filtered: not already assigned elsewhere)
3. User selects an aircraft → `POST /api/assign { mission_id, aircraft_ids: [selected] }`
4. State updates, aircraft shows as assigned

### AI Suggest Flow
1. User clicks "AI Suggest Allocation"
2. Loading state on button
3. `POST /api/ai/suggest` → returns suggestion text + assignments array
4. Show AI suggestion text in a popup/modal
5. "Apply Suggestions" button → calls `/api/assign` for each assignment in the array
6. State updates

### AI Chat Flow
1. User types message → sends via `POST /api/ai/chat { message }`
2. Show loading indicator
3. Receive response → display in chat window

### Polling (optional)
Poll `GET /api/state` every 5 seconds as a fallback to keep UI in sync. Not critical for single-user.

---

## 13. FULL GAME FLOW

### Start of Game
1. 10 aircraft in HANGAR, all resources full
2. Day 1 ATO loaded: 2 QRA missions + 1 RECCE
3. Phase: PEACE

### Typical Turn Sequence (Player Actions)
1. **Look at ATO:** See what missions need aircraft today
2. **Prep aircraft:** Click "PREP" on HANGAR aircraft to start pre-flight (or they auto-prep)
3. **Wait for prep:** Advance turns. After 1h, aircraft either become MISSION_CAPABLE or go to MAINTENANCE
4. **Assign to missions:** Drag/click MISSION_CAPABLE aircraft into mission slots
5. **Arm aircraft:** Load weapons needed for the mission type
6. **Advance to mission hour:** Keep advancing turns until the scheduled mission hour
7. **Mission launches automatically** when the scheduled hour arrives (if aircraft assigned)
8. **Mission in progress:** Aircraft are ON_MISSION for the duration
9. **Post-flight:** Aircraft return, dice rolled for condition
10. **Maintenance:** Fix any broken aircraft
11. **Repeat**

### Day Transition
- When hour reaches 24, new day starts at hour 0
- New ATO loaded automatically
- Phase may change (PEACE → CRISIS at Day 2, CRISIS → WAR at Day 5)
- UE repair/transit days decrement

### Win/Lose Conditions
- No explicit win/lose — the game is a training tool
- Track "mission success rate" (completed / total missions)
- Track "sortie generation rate" (total sorties flown)
- At end of Day 7, show summary statistics
- Implicit goal: complete as many missions as possible with maximum fleet availability

### Special Event: Day 4 CM Attack
At hour 12 on Day 4, trigger automatically:
- Log critical: "⚠️ BASE UNDER CRUISE MISSILE ATTACK! Runway damaged!"
- All PRE_FLIGHT aircraft → HANGAR (prep interrupted)
- 2 random HANGAR aircraft get 4h maintenance added
- Runway repair: missions cannot launch for 2 hours (hour 12-14)
- This tests the player's ability to recover and re-plan

---

## 14. ENVIRONMENT & RUNNING

### Backend Setup
```bash
cd backend
pip install fastapi uvicorn pydantic httpx
# Set API key:
export OPENROUTER_API_KEY="your-key-here"
# Run:
uvicorn main:app --reload --port 8000
```

### `backend/requirements.txt`
```
fastapi>=0.104.0
uvicorn>=0.24.0
pydantic>=2.0.0
httpx>=0.25.0
```

### `backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(title="AirBase Ops API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
```

### Frontend Setup
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install recharts lucide-react
npm run dev
```

### `frontend/vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

### Running Both
Terminal 1: `cd backend && uvicorn main:app --reload --port 8000`
Terminal 2: `cd frontend && npm run dev`

Open: `http://localhost:5173`

---

## APPENDIX A: QUICK REFERENCE — STATUS COLORS

| Status | Tailwind BG | Text | Glow |
|--------|------------|------|------|
| HANGAR | bg-gray-700 | text-gray-300 | none |
| PRE_FLIGHT | bg-yellow-900/50 | text-yellow-400 | status-glow-yellow |
| MISSION_CAPABLE | bg-green-900/50 | text-green-400 | status-glow-green |
| ON_MISSION | bg-blue-900/50 | text-blue-400 | status-glow-blue |
| POST_FLIGHT | bg-yellow-900/50 | text-yellow-400 | status-glow-yellow |
| MAINTENANCE | bg-red-900/50 | text-red-400 | status-glow-red |

## APPENDIX B: MISSION TYPE COLORS

| Mission | Color | Badge BG |
|---------|-------|----------|
| QRA | Yellow | bg-yellow-600 |
| DCA | Blue | bg-blue-600 |
| RECCE | Green | bg-green-600 |
| ATTACK | Red | bg-red-600 |
| ESCORT | Purple | bg-purple-600 |
| AEW | Cyan | bg-cyan-600 |

## APPENDIX C: GAME CONSTANTS

```python
FUEL_CONSUMPTION_PER_FLIGHT_HOUR = 200     # liters
FUEL_TAKEOFF_COST = 50                      # liters
REFUEL_RATE_PER_HOUR = 500                  # liters/hour (on ground)
PRE_FLIGHT_DURATION = 1.0                   # hours
POST_FLIGHT_DURATION = 0.5                  # hours
MAX_FUEL_CAPACITY = 1000                    # liters per aircraft
MAX_MAINTENANCE_CREWS_PER_SHIFT = 3
SHIFT_DURATION = 8                          # hours
UE_MRO_DAYS = 30                            # days to repair an exchange unit
UE_TRANSIT_DAYS = 5                         # days to receive from central depot
SERVICE_A_DAYS = 5                          # days for A-service (120 hours)
SERVICE_B_DAYS = 8                          # days (192 hours)
SERVICE_C_DAYS = 20                         # days (480 hours)
SERVICE_INTERVAL = 100                      # flight hours between services
HOURS_PER_DAY = 24
TOTAL_DAYS = 7
TOTAL_TURNS = HOURS_PER_DAY * TOTAL_DAYS   # 168 turns
```

## APPENDIX D: TESTING CHECKLIST

Before demo, verify:
- [ ] New game starts with 10 aircraft in HANGAR
- [ ] Aircraft can be prepped (HANGAR → PRE_FLIGHT → MISSION_CAPABLE)
- [ ] Pre-flight dice roll works (sometimes causes faults)
- [ ] Aircraft can be assigned to missions
- [ ] Missions launch at scheduled hour
- [ ] Post-flight dice roll works
- [ ] Maintenance timer counts down
- [ ] Maintenance time variance (T++) works
- [ ] Fuel decreases during flight and refills on ground
- [ ] Weapons are consumed after missions
- [ ] Exchange units are consumed and enter MRO cycle
- [ ] Day transitions work (new ATO, phase change)
- [ ] Day 4 CM attack event fires
- [ ] AI suggest returns reasonable assignments
- [ ] AI chat answers questions about game state
- [ ] UI updates correctly after every action
- [ ] No crashes on edge cases (no fuel, no UE, all aircraft broken)
