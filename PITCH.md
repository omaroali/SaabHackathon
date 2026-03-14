# AirBase Ops — Pitch Document
## Saab Smart Air Base Hackathon

---

# PART 1: THE PITCH (Presentation Script)

---

## SLIDE 1: Opening Hook

**"In the next conflict, air superiority won't be decided in the sky — it will be won or lost on the ground."**

Sweden's dispersed air base doctrine (bas90-systemet) is one of the most brilliant military logistics concepts ever developed. But today, the commanders who run these bases train with paper cards, physical dice, and whiteboard schedules. We built the digital future of that training.

**AirBase Ops** is an AI-powered digital twin of Saab's logistics board game — a real-time simulation that trains base commanders to make better decisions, faster, under escalating pressure.

---

## SLIDE 2: The Users and Their Goal

### Who are the users?

- **Basbatchef (Base Commander)** — the decision-maker who must translate Air Tasking Orders into ground reality
- **Underhållsberedare (Maintenance Planner)** — allocates aircraft to tasks, plans repair schedules
- **Klargöringstropp (Preparation Crews)** — execute the hands-on work of fueling, arming, and launching aircraft

### What are they trying to achieve?

**Maximize sortie generation** — get as many mission-capable Gripen aircraft into the air as possible, on time, with the right weapons, while managing finite resources that degrade over a 30-day campaign escalating from peace to crisis to war.

### Why this matters to Saab:

Saab doesn't just sell Gripen aircraft — they sell **operational capability**. A customer nation's ability to sustain dispersed air base operations is the difference between a fleet that fights and a fleet that sits. This tool directly enhances the value proposition of every Gripen sale.

---

## SLIDE 3: The Problem — High-Impact Suboptimalities

### Today's training is analog, slow, and limited:

| Problem | Impact |
|---------|--------|
| **Physical board game** requires 8-15 people in the same room | Training happens rarely — maybe 2-3 times per year |
| **Manual dice rolls and paper tracking** | Games take 4-8 hours for a single day of simulated operations |
| **No data capture** | Decisions evaporate — no after-action analytics, no performance tracking |
| **No "what-if" capability** | Commanders can't explore alternative strategies mid-game |
| **No AI decision support** | New commanders learn only from experienced mentors (bottleneck) |
| **Single-player limitation** | The board game requires a full team; individuals can't practice |

### The unavoidable activities (oundvikliga aktiviteter):

No matter what tools you use, a base commander **must**:

1. **Interpret the ATO** — understand what missions need to fly and when
2. **Assess fleet status** — know which aircraft are ready, prepping, or broken
3. **Allocate resources** — assign fuel, weapons, spare parts, and crews
4. **Manage time** — sequence preparation activities to meet launch windows
5. **Adapt to chaos** — handle equipment failures, battle damage, and supply shortages
6. **Maintain awareness** — track 10+ aircraft, 7 resource types, and dozens of missions simultaneously

**Our solution optimizes every single one of these activities.**

---

## SLIDE 4: The Solution — AirBase Ops

### A web-based digital twin with AI-powered decision support

**Core Concept**: We digitized Saab's physical logistics board game into an interactive web application, then augmented it with AI capabilities that transform it from a training tool into a **decision support system**.

### Architecture:

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  React 19 + Tailwind CSS + Leaflet Maps + Recharts  │
│                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ ATO      │  │ Operations   │  │ Resources     │  │
│  │ Panel    │  │ Workspace    │  │ Panel         │  │
│  │          │  │ (Map/Fleet)  │  │               │  │
│  └──────────┘  └──────────────┘  └───────────────┘  │
│                                                     │
│  ┌────────────────────────────────────────────────┐  │
│  │     Decision Impact Panel (4 Real-Time KPIs)   │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                    FastAPI REST
                         │
┌─────────────────────────────────────────────────────┐
│                    BACKEND                           │
│  Python 3.11 + Pydantic v2 + FastAPI                │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Turn     │  │ Resource │  │ AI Advisor         │ │
│  │ Engine   │  │ Manager  │  │ (OpenRouter / LLM) │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Scenario │  │ Metrics  │  │ Simulator          │ │
│  │ System   │  │ Engine   │  │ (What-If Analysis) │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## SLIDE 5: Live Demo — The Breakthrough Features

### Feature 1: Real-Time Fleet Operations Board

