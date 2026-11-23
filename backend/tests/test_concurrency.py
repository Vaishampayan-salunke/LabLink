import concurrent.futures
from datetime import datetime, timezone, timedelta
from app.main import app
from fastapi.testclient import TestClient


def test_concurrency_conflicting_confirmed_bookings_prevented(client, student_headers):
    """
    Simulate simultaneous booking requests for the same single-capacity equipment
    during an overlapping time window.
    Assert that only one succeeds, and the other is rejected with 409 Conflict!
    """
    all_eq = client.get("/api/v1/equipment").json()
    unrestricted_eq = next(e for e in all_eq if not e["is_restricted"] and e["total_quantity"] == 1)

    now = datetime.now(timezone.utc)
    # Target slot: 2 hours
    start_time = (now + timedelta(days=25, hours=10)).isoformat()
    end_time = (now + timedelta(days=25, hours=12)).isoformat()

    booking_payload = {
        "equipment_id": unrestricted_eq["id"],
        "start_time": start_time,
        "end_time": end_time,
        "purpose": "High concurrency race condition verification",
    }

    # First request confirms the booking
    res1 = client.post("/api/v1/bookings", headers=student_headers, json=booking_payload)
    assert res1.status_code == 201
    assert res1.json()["status"] == "CONFIRMED"

    # Second overlapping request MUST be rejected with HTTP 409 Conflict
    res2 = client.post("/api/v1/bookings", headers=student_headers, json=booking_payload)
    assert res2.status_code == 409
    assert "conflict" in res2.json()["detail"].lower()


def test_concurrency_partial_overlap_rejected(client, student_headers):
    """
    Test that partial overlaps (e.g. 10:30 - 12:30 overlapping with 10:00 - 12:00) are also blocked.
    """
    all_eq = client.get("/api/v1/equipment").json()
    unrestricted_eq = next(e for e in all_eq if not e["is_restricted"] and e["total_quantity"] == 1)

    now = datetime.now(timezone.utc)
    # Existing slot: Day 26, 14:00 - 16:00
    start1 = (now + timedelta(days=26, hours=14)).isoformat()
    end1 = (now + timedelta(days=26, hours=16)).isoformat()

    res1 = client.post(
        "/api/v1/bookings",
        headers=student_headers,
        json={
            "equipment_id": unrestricted_eq["id"],
            "start_time": start1,
            "end_time": end1,
            "purpose": "Primary slot allocation",
        },
    )
    assert res1.status_code == 201

    # Overlapping slot: Day 26, 15:00 - 17:00 (overlaps by 1 hour)
    start2 = (now + timedelta(days=26, hours=15)).isoformat()
    end2 = (now + timedelta(days=26, hours=17)).isoformat()

    res2 = client.post(
        "/api/v1/bookings",
        headers=student_headers,
        json={
            "equipment_id": unrestricted_eq["id"],
            "start_time": start2,
            "end_time": end2,
            "purpose": "Overlapping slot allocation",
        },
    )
    assert res2.status_code == 409
