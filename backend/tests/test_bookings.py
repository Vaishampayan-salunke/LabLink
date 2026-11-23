from datetime import datetime, timezone, timedelta


def test_create_unrestricted_booking_auto_confirms(client, student_headers):
    """Test that eligible unrestricted equipment is automatically CONFIRMED without faculty approval."""
    all_eq = client.get("/api/v1/equipment").json()
    unrestricted_eq = next(e for e in all_eq if not e["is_restricted"])

    now = datetime.now(timezone.utc)
    start = (now + timedelta(days=10, hours=2)).isoformat()
    end = (now + timedelta(days=10, hours=4)).isoformat()

    response = client.post(
        "/api/v1/bookings",
        headers=student_headers,
        json={
            "equipment_id": unrestricted_eq["id"],
            "start_time": start,
            "end_time": end,
            "purpose": "Verifying sensor reading and serial output",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "CONFIRMED"  # Auto-confirmed!


def test_create_restricted_booking_requires_approval(client, student_headers):
    """Test that restricted equipment requires faculty approval and enters PENDING status."""
    all_eq = client.get("/api/v1/equipment").json()
    restricted_eq = next(e for e in all_eq if e["is_restricted"])

    now = datetime.now(timezone.utc)
    start = (now + timedelta(days=11, hours=2)).isoformat()
    end = (now + timedelta(days=11, hours=4)).isoformat()

    response = client.post(
        "/api/v1/bookings",
        headers=student_headers,
        json={
            "equipment_id": restricted_eq["id"],
            "start_time": start,
            "end_time": end,
            "purpose": "Hardware acceleration project synthesis",
            "project_title": "FPGA Accelerator",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "PENDING"  # Must await approval!


def test_faculty_approval_workflow(client, student_headers, faculty_headers):
    """Full workflow: Student requests restricted equipment -> Faculty approves -> Booking transitions to CONFIRMED."""
    all_eq = client.get("/api/v1/equipment").json()
    restricted_eq = next(e for e in all_eq if e["is_restricted"] and e["name"] == "Test FPGA Board")

    now = datetime.now(timezone.utc)
    start = (now + timedelta(days=12, hours=1)).isoformat()
    end = (now + timedelta(days=12, hours=3)).isoformat()

    # 1. Student requests
    book_res = client.post(
        "/api/v1/bookings",
        headers=student_headers,
        json={
            "equipment_id": restricted_eq["id"],
            "start_time": start,
            "end_time": end,
            "purpose": "Verilog HDL synthesis simulation",
        },
    )
    booking_id = book_res.json()["id"]

    # 2. Faculty views pending
    pending_res = client.get("/api/v1/approvals/pending", headers=faculty_headers)
    assert pending_res.status_code == 200
    pending_ids = [b["id"] for b in pending_res.json()]
    assert booking_id in pending_ids

    # 3. Faculty approves
    approve_res = client.post(
        f"/api/v1/approvals/{booking_id}/approve",
        headers=faculty_headers,
        json={"decision": "APPROVED", "comments": "Project approved for lab run."},
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "CONFIRMED"


def test_faculty_rejection_requires_reason(client, student_headers, faculty_headers):
    """Verify rejection enforces a mandatory reason."""
    all_eq = client.get("/api/v1/equipment").json()
    restricted_eq = next(e for e in all_eq if e["is_restricted"] and e["name"] == "Test FPGA Board")

    now = datetime.now(timezone.utc)
    start = (now + timedelta(days=13, hours=1)).isoformat()
    end = (now + timedelta(days=13, hours=3)).isoformat()

    book_res = client.post(
        "/api/v1/bookings",
        headers=student_headers,
        json={
            "equipment_id": restricted_eq["id"],
            "start_time": start,
            "end_time": end,
            "purpose": "Testing safety interlock",
        },
    )
    booking_id = book_res.json()["id"]

    # Rejection without reason fails
    reject_fail = client.post(
        f"/api/v1/approvals/{booking_id}/reject",
        headers=faculty_headers,
        json={"decision": "REJECTED"},
    )
    assert reject_fail.status_code == 400

    # Rejection with reason succeeds
    reject_ok = client.post(
        f"/api/v1/approvals/{booking_id}/reject",
        headers=faculty_headers,
        json={"decision": "REJECTED", "rejection_reason": "Lab capacity reached."},
    )
    assert reject_ok.status_code == 200
    assert reject_ok.json()["status"] == "REJECTED"
    assert reject_ok.json()["rejection_reason"] == "Lab capacity reached."