The entire fleet of 10 Gripen E aircraft is visible at a glance. Each aircraft card shows:
- Current status (color-coded: green = ready, blue = flying, red = maintenance)
- Fuel level
- Service hours remaining
- Weapon loadout
- Assigned mission

**What used to take**: Physically moving plastic pieces and updating paper cards.
**What it takes now**: One look at the screen.

---

### Feature 2: Interactive Tactical Map

A Leaflet.js map centered on F 17 Kallinge shows:
- **Base location** with a breathing glow indicator
- **Mission zones** as color-coded circles (QRA red, DCA orange, RECCE yellow)
- **Aircraft positions** animated along flight tracks
- **Click-to-inspect** for mission details and aircraft status

This gives commanders **geospatial awareness** that the physical board game simply cannot provide.

---

### Feature 3: AI-Powered Mission Allocation

With one click ("AI Suggest Allocation"), our AI advisor analyzes:
- Current fleet readiness
- Upcoming mission requirements
- Resource levels
- Campaign phase

And returns **structured recommendation cards** with:
- Specific aircraft-to-mission assignments
- Reasoning (why this allocation)
- Expected effects on 4 KPIs
- Confidence score (0-100%)
- Assumptions and tradeoffs

**This is the core innovation**: An AI copilot that doesn't just suggest actions — it **explains its reasoning** and **quantifies the expected impact**.

---

### Feature 4: Compare Mode — Non-Destructive "What-If" Analysis

The Compare Mode runs a **6-hour forward simulation** without modifying the actual game state:

| Metric | Your Plan | AI-Optimized |
|--------|-----------|--------------|
| Missions Completed | 3 | 5 |
| Average Readiness | 62% | 78% |
| Fuel Burned | 4,200L | 3,800L |
| Risk Score | 45 | 28 |

Commanders can see the impact of their decisions **before committing**. This is transformative for training — it enables learning through comparison rather than costly trial-and-error.

---

### Feature 5: Decision Impact Panel — 4 Real-Time KPIs

A persistent strip across the top of the workspace tracks:

1. **Fleet Readiness %** — What fraction of the fleet can fly right now?
2. **Mission Throughput** — How many missions can we complete in the next 6 hours?
3. **Turnaround Delay** — Average minutes until non-ready aircraft become mission-capable
4. **Risk Exposure Score** — Composite index of fuel, UE, maintenance burden, and mission gaps

Each metric shows **delta indicators** (green arrows for improvements, red for degradation) so commanders see the immediate impact of every decision.

---

### Feature 6: AI Chat Advisor — Natural Language Decision Support

A conversational AI advisor that understands Swedish military logistics terminology:
- "Assess readiness" — Get an instant fleet status briefing
- "Fuel forecast" — Predict how long fuel reserves will last at current burn rate
- "Maintenance priorities" — Which aircraft should be fixed first?

The advisor understands the domain context: klargöring, underhåll, flygplan, ATO, and provides **actionable recommendations referencing specific aircraft and missions**.

---

### Feature 7: 30-Day Campaign with Dynamic Events

The game runs a realistic 30-day campaign:

| Days | Phase | Intensity |
|------|-------|-----------|
| 1-10 | **Peace** | Light patrol, QRA coverage |
| 11-20 | **Crisis** | Escalating DCA, reconnaissance missions |
| 21-30 | **War** | Maximum sortie generation, attack missions |

**Day 4 Event**: A cruise missile attack damages the runway (8h repair), hits 2 aircraft with battle damage, and resets all prepping aircraft to hangar. This forces commanders to **adapt under pressure** — the core skill the training is designed to build.

---

### Feature 8: Complete Resource Simulation

Every resource from the physical board game is faithfully modeled:

| Resource | Initial | Consumption Model |
|----------|---------|-------------------|
| Fuel | 180,000L | 200L/flight-hour + 50L takeoff |
| Missiles | 180 | 10-100% lost per mission (random) |
| Bombs | 120 | Mission-type dependent |
| Recon Pods | 10 | Required for RECCE missions |
| Spare Parts | 60 | Consumed by maintenance |
| Exchange Units | 16 | 30-day MRO repair cycle |
| Maintenance Crews | 6 (3 on duty) | 8-hour shift rotations |

Warning indicators alert when resources drop below critical thresholds.

---

### Feature 9: Deterministic Fallback — Works Without Internet

If the AI API is unavailable, a **local deterministic planner** takes over:
- Sorts aircraft by status and remaining service hours
- Allocates to missions by priority and schedule
- Generates recommendation cards with confidence scores

