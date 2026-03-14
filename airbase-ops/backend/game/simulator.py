"""
Non-destructive forward simulation for AirBase Ops.

Clones the game state and runs the turn engine forward N turns,
then collects aggregate outcome metrics for comparison.
Used by Compare Mode (baseline vs optimized).
"""
import random
from models.game_state import GameState
from models.aircraft import AircraftStatus
from models.mission import MissionStatus
from game.turn_engine import TIME_STEP_HOURS, execute_turn
from game.metrics import compute_metrics
from scenarios.default_scenario import CAMPAIGN_DAYS, get_ato_for_day

DAY_TURNS = int(24 / TIME_STEP_HOURS)


def simulate_forward(state: GameState, turns: int = DAY_TURNS, seed: int = 42) -> dict:
    """
    Run the turn engine forward on a CLONED state for `turns` hourly turns.

    Uses a fixed random seed so results are deterministic and reproducible
    within the same game state — important for honest baseline vs optimized comparison.

    Args:
        state: Current game state (NOT mutated)
        turns: Number of hourly turns to simulate forward
        seed:  Random seed for deterministic dice rolls

    Returns dict with:
        missions_completed: int
        missions_failed: int
        avg_readiness: float (average fleet readiness % across all simulated turns)
        fuel_burned: float (liters consumed)
        missiles_used: int
        ue_used: int (exchange units consumed)
        final_risk: int (risk score at end of simulation)
    """
    # Deep clone via Pydantic — safe and complete
    clone = state.model_copy(deep=True)

    # Snapshot initial resource values for delta calculation
    initial_fuel = clone.resources.fuel_storage
    initial_missiles = clone.resources.missiles
    initial_ue = clone.resources.exchange_units

    # Track per-turn readiness for averaging
    readiness_samples = []

    # Seed random for deterministic simulation
    rng_state = random.getstate()
    random.seed(seed)

    try:
        for _ in range(turns):
            if clone.is_game_over:
                break

            execute_turn(clone)

            # Load next day's ATO if day boundary crossed
            if abs(clone.current_hour) < 1e-9 and clone.current_day <= CAMPAIGN_DAYS:
                ato = get_ato_for_day(clone.current_day)
                if ato:
                    clone.current_ato = ato

            # Sample readiness after each turn
            metrics = compute_metrics(clone)
            readiness_samples.append(metrics["fleet_readiness"])
    finally:
        # Always restore original random state so game dice aren't affected
        random.setstate(rng_state)

    # Count mission outcomes across the entire ATO
    missions_completed = 0
    missions_failed = 0
    if clone.current_ato:
        for m in clone.current_ato.missions:
            if m.status == MissionStatus.COMPLETED:
                missions_completed += 1
            elif m.status == MissionStatus.FAILED:
                missions_failed += 1

    # Compute deltas
    fuel_burned = round(initial_fuel - clone.resources.fuel_storage, 1)
    missiles_used = initial_missiles - clone.resources.missiles
    ue_used = initial_ue - clone.resources.exchange_units

    avg_readiness = round(
        sum(readiness_samples) / len(readiness_samples) if readiness_samples else 0,
        1,
    )

    final_metrics = compute_metrics(clone)

    return {
        "missions_completed": missions_completed,
        "missions_failed": missions_failed,
        "avg_readiness": avg_readiness,
        "fuel_burned": fuel_burned,
        "missiles_used": missiles_used,
        "ue_used": ue_used,
        "final_risk": final_metrics["risk_score"],
    }
