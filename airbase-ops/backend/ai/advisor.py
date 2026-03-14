"""
AI Advisor for AirBase Ops — OpenRouter API integration.

Provides three capabilities:
1. ai_suggest() — mission allocation suggestions with structured recommendations
2. ai_chat()    — free-form Q&A about operational situation
3. ai_recommend() — structured recommendation cards for the frontend
"""
import os
import json
import re
import httpx

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-5.4-pro"

SYSTEM_PROMPT = """You are AirBase AI, an expert Swedish military logistics advisor for dispersed air base operations (flygbasoperationer). You help base commanders (basbatchefer) optimize aircraft allocation, maintenance scheduling, and resource management for Gripen fighter jets.

You always give specific, actionable advice referencing aircraft by their IDs (e.g., **GE-01**). You understand the following domain:

AIRCRAFT STATES:
- **HANGAR**: Not prepared. Needs 4 hours of pre-flight prep (**klargöring**) before becoming mission capable.
- **PRE_FLIGHT**: Being prepared. 1/3 chance of fault discovery.
- **MISSION_CAPABLE**: Ready to fly. Can be assigned to missions.
- **ON_MISSION**: Currently flying. Duration depends on mission type.
- **POST_FLIGHT**: Just landed. Turnaround and inspection before re-generation.
- **MAINTENANCE**: Under repair. Duration varies by fault type (**48h to 360h**).

RESOURCE CONSTRAINTS:
- **Fuel**: 1000L tank. Each flight hour uses ~200L.
- **Weapons**: Missiles and bombs from base inventory.
- **Exchange Units (UE)**: Critical spare components. 30-day MRO repair cycle.
- **Personnel**: Crews work 8-hour shifts.

SCENARIO:
- 30-day campaign: Days 1-10 Peace, Days 11-20 Crisis, Days 21-30 War.
- Realism: Planning requires 24h lead time. Approved flight plans are mandatory.

OUTPUT FORMATTING:
- Use **Markdown** for all responses.
- Use **bold text** for aircraft IDs, mission IDs, and critical status changes.
- Use **bullet points** for lists of actions.
- Keep responses professional, authoritative, and concise.
- Use Swedish terms naturally (klargöring, underhåll, flygplan, etc.) but write in English.

RULES FOR GOOD ADVICE:
- Never send all best aircraft at once — keep reserves.
- Prioritize aircraft with most flight hours before service.
- Balance maintenance to avoid fleet-wide downtime.
- Watch resource burn rates — will fuel/UE last through the scenario?
- Consider the 24h planning requirement — what needs to be approved NOW for tomorrow?
"""


# ──────────────────────────────────────────────
# Structured recommendation prompt
# ──────────────────────────────────────────────

RECOMMEND_PROMPT = """You are AirBase AI. Analyze the game state and provide structured recommendations.

RESPOND ONLY WITH VALID JSON matching this schema exactly:
{
  "recommendations": [
    {
      "action": "Short action title (e.g., 'Assign GE-01 and GE-03 to DCA-1')",
      "why": ["reason 1", "reason 2"],
      "expected_effect": {"fleet_readiness": "+5%", "risk_score": "-10"},
      "confidence": 85,
      "assumptions": ["All aircraft pass pre-flight checks"],
      "tradeoff": "Reduces reserve pool to 2 aircraft"
    }
  ],
  "assignments": [
    {"mission_id": "...", "aircraft_ids": ["...", "..."]}
  ]
}

Rules:
- Provide 2-5 recommendations
- confidence is 0-100
- expected_effect keys: fleet_readiness, mission_throughput, turnaround_delay, risk_score
- Each "why" should be 1 sentence
- Be specific about aircraft IDs and mission IDs from the state
"""


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

    # Try to extract assignments JSON from response
    assignments = []
    try:
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group(1))
            assignments = parsed.get("assignments", [])
    except (json.JSONDecodeError, AttributeError):
        pass

    if _is_ai_unavailable(response) or not assignments:
        fallback = _fallback_plan(game_state_dict)
        return {
            "suggestion": fallback["suggestion"],
            "assignments": fallback["assignments"],
            "source": "fallback",
        }

    return {"suggestion": response, "assignments": assignments}