The game is fully playable offline — critical for a defense application where connectivity cannot be guaranteed.

---

## SLIDE 6: Why This Should Be Invested In

### The Business Case for Saab

**1. Training Scalability**
- Physical board game: 8-15 people, one room, one day = **one training session**
- AirBase Ops: Any browser, any time, any number of players = **unlimited training**

**2. Customer Value Amplifier**
- Every Gripen export customer needs base operations training
- This tool can be packaged with Gripen sales as a **training system differentiator**
- SaaS licensing model: per-base, per-year subscription

**3. Data-Driven After-Action Review**
- Every decision is logged with timestamps and state snapshots
- Commanders can replay scenarios and analyze decision quality
- Training officers can compare performance across cohorts

**4. AI Augmentation Pathway**
- Today: Training tool with AI suggestions
- Tomorrow: **Operational decision support** for real base commanders
- The same engine can process real-time fleet data instead of simulation data

**5. Edge Deployment Ready**
- Lightweight tech stack (Python + React)
- Works offline with deterministic fallback
- No specialized hardware required
- Deployable on tactical field networks

### SaaS Revenue Model

| Tier | Features | Price Point |
|------|----------|-------------|
| **Training** | Core simulation, scenario editor | Per-seat license |
| **Advanced** | AI advisor, compare mode, analytics | Per-base subscription |
| **Enterprise** | Custom scenarios, API integration, multi-base | Enterprise agreement |

### Competitive Advantage

No competitor offers this combination:
- Faithful digitization of a proven military training methodology
- AI-powered decision support with explainable recommendations
- Non-destructive simulation for consequence-free learning
- Edge-deployable, offline-capable architecture
- Domain-specific AI trained on Swedish dispersed air base operations

---

## SLIDE 7: Summary

**AirBase Ops transforms Saab's proven physical logistics training game into a scalable, AI-augmented digital platform.**

| Dimension | Physical Board Game | AirBase Ops |
|-----------|-------------------|-------------|
| **Players needed** | 8-15 | 1+ |
| **Session setup** | Hours | Seconds |
| **Speed** | 4-8h per game day | Real-time, adjustable |
| **Decision support** | Human mentors only | AI advisor + what-if simulation |
| **Data capture** | None | Complete decision audit trail |
| **Availability** | Scheduled events | 24/7, any browser |
| **Scalability** | 1 session at a time | Unlimited concurrent |

**We didn't just digitize a board game. We built the foundation for Saab's next-generation air base command support system.**

---

---

# PART 2: DETAILED APPLICATION DOCUMENTATION

---

## 1. Technical Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, Vite, Tailwind CSS v4 | Modern reactive UI with utility-first styling |
| Maps | Leaflet.js | Interactive geospatial visualization |
| Charts | Recharts / Victory | Data visualization for metrics |
| Backend | FastAPI, Python 3.11, Pydantic v2 | High-performance async API with strong typing |
| AI | OpenRouter API (GPT model) | LLM-powered decision support |
| State | In-memory (Python) + JSON save/load | Game state persistence |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/state` | Get current game state |
| POST | `/api/start-game` | Initialize new 30-day campaign |
| POST | `/api/advance-turn` | Advance time by 1 hour |
| POST | `/api/advance-multiple` | Advance multiple turns |
| POST | `/api/assign` | Assign aircraft to a mission |
| POST | `/api/unassign` | Remove aircraft from a mission |
| POST | `/api/prep-aircraft` | Begin pre-flight preparation |
| POST | `/api/arm-aircraft` | Arm aircraft with weapons |
| POST | `/api/ai/suggest` | Get AI mission allocation suggestions |
| POST | `/api/ai/recommend` | Get structured AI recommendation cards |
| POST | `/api/ai/chat` | Free-form AI Q&A |
| POST | `/api/compare` | Run baseline vs AI-optimized simulation |
| POST | `/api/save` | Save game state to disk |
| POST | `/api/load` | Load game state from disk |

---

## 2. Game Engine — Faithful Board Game Digitization

### Aircraft Lifecycle State Machine

```
HANGAR ──(prep order)──> PRE_FLIGHT (4h)
    │                        │
    │                   ┌────┴────┐
    │                   │ Fault?  │──(1/3 chance)──> MAINTENANCE
    │                   │ (dice)  │
    │                   └────┬────┘
    │                        │ (OK)
    │                        v
    │               MISSION_CAPABLE
    │                        │
    │                   (assign to mission)
    │                        │
    │                        v
    │                   ON_MISSION
    │                        │
    │                   (mission complete)
    │                        v
    │                   POST_FLIGHT (6h)
    │                        │
    │                   ┌────┴────┐
    │                   │ Damage? │──(50% chance)──> MAINTENANCE
    │                   │ (dice)  │
    │                   └────┬────┘
    │                        │ (OK)
    └────────────────────────┘
