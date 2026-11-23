"""Tests for QR Code and Unit check-in/out endpoints."""
import pytest
from app.models.booking import Booking, BookingStatus
from app.models.equipment_unit import EquipmentUnit, QREventType
from datetime import datetime, timezone, timedelta
from tests.conftest import TestingSessionLocal


def test_qr_workflow(client, student_headers, admin_headers):
    # Fetch equipment
    eq_resp = client.get("/api/v1/equipment", headers=admin_headers)
    eq_id = eq_resp.json()[0]["id"]

    # Get student me
    me_resp = client.get("/api/v1/auth/me", headers=student_headers)
    student_id = me_resp.json()["id"]

    # Use TestingSessionLocal directly so client sees the committed changes
    session = TestingSessionLocal()
    unit = session.query(EquipmentUnit).filter(EquipmentUnit.equipment_id == eq_id).first()
    if not unit:
        unit = EquipmentUnit(
            equipment_id=eq_id,
            unit_serial="TEST-SERIAL-QR-001",
            qr_code_token="token1234567890",
            is_functional=True,
            is_available=True,
        )
        session.add(unit)
        session.flush()

    booking = Booking(
        equipment_id=eq_id,
        student_id=student_id,
        start_time=datetime.now(timezone.utc),
        end_time=datetime.now(timezone.utc) + timedelta(hours=2),
        status=BookingStatus.CONFIRMED,
        purpose="QR Test Session",
    )
    session.add(booking)
    session.commit()

    unit_serial = unit.unit_serial
    booking_id = booking.id
    session.close()

    # 1. Fetch units
    units_resp = client.get(f"/api/v1/equipment/{eq_id}/units", headers=student_headers)
    assert units_resp.status_code == 200
    assert len(units_resp.json()) >= 1

    # 2. Check-in
    checkin_resp = client.post(
        "/api/v1/qr/check-in",
        json={"unit_serial": unit_serial, "booking_id": booking_id},
        headers=student_headers,
    )
    assert checkin_resp.status_code == 201
    assert checkin_resp.json()["event_type"] == "CHECK_IN"

    # 3. Check-out
    checkout_resp = client.post(
        "/api/v1/qr/check-out",
        json={
            "unit_serial": unit_serial,
            "booking_id": booking_id,
            "condition_notes": "All sensors functional, returned in good shape",
        },
        headers=student_headers,
    )
    assert checkout_resp.status_code == 201
    assert checkout_resp.json()["event_type"] == "CHECK_OUT"
    assert checkout_resp.json()["condition_notes"] == "All sensors functional, returned in good shape"
