# AirBase Ops

A web-based military air base operations simulation built for the Saab Hackathon. You play as a Swedish base commander (basbatchef) managing 10 Gripen E fighter jets through a 7-day escalating scenario — from peacetime patrols to full-scale war operations.

The game digitizes the physical board game Saab uses to train logistics staff for dispersed air base operations (flygbasoperationer).

---

## What It Does

- Manage a fleet of 10 Gripen E aircraft across 6 operational states
- Assign aircraft to daily Air Tasking Orders (ATO) across QRA, DCA, RECCE, and ATTACK mission types
- Track and balance resources: fuel, missiles, bombs, pods, spare parts, exchange units, and maintenance crews
- Advance time turn-by-turn (1 hour per turn) watching aircraft move through pre-flight, missions, and maintenance
- Get AI-powered tactical advice from an embedded DeepSeek-backed advisor
- Save and load game state between sessions

---

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts |
| Backend  | FastAPI, Python 3.11, Pydantic v2       |
| AI       | DeepSeek API (`deepseek-chat`)          |

---

## Project Structure

```
airbase-ops/
├── backend/
│   ├── ai/            # DeepSeek AI advisor
│   ├── api/           # FastAPI route handlers
│   ├── game/          # Turn engine, dice, maintenance, resource logic
│   ├── models/        # Pydantic data models (aircraft, missions, resources)
│   ├── scenarios/     # 7-day default scenario & ATO definitions
│   ├── main.py        # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/ # All UI components
    │   ├── hooks/      # useGameState hook
    │   └── api.js      # Backend API calls
    └── package.json
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [DeepSeek API key](https://platform.deepseek.com/)

---

### 1. Backend

```bash
cd airbase-ops/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your DeepSeek API key

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs: `http://localhost:8000/docs`

---

### 2. Frontend

```bash
cd airbase-ops/frontend

npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Create `airbase-ops/backend/.env` from the example:

```bash
cp airbase-ops/backend/.env.example airbase-ops/backend/.env
```

| Variable          | Description                        | Required |
|-------------------|------------------------------------|----------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key             | Yes      |

Without the API key, the AI advisor will show an offline message but the rest of the game works normally.

---

## Gameplay

### Aircraft States

| State             | Description                                          |
|-------------------|------------------------------------------------------|
| `HANGAR`          | Not prepared. Needs 1h klargöring before flying.     |
| `PRE_FLIGHT`      | Being prepared. 1-in-3 chance of fault discovery.    |
| `MISSION_CAPABLE` | Ready to fly. Can be assigned to missions.           |
| `ON_MISSION`      | Currently flying.                                    |
| `POST_FLIGHT`     | Just landed. 50% chance of needing maintenance.      |
| `MAINTENANCE`     | Under repair. Duration 2–16h depending on fault type.|

### Mission Types

| Type     | Description                              |
|----------|------------------------------------------|
| `QRA`    | Quick Reaction Alert — intercept duty    |
| `DCA`    | Defensive Counter Air — air defence      |
| `RECCE`  | Reconnaissance — requires sensor pods    |
| `ATTACK` | Ground attack — requires bombs           |

### Scenario Phases

| Days  | Phase  | Tempo                                    |
|-------|--------|------------------------------------------|
| 1     | Peace  | Light patrol, 3 missions                 |
| 2–4   | Crisis | Escalating DCA and recon, 5–7 missions   |
| 5–7   | War    | Maximum sortie generation, 8–9 missions  |

### Starting Resources

| Resource         | Amount |
|------------------|--------|
| Fuel storage     | 50,000 L |
| Missiles         | 40     |
| Bombs            | 30     |
| Sensor pods      | 6      |
| Spare parts      | 20     |
| Exchange units   | 8      |
| Maintenance crews| 6 (3 on duty) |

---

## API Endpoints

| Method | Path                  | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/api/state`          | Get current game state             |
| POST   | `/api/start-game`     | Start a new game                   |
| POST   | `/api/advance-turn`   | Advance time by 1 hour             |
| POST   | `/api/advance-multiple` | Advance multiple turns           |
| POST   | `/api/assign`         | Assign aircraft to a mission       |
| POST   | `/api/unassign`       | Remove aircraft from a mission     |
| POST   | `/api/prep-aircraft`  | Begin pre-flight prep on an aircraft|
| POST   | `/api/arm-aircraft`   | Arm an aircraft with weapons       |
| POST   | `/api/ai/suggest`     | Get AI mission allocation advice   |
| POST   | `/api/ai/chat`        | Chat with the AI advisor           |
| POST   | `/api/save`           | Save game to disk                  |
| POST   | `/api/load`           | Load game from disk                |

---

## Development

```bash
# Backend — run with auto-reload
uvicorn main:app --reload --port 8000

# Frontend — dev server with HMR
npm run dev

# Frontend — lint
npm run lint

# Frontend — production build
npm run build
```
