# Changelog — AirBase Ops Hackathon Improvements

All changes are additive — no existing functionality was broken.

## v2.0 — Hackathon Demo Release

### 1. Decision Impact Panel (KPI Strip)
- **New** `backend/game/metrics.py` — 4 deterministic KPIs with commented formulas
  - Fleet Readiness %, Mission Throughput, Turnaround Delay, Risk Exposure (0–100)
- **New** `frontend/src/components/DecisionImpactPanel.jsx` — persistent KPI strip below TopBar
  - Green ▲ / Red ▼ delta chips after every action
  - Hover tooltips explaining each formula
- **Why it matters**: Judges see *quantified consequences* of every decision — proves the prototype isn't just pretty, it's analytically useful.

### 2. Baseline vs Optimized Compare Mode
- **New** `backend/game/simulator.py` — 6h forward simulation on cloned state (deterministic, non-destructive)
- **New** `POST /api/compare` endpoint — runs baseline + AI-optimized side-by-side
- **New** `frontend/src/components/CompareMode.jsx` — full-screen comparison overlay
- **Why it matters**: One-click "show me the AI value" — the killer demo slide for investors.

### 3. Explainable AI Recommendation Cards
- **Modified** `backend/ai/advisor.py` — structured JSON output with action/why/effect/confidence/assumptions/tradeoffs
  - Robust parser with 3 fallback strategies for unstructured AI output
- **New** `POST /api/ai/recommend` endpoint
- **New** `frontend/src/components/AIRecommendationCards.jsx` — expandable cards with confidence bars
- **Why it matters**: Judges trust AI they can understand. Confidence scores + tradeoffs = professional-grade UX.

### 4. UX Hardening
- **Modified** `frontend/src/api.js` — AbortController timeout (8s/20s), 1-retry with backoff, descriptive errors
- **Modified** `frontend/src/hooks/useGameState.js` — `finally { setLoading(false) }` on all calls, auto-clear errors (5s)
- **New** Error banner in App.jsx with auto-dismiss
- **Why it matters**: Demo never hangs. Loading always resolves. Error states are clear.

### 5. Security Hardening
- **Modified** `backend/main.py` — startup warning if API key missing, logging
- **Verified** `.gitignore` excludes `.env` files
- Environment-only secrets — no hardcoded keys in source
- **Why it matters**: Professional-grade security posture for the judges.

### 6. API Layer (OpenRouter)
- **Modified** `backend/ai/advisor.py` — switched from DeepSeek direct to OpenRouter API
- **Why it matters**: OpenRouter gives model flexibility + reliability.