async def ai_recommend(game_state_dict: dict) -> dict:
    """
    Get structured AI recommendations with explainable cards.
    Returns parsed recommendations + assignments, with graceful fallback.
    """
    state_summary = json.dumps(game_state_dict, indent=2, default=str)

    user_msg = f"""Current game state:
{state_summary}

Analyze and provide your structured recommendations as JSON."""

    response = await _call_openrouter(RECOMMEND_PROMPT, user_msg)

    # --- Parse structured JSON ---
    parsed = _parse_recommendations(response)
    if _is_ai_unavailable(response) or not parsed.get("recommendations"):
        fallback = _fallback_plan(game_state_dict)
        return {
            "recommendations": fallback["recommendations"],
            "assignments": fallback["assignments"],
            "source": "fallback",
        }
    return parsed


def _parse_recommendations(response: str) -> dict:
    """
    Parse AI response into structured recommendation cards.
    Graceful fallback: if parsing fails, wrap raw text as a single card.
    """
    # Try direct JSON parse first
    try:
        parsed = json.loads(response)
        if "recommendations" in parsed:
            return _validate_recommendations(parsed)
    except (json.JSONDecodeError, TypeError):
        pass

    # Try extracting JSON from markdown code block
    try:
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group(1))
            if "recommendations" in parsed:
                return _validate_recommendations(parsed)
    except (json.JSONDecodeError, AttributeError):
        pass

    # Try finding raw JSON object in response
    try:
        brace_start = response.index('{')
        brace_depth = 0
        end_idx = brace_start
        for i, ch in enumerate(response[brace_start:], brace_start):
            if ch == '{':
                brace_depth += 1
            elif ch == '}':
                brace_depth -= 1
                if brace_depth == 0:
                    end_idx = i + 1
                    break
        parsed = json.loads(response[brace_start:end_idx])
        if "recommendations" in parsed:
            return _validate_recommendations(parsed)
    except (ValueError, json.JSONDecodeError):
        pass

    # --- Fallback: wrap raw text as single recommendation card ---
    return {
        "recommendations": [
            {
                "action": "AI Analysis",
                "why": [response[:200] + ("..." if len(response) > 200 else "")],
                "expected_effect": {},
                "confidence": 50,
                "assumptions": ["Parsed from unstructured AI response"],
                "tradeoff": "Recommendation quality may vary — review manually",
            }
        ],
        "assignments": [],
        "raw_response": response,
    }


def _validate_recommendations(parsed: dict) -> dict:
    """Ensure all recommendation fields have valid defaults."""
    recs = parsed.get("recommendations", [])
    validated = []
    for rec in recs:
        validated.append({
            "action": rec.get("action", "Recommendation"),
            "why": rec.get("why", []),
            "expected_effect": rec.get("expected_effect", {}),
            "confidence": max(0, min(100, rec.get("confidence", 50))),
            "assumptions": rec.get("assumptions", []),
            "tradeoff": rec.get("tradeoff", "No tradeoffs identified"),
        })
    return {
        "recommendations": validated,
        "assignments": parsed.get("assignments", []),
    }


def _is_ai_unavailable(response: str) -> bool:
    """Detect local offline/error responses from the AI transport layer."""
    normalized = (response or "").strip().lower()
    return normalized.startswith("ai advisor is offline") or normalized.startswith("ai advisor error:")


