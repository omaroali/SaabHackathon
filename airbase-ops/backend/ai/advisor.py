import os
import json
import httpx

DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY")
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-chat"

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

    response = await _call_deepseek(SYSTEM_PROMPT, user_msg)

    # Try to extract assignments JSON from response
    assignments = []
    try:
        import re
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group(1))
            assignments = parsed.get("assignments", [])
    except (json.JSONDecodeError, AttributeError):
        pass

    return {"suggestion": response, "assignments": assignments}


async def ai_chat(game_state_dict: dict, user_message: str) -> str:
    """Free-form chat about the operational situation."""
    state_summary = json.dumps(game_state_dict, indent=2, default=str)

    user_msg = f"""Current game state:
{state_summary}

Commander's question: {user_message}

Provide a concise, actionable answer."""

    response = await _call_deepseek(SYSTEM_PROMPT, user_msg)
    return response


async def _call_deepseek(system_prompt: str, user_message: str) -> str:
    """Make API call to DeepSeek."""
    if not DEEPSEEK_API_KEY:
        return (
            "AI Advisor is offline — no DEEPSEEK_API_KEY configured. "
            "Set the environment variable to enable AI features."
        )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                DEEPSEEK_URL,
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
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
    except Exception as e:
        return f"AI Advisor error: {str(e)}"