```

### Maintenance System

Directly modeled from Saab's board game outcome tables:

| Dice Roll | Pre-Flight Fault | Repair Time | Type |
|-----------|-----------------|-------------|------|
| 1 | OK | — | — |
| 2 | OK | — | — |
| 3 | OK | — | — |
| 4 | OK | — | — |
| 5 | Fault | 2h | Quick LRU Replacement |
| 6 | Fault | 2-16h | Variable (by table) |

Post-flight outcomes, weapon loss percentages (10%-100%), and UE consumption all follow the original game's probability tables.

### Exchange Unit (UE) Cycle

```
Base Stock ──(used in repair)──> Installed in Aircraft
     ^                                    │
     │                            (broken UE removed)
     │                                    │
     │                                    v
Central Depot <──(30 days)── MRO Repair <──(5 days transit)
```

Limited UE stock creates critical decision pressure: repair now (consuming UE) or cannibalize from another aircraft?

### Campaign Scenario

- **30 days** of escalating operations
- **10 Gripen E** aircraft with varying service hour profiles
- **Base**: F 17 Kallinge, Sweden
- **Mission types**: QRA, DCA, RECCE, ATTACK, ESCORT, AEW
- **Geographic scope**: Baltic Sea area (Gotland, Öland, Swedish coast)
- **Dynamic events**: Cruise missile attack on Day 4

---

## 3. AI System — Three Layers of Intelligence

### Layer 1: Structured Recommendations (ai_recommend)

Returns parsed JSON cards:
```json
{
  "action": "Assign GE-01 and GE-03 to DCA-1",
  "reasoning": [
    "GE-01 has highest fuel at 92%",
    "GE-03 just completed pre-flight",
    "DCA-1 launches in 2 hours — tight window"
  ],
  "effects": {
    "fleet_readiness": "+12%",
    "mission_throughput": "+2",
    "turnaround_delay": "-15 min",
    "risk_score": "-8"
  },
  "confidence": 85,
  "assumptions": "No additional faults during prep",
  "tradeoff": "Leaves only 2 aircraft as reserve for QRA"
}
```

### Layer 2: Mission Allocation Suggestions (ai_suggest)

Analyzes the full game state and returns specific aircraft-to-mission mappings, considering:
- Aircraft readiness status
- Fuel levels and weapon loadouts
- Mission priority and timing
- Crew availability
- Resource constraints

### Layer 3: Conversational Advisor (ai_chat)

Natural language Q&A with full operational context. The AI understands:
- Swedish military logistics terminology
- Aircraft state transitions and timing
- Resource consumption rates and forecasts
- Campaign phase implications

### Fallback: Deterministic Planner

When AI API is unavailable, a local heuristic provides:
- Priority-based aircraft sorting
- Greedy mission allocation
- Confidence-scored recommendations
- Complete offline playability

---

## 4. Frontend — Designed for Decision Speed

### Three-Column Layout

| Left Panel | Center Workspace | Right Panel |
|------------|-----------------|-------------|
| ATO (missions) | Tactical Map / Fleet Board | Resources |
| Mission status | Aircraft positions & routes | Fuel, weapons |
| Assign/unassign | Interactive visualization | Spare parts, UE |
| AI suggestions | Click-to-inspect | Crew shifts |

### Decision Impact Panel (Always Visible)

Four KPIs with real-time delta tracking:

1. **Fleet Readiness** — (MISSION_CAPABLE + ON_MISSION) / total fleet
2. **Mission Throughput** — missions completable in next 6 hours
3. **Turnaround Delay** — average minutes until non-ready aircraft are mission-capable
4. **Risk Score** — composite of fuel risk + UE risk + maintenance burden + mission gaps

### Visual Design

- **Dark theme** with military-inspired color palette
- **Glass-morphism** panels for modern look
- **Color-coded status indicators** throughout
- **Animated transitions** for state changes
- **Responsive layout** adapting to screen sizes
- **Keyboard shortcuts** (? for help, Escape to close)

---

## 5. Alignment with Judging Criteria

The judges evaluate: *"If you were responsible for company X, how interested would you be in investing in completing this project or buying it as a SaaS solution?"*

### Why the answer should be "Extremely Interested":

**1. Direct Problem-Solution Fit**
- The hackathon challenge: "Build a prototype of a smart road base system for increased efficiency and flexibility"
- Our solution: A complete digital twin of the existing training game, enhanced with AI, available anywhere

**2. Addresses the Key Questions from the Hackathon Guide**

| Question | Our Answer |
|----------|-----------|
| **User goals** | Base commanders training for dispersed operations |
| **Impact** | Scalable training = more capable air forces = stronger Gripen value proposition |
| **Unavoidable activities** | ATO interpretation, fleet management, resource allocation, time management, chaos adaptation, situational awareness |
| **High-impact suboptimalities** | Manual tracking, no what-if analysis, no data capture, limited training frequency |
| **Breakthrough solutions** | AI decision support, non-destructive simulation, digital twin with real-time KPIs |
| **Functionality demo** | Live walkthrough of mission allocation, AI recommendations, compare mode |

**3. Production-Ready Architecture**
- Clean separation of concerns (frontend/backend/AI)
- Typed data models (Pydantic v2)
- RESTful API design
- Offline-capable with deterministic fallback
- Standard deployment (any cloud, any browser)

**4. Clear Path to Revenue**
- Training license for defense customers
- Integration with Saab's support & training offerings
- Custom scenario development as consulting service
- Analytics and after-action review as premium features

**5. Expandability**
- Multi-base operations (network of dispersed bases)
- Multiplayer (AOC + Base Commander + Maintenance roles)
- Real data integration (actual fleet telemetry)
- Mobile-responsive for field use on tablets
- VR/AR integration for immersive training

---

## 6. Demo Script (5-minute walkthrough)

### Minute 0-1: Context & Hook
- Show the physical board game photo (from Saab's PDF)
- "This is how Swedish base commanders train today"
- "We built this" — reveal the app

### Minute 1-2: Start a Game
- Click "New Game" — show the fleet initializing
- Point out the 3-column layout
- Show the ATO panel with Day 1 missions

### Minute 2-3: Core Gameplay Loop
- Prep an aircraft for flight
- Assign it to a QRA mission
- Advance time — show the aircraft moving through states
- Point out the Decision Impact Panel updating in real-time

### Minute 3-4: AI Features
- Click "AI Suggest Allocation" — show recommendation cards
- Highlight: reasoning, confidence, tradeoffs
- Open Compare Mode — show baseline vs AI side-by-side
- Ask the AI chat: "What's our fuel forecast?"

### Minute 4-5: The Big Picture
- Switch to Tactical Map — show aircraft positions and mission zones
- Advance to Day 4 — trigger the cruise missile attack
- Show how the event impacts KPIs
- Close with: "From paper cards to AI-powered command support. This is AirBase Ops."

---

## 7. Key Differentiators (Why We Win)

1. **Faithful to the source material** — We didn't invent a new game; we digitized Saab's proven training methodology, keeping the dice mechanics, maintenance tables, and resource models intact.

2. **AI that explains itself** — Our recommendation cards don't just say "do this." They show reasoning, quantify expected effects, rate confidence, and disclose tradeoffs. This builds trust and teaches decision-making.

3. **Non-destructive simulation** — Compare Mode lets commanders explore consequences without commitment. This is a training accelerator — learn from comparison, not from failure.

4. **Edge-ready architecture** — Python + React with offline fallback means this can run on a field laptop without internet. Defense requirements demand this.

5. **Complete feature coverage** — We didn't build a partial prototype. The full game loop is implemented: 30-day campaign, 10 aircraft, 7 resource types, 6 mission types, maintenance with dice-based outcomes, crew shifts, and dynamic events.

6. **Geospatial intelligence** — The tactical map adds a dimension the board game cannot: seeing where aircraft are, where missions are happening, and how geography affects operations.

7. **Real-time KPI feedback** — The Decision Impact Panel means every action has immediately visible consequences, creating a tight decision-feedback loop that accelerates learning.

---

*Built for the Saab Smart Air Base Hackathon, March 2026.*
*Hack Day: 14 March, Tekniska Museet, Stockholm.*
*Grand Finale: 26 March, Flygvapenmuseet, Linkoping.*
