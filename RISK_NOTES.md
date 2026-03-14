# Risk Notes — Known Issues & Technical Debt

## Known Issues

### AI Response Latency
- OpenRouter + DeepSeek can take 5-15s for responses
- **Mitigation**: 20s timeout, loading spinners, fallback formatter for malformed output
- **Risk**: Demo may feel slow if AI is under load. Pre-warm with a test request before demo.

### Simulation Determinism
- Forward simulation seeds `random` to get repeatable results
- However, real game uses stochastic dice — simulation is an *expected* outcome, not guaranteed
- **Risk**: Compare Mode shows projected outcomes that may differ from actual gameplay

### State Management
- Game state is in-memory (single global variable)
- No persistent database — save/load writes JSON to disk
- **Risk**: Server restart loses game. Mitigated by save/load functionality.

### Peer Dependency Warning
- `@tailwindcss/vite@4.2.1` has a peer dep conflict with `vite@8.0.0`
- Install with `npm install --legacy-peer-deps`
- **Risk**: None functional — Tailwind v4 works correctly with Vite 8

## Technical Debt

### No Automated Tests
- Unit tests not yet implemented for metrics formulas or simulation engine
- Frontend has no component tests
- **Recommended**: Add pytest for metrics.py/simulator.py, Vitest for components

### Single-Player Only
- No authentication, no multi-user support
- Global in-memory state means only one game at a time
- **Future**: WebSocket state sync, user sessions, game rooms

### AI Prompt Engineering
- Structured recommendation quality depends on model compliance
- 3-level JSON parser handles most failure modes, but edge cases exist
- **Future**: Fine-tune prompt, add JSON schema validation, retry on parse failure

### CORS Configuration
- Currently `allow_origins=["*"]` — appropriate for hackathon but not production
- **Future**: Restrict to deployed frontend domain

### No Rate Limiting
- AI endpoints have no rate limiting — could hit API quotas
- **Future**: Add token bucket or rate limiter middleware
