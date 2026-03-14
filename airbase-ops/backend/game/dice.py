import random
from models.aircraft import MaintenanceType, MaintenanceInfo


def roll_d6() -> int:
    return random.randint(1, 6)


def pre_flight_check() -> tuple[bool, MaintenanceInfo | None]:
    """
    Roll for pre-flight (Loading, Fueling, Arming, BIT startup).
    Roll 1-4: OK
    Roll 5-6: Fault — Quick LRU replacement, 48 hours
    """
    roll = roll_d6()
    if roll <= 4:
        return True, None
    else:
        return False, MaintenanceInfo(
            type=MaintenanceType.QUICK_LRU,
            total_hours=48.0,
            hours_remaining=48.0,
            requires_ue=True,
            facility="Service Bay (Flight Line)"
        )


def post_flight_check() -> tuple[bool, MaintenanceInfo | None]:
    """
    Roll for post-flight reception.
    Roll 1-3: OK
    Roll 4: Complex LRU, 168h (7 days)
    Roll 5: Direct repair, 360h (15 days)
    Roll 6: Troubleshoot, 72h (3 days)
    """
    roll = roll_d6()
    outcomes = {
        1: (True, None),
        2: (True, None),
        3: (True, None),
        4: (False, MaintenanceInfo(
            type=MaintenanceType.COMPLEX_LRU,
            total_hours=168.0,
            hours_remaining=168.0,
            requires_ue=True,
            facility="Minor Maint Workshop"
        )),
        5: (False, MaintenanceInfo(
            type=MaintenanceType.DIRECT_REPAIR,
            total_hours=360.0,
            hours_remaining=360.0,
            requires_ue=False,
            facility="Major Maint Workshop"
        )),
        6: (False, MaintenanceInfo(
            type=MaintenanceType.TROUBLESHOOT,
            total_hours=72.0,
            hours_remaining=72.0,
            requires_ue=False,
            facility="Service Bay"
        )),
    }
    return outcomes[roll]


def weapon_loss_roll() -> float:
    """
    After a mission with weapons, roll for how many weapons are consumed/lost.
    Roll 1: 10%, Roll 2: 30%, Roll 3: 50%, Roll 4: 70%, Roll 5: 90%, Roll 6: 100%
    """
    roll = roll_d6()
    loss_table = {1: 0.1, 2: 0.3, 3: 0.5, 4: 0.7, 5: 0.9, 6: 1.0}
    return loss_table[roll]


def maintenance_time_variance() -> float:
    """
    When maintenance nominal time is reached, roll to see if extra time is needed.
    Roll 1-3: 0% extra, Roll 4: +10%, Roll 5: +20%, Roll 6: +50%
    """
    roll = roll_d6()
    variance_table = {1: 1.0, 2: 1.0, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.5}
    return variance_table[roll]