def _fallback_plan(game_state_dict: dict) -> dict:
    """
    Build a deterministic local plan when the LLM is unavailable or malformed.
    Keeps the demo usable without external AI access.
    """
    current_hour = game_state_dict.get("current_hour", 0)
    current_ato = game_state_dict.get("current_ato") or {}
    missions = current_ato.get("missions") or []
    aircraft = game_state_dict.get("aircraft") or []

    assignable_statuses = {"MISSION_CAPABLE", "PRE_FLIGHT", "HANGAR"}
    usable_aircraft = [
        ac for ac in aircraft
        if ac.get("status") in assignable_statuses
    ]
    usable_aircraft.sort(key=lambda ac: (
        _aircraft_status_rank(ac.get("status")),
        ac.get("hours_until_service", 9999),
        ac.get("id", ""),
    ))

    planned_ids = set()
    assignments = []
    recommendations = []

    candidate_missions = [
        mission for mission in missions
        if mission.get("status") in ("PENDING", "AIRCRAFT_ASSIGNED")
    ]
    candidate_missions.sort(key=lambda mission: (
        mission.get("priority", 99),
        abs(mission.get("scheduled_hour", current_hour) - current_hour),
        mission.get("scheduled_hour", 99),
        mission.get("id", ""),
    ))

    for mission in candidate_missions:
        mission_id = mission.get("id", "")
        mission_type = mission.get("type", "MISSION")
        required = mission.get("required_aircraft", 0)
        already_assigned = mission.get("assigned_aircraft_ids", [])
        remaining = max(0, required - len(already_assigned))
        if remaining <= 0:
            continue

        selected = []
        for ac in usable_aircraft:
            ac_id = ac.get("id", "")
            if ac_id in planned_ids:
                continue
            selected.append(ac_id)
            planned_ids.add(ac_id)
            if len(selected) >= remaining:
                break

        if not selected:
            continue

        assignments.append({"mission_id": mission_id, "aircraft_ids": selected})

        delta_readiness = min(5 * len(selected), 15)
        risk_reduction = min(4 * len(selected), 12)
        recommendations.append({
            "action": f"Assign {' and '.join(selected)} to {mission_id}",
            "why": [
                f"{mission_type} is one of the highest-priority missions still awaiting coverage.",
                f"These aircraft are the fastest available candidates to support the sortie window at hour {mission.get('scheduled_hour', current_hour)}.",
            ],
            "expected_effect": {
                "fleet_readiness": f"+{delta_readiness}%",
                "mission_throughput": f"+1",
                "risk_score": f"-{risk_reduction}",
            },
            "confidence": 72 if len(selected) < remaining else 81,
            "assumptions": [
                "Selected aircraft complete klargoring without faults",
                "Current fuel and weapon stocks remain sufficient for the next 24 hours",
            ],
            "tradeoff": "Commits near-term reserve aircraft and reduces flexibility for follow-on tasks.",
        })

        if len(recommendations) >= 3:
            break

    if not recommendations:
        recommendations.append({
            "action": "Hold current allocation and preserve reserve aircraft",
            "why": [
                "No clear pending mission shortfall was found in the current ATO.",
                "Keeping aircraft uncommitted preserves surge capacity for faults or schedule drift.",
            ],
            "expected_effect": {
                "risk_score": "-2",
            },
            "confidence": 68,
            "assumptions": [
                "Current assignments already cover the most urgent mission windows",
            ],
            "tradeoff": "Mission throughput may stay flat until the next decision point.",
        })

    suggestion = "Fallback planner used local heuristic allocation because external AI was unavailable."
    return {
        "suggestion": suggestion,
        "assignments": assignments,
        "recommendations": recommendations,
    }


def _aircraft_status_rank(status: str | None) -> int:
    ranks = {
        "MISSION_CAPABLE": 0,
        "PRE_FLIGHT": 1,
        "HANGAR": 2,
        "POST_FLIGHT": 3,
        "MAINTENANCE": 4,
        "ON_MISSION": 5,
    }
    return ranks.get(status or "", 99)


async def ai_chat(game_state_dict: dict, user_message: str) -> str:
    """Free-form chat about the operational situation."""
    state_summary = json.dumps(game_state_dict, indent=2, default=str)

    user_msg = f"""Current game state:
{state_summary}

Commander's question: {user_message}

### INSTRUCTIONS:
1. Provide a direct, expert answer to the question.
2. Use **bolding** for IDs and key terms.
3. List 2-4 concrete, actionable **RECOMMENDED ACTIONS** using a bulleted list.
4. If referring to missions, check if they are **PLANNED** (is_planned: true). If not, remind the commander to **APPROVE PLAN**.
5. Keep it under 200 words.
"""

    response = await _call_openrouter(SYSTEM_PROMPT, user_msg)
    return response


async def _call_openrouter(system_prompt: str, user_message: str) -> str:
    """Make API call to OpenRouter."""
    if not OPENROUTER_API_KEY:
        return (
            "AI Advisor is offline — no OPENROUTER_API_KEY configured. "
            "Set the environment variable to enable AI features."
        )

    try:
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
                    "max_tokens": 1500,
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            choices = data.get("choices") or []
            if not choices:
                return "AI Advisor error: OpenRouter returned no choices"
            return choices[0]["message"]["content"]
    except Exception as e:
        return f"AI Advisor error: {str(e)}"
