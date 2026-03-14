# Demo Script — AirBase Ops

## 90-Second Version (Pitch Demo)

**Setup:** App running, game already started, fleet visible.

### 0:00–0:15 — Hook
> "This is AirBase Ops — we digitized Saab's physical board game for dispersed air base logistics. 10 Gripen E jets, 7 days of escalation, real-time decision support."

*Point to the TopBar: Day, Phase, Time. Point to KPI strip.*

### 0:15–0:35 — Core Loop
> "Every hour, the commander receives missions and assigns aircraft."

1. Click a mission in the ATO panel
2. Assign two aircraft manually
3. **Show the KPI strip updating** — fleet readiness drops, risk rises
> "Every decision has measurable impact — readiness, throughput, delay, and risk."

### 0:35–0:55 — AI Value
> "But what if AI helped?"

1. Click **"AI"** → wait for recommendation cards
2. Show structured cards: action, reasoning, confidence, tradeoffs
3. Click **"Apply All"**
4. **KPI strip turns green** — fleet readiness improves

### 0:55–1:15 — Compare Mode
> "One click to prove AI makes better decisions:"

1. Click **"Compare"** in TopBar
2. Side-by-side overlay loads: Baseline vs AI-Optimized
3. Point to green deltas: more missions, lower risk
> "Non-destructive simulation — we ran 6 hours forward on a cloned state."

### 1:15–1:30 — Close
> "Production-ready decision support for Swedish air base operations. Thank you."

---

## 3-Minute Version (Deep Dive)

**All of the 90s version, plus:**

### 1:30–2:00 — Full Turn Cycle
1. Advance time 1 hour (click 1H)
2. Watch turn results: aircraft launch, maintenance dice rolls
3. Show event log updating in real-time
4. Point to KPI deltas tracking impact

### 2:00–2:30 — Resource Management
1. Show Resource Panel: fuel, missiles, exchange units
2. Point out fuel burn rate visible in KPI
3. Open AI Chat → ask "Will fuel last through Day 5?"
4. Show AI analyzing the full game state contextually

### 2:30–2:45 — Escalation
1. Advance to Crisis phase (4H button)
2. Show phase badge changing, mission count increasing
3. KPI risk score rising — AI recommends rebalancing

### 2:45–3:00 — Technical Depth
> "Under the hood:"
- Backend: FastAPI, Pydantic models, deterministic simulation engine
- AI: OpenRouter API with structured JSON output, 3-level fallback parser
- Frontend: React 19, hardened API layer with timeouts and retry
- Security: env-only secrets, startup validation, no key leaks
