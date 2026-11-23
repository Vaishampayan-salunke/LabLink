from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.booking import Booking, BookingStatus
from app.models.equipment import Equipment, EquipmentStatus, MaintenanceRecord, MaintenanceStatus
from app.schemas.booking import AlternativeSlot, ConflictCheckResponse


def check_slot_conflict(
    db: Session,
    equipment_id: str,
    start_time: datetime,
    end_time: datetime,
    exclude_booking_id: Optional[str] = None,
) -> ConflictCheckResponse:
    """
    Check if the requested slot conflicts with existing confirmed bookings or maintenance windows.
    Uses strict overlapping condition: (start < existing_end) AND (end > existing_start).
    """
    # 1. Check equipment status
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        return ConflictCheckResponse(
            has_conflict=True,
            reason="Equipment does not exist",
            conflicting_bookings_count=0,
            maintenance_conflict=False
        )

    if equipment.status in [EquipmentStatus.MAINTENANCE, EquipmentStatus.RETIRED]:
        return ConflictCheckResponse(
            has_conflict=True,
            reason=f"Equipment is currently marked as {equipment.status.value}",
            conflicting_bookings_count=0,
            maintenance_conflict=(equipment.status == EquipmentStatus.MAINTENANCE)
        )

    # 2. Check maintenance records
    active_maintenance = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.equipment_id == equipment_id,
        MaintenanceRecord.status.in_([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS]),
        and_(
            start_time < MaintenanceRecord.end_time,
            end_time > MaintenanceRecord.start_time
        )
    ).first()

    if active_maintenance:
        return ConflictCheckResponse(
            has_conflict=True,
            reason=f"Scheduled maintenance conflict: {active_maintenance.reason}",
            conflicting_bookings_count=0,
            maintenance_conflict=True
        )

    # 3. Check existing active bookings (CONFIRMED, CHECKED_OUT)
    query = db.query(Booking).filter(
        Booking.equipment_id == equipment_id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_OUT]),
        and_(
            start_time < Booking.end_time,
            end_time > Booking.start_time
        )
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)

    conflicting_bookings = query.all()
    if conflicting_bookings:
        # Check equipment available capacity vs conflicting count
        if len(conflicting_bookings) >= equipment.total_quantity:
            return ConflictCheckResponse(
                has_conflict=True,
                reason="All units for this equipment are already reserved during this time slot",
                conflicting_bookings_count=len(conflicting_bookings),
                maintenance_conflict=False
            )

    return ConflictCheckResponse(
        has_conflict=False,
        reason=None,
        conflicting_bookings_count=0,
        maintenance_conflict=False
    )


def compute_fairness_penalty(db: Session, student_id: str, equipment_id: str) -> float:
    """
    Computes fairness score (0 - 100).
    Students with many completed/confirmed bookings on this equipment in the last 30 days receive a lower fairness score.
    """
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    user_recent_bookings = db.query(Booking).filter(
        Booking.student_id == student_id,
        Booking.equipment_id == equipment_id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_OUT, BookingStatus.COMPLETED]),
        Booking.created_at >= thirty_days_ago
    ).count()

    # Base fairness is 100; subtract 15 points per previous booking down to min 20
    score = max(20.0, 100.0 - (user_recent_bookings * 15.0))
    return score


def calculate_candidate_score(
    start_time: datetime,
    end_time: datetime,
    target_start: datetime,
    deadline: Optional[datetime],
    fairness_score: float,
    has_conflict: bool
) -> Tuple[float, str]:
    """
    Deterministic scoring:
    - Deadline urgency: 30%
    - Equipment availability: 25%
    - Requirement compatibility: 20%
    - Fairness: 15%
    - Schedule suitability: 10%
    """
    if has_conflict:
        return 0.0, "Violates hard availability constraint"

    # 1. Availability component (100 if no conflict)
    availability_component = 100.0

    # 2. Compatibility component
    compatibility_component = 95.0

    # 3. Schedule suitability (closer to target slot is better)
    hour_diff = abs((start_time - target_start).total_seconds()) / 3600.0
    suitability_component = max(10.0, 100.0 - (hour_diff * 4.0))

    # 4. Deadline urgency
    if deadline:
        # If alternative slot is before deadline, reward it; if after deadline, severe penalty
        time_to_deadline = (deadline - end_time).total_seconds() / 3600.0
        if time_to_deadline > 24:
            urgency_component = 95.0
        elif time_to_deadline > 0:
            urgency_component = 75.0
        else:
            urgency_component = 10.0
    else:
        urgency_component = 80.0

    # 5. Fairness
    # fairness_score passed in (0-100)

    # Total weighted score
    total_score = (
        (urgency_component * 0.30) +
        (availability_component * 0.25) +
        (compatibility_component * 0.20) +
        (fairness_score * 0.15) +
        (suitability_component * 0.10)
    )

    explanation = (
        f"Score {total_score:.1f}/100: "
        f"Urgency={urgency_component:.0f}%, "
        f"Availability={availability_component:.0f}%, "
        f"Suitability={suitability_component:.0f}%, "
        f"Fairness={fairness_score:.0f}%"
    )
    return round(total_score, 1), explanation


def find_alternative_slots(
    db: Session,
    equipment_id: str,
    requested_start: datetime,
    requested_end: datetime,
    student_id: str,
    deadline: Optional[datetime] = None,
    max_alternatives: int = 4
) -> List[AlternativeSlot]:
    """
    Generates feasible alternative slots when the primary slot is unavailable or for recommendations.
    Scans forward over upcoming days between 09:00 and 18:00.
    """
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        return []

    duration = requested_end - requested_start
    if duration.total_seconds() <= 0:
        duration = timedelta(hours=2)

    fairness_score = compute_fairness_penalty(db, student_id, equipment_id)
    candidates: List[AlternativeSlot] = []

    # Propose offsets: +3 hours, +1 day same time, +2 days same time, +1 day morning, +1 day afternoon
    offsets = [
        timedelta(hours=3),
        timedelta(days=1),
        timedelta(days=1, hours=3),
        timedelta(days=2),
        timedelta(days=2, hours=-2),
        timedelta(days=3),
    ]

    for offset in offsets:
        cand_start = requested_start + offset
        cand_end = cand_start + duration

        # Laboratory operating hours constraint (09:00 to 18:00)
        if cand_start.hour < 9:
            cand_start = cand_start.replace(hour=9, minute=0)
            cand_end = cand_start + duration
        elif cand_end.hour > 18 or (cand_end.hour == 18 and cand_end.minute > 0):
            cand_start = (cand_start + timedelta(days=1)).replace(hour=9, minute=0)
            cand_end = cand_start + duration

        conflict = check_slot_conflict(db, equipment_id, cand_start, cand_end)
        if not conflict.has_conflict:
            score, explanation = calculate_candidate_score(
                cand_start, cand_end, requested_start, deadline, fairness_score, conflict.has_conflict
            )
            candidates.append(
                AlternativeSlot(
                    start_time=cand_start,
                    end_time=cand_end,
                    score=score,
                    feasibility=True,
                    explanation=explanation,
                    equipment_id=equipment.id,
                    equipment_name=equipment.name
                )
            )

        if len(candidates) >= max_alternatives:
            break

    # Sort descending by recommendation score
    candidates.sort(key=lambda x: x.score, reverse=True)
    return candidates
