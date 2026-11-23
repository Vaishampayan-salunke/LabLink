from datetime import datetime, timezone, timedelta
from app.services.scheduling_service import (
    check_slot_conflict,
    calculate_candidate_score,
    find_alternative_slots,
    compute_fairness_penalty,
)
from app.models.equipment import Equipment
from app.models.user import User


def test_deterministic_scoring_weights():
    target_start = datetime(2026, 12, 1, 10, 0, tzinfo=timezone.utc)
    cand_start = target_start + timedelta(hours=1)
    cand_end = cand_start + timedelta(hours=2)
    deadline = target_start + timedelta(days=5)

    score, explanation = calculate_candidate_score(
        start_time=cand_start,
        end_time=cand_end,
        target_start=target_start,
        deadline=deadline,
        fairness_score=100.0,
        has_conflict=False,
    )
    assert 0.0 <= score <= 100.0
    assert "Score" in explanation
    assert "Urgency" in explanation


def test_hard_constraint_enforced_in_scoring():
    target_start = datetime(2026, 12, 1, 10, 0, tzinfo=timezone.utc)
    cand_start = target_start
    cand_end = cand_start + timedelta(hours=2)

    score, explanation = calculate_candidate_score(
        start_time=cand_start,
        end_time=cand_end,
        target_start=target_start,
        deadline=None,
        fairness_score=100.0,
        has_conflict=True,  # Hard conflict!
    )
    assert score == 0.0
    assert "Violates hard availability constraint" in explanation


def test_find_alternative_slots(db):
    eq = db.query(Equipment).filter(Equipment.name == "Test ESP32 Kit").first()
    student = db.query(User).filter(User.role == "STUDENT").first()

    requested_start = datetime(2026, 12, 5, 10, 0, tzinfo=timezone.utc)
    requested_end = requested_start + timedelta(hours=2)

    alts = find_alternative_slots(
        db=db,
        equipment_id=eq.id,
        requested_start=requested_start,
        requested_end=requested_end,
        student_id=student.id,
        max_alternatives=3,
    )
    assert len(alts) > 0
    for alt in alts:
        assert alt.feasibility is True
        assert alt.score > 0
        assert alt.equipment_id == eq.id
