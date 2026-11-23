"""Tests for Waitlist API endpoints."""
import pytest


def _get_equipment_id(client, headers, index=0):
    resp = client.get("/api/v1/equipment", headers=headers)
    items = resp.json()
    return items[min(index, len(items) - 1)]["id"]


def test_join_waitlist(client, student_headers, admin_headers):
    eq_id = _get_equipment_id(client, admin_headers, 0)
    response = client.post(
        "/api/v1/waitlist",
        json={"equipment_id": eq_id},
        headers=student_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["equipment_id"] == eq_id
    assert data["status"] == "QUEUED"


def test_cannot_join_waitlist_twice(client, student_headers, admin_headers):
    eq_id = _get_equipment_id(client, admin_headers, 0)
    # Already joined in previous test; second join should conflict
    response = client.post("/api/v1/waitlist", json={"equipment_id": eq_id}, headers=student_headers)
    assert response.status_code == 409


def test_my_waitlist(client, student_headers, admin_headers):
    response = client.get("/api/v1/waitlist/my", headers=student_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) >= 1  # from previous test


def test_cancel_waitlist(client, student_headers, admin_headers):
    # Get the existing QUEUED entry and cancel it
    my_resp = client.get("/api/v1/waitlist/my", headers=student_headers)
    queued = [e for e in my_resp.json() if e["status"] == "QUEUED"]
    assert len(queued) >= 1
    entry_id = queued[0]["id"]
    cancel_resp = client.delete(f"/api/v1/waitlist/{entry_id}", headers=student_headers)
    assert cancel_resp.status_code == 204


def test_all_waitlist_requires_faculty(client, student_headers):
    response = client.get("/api/v1/waitlist", headers=student_headers)
    assert response.status_code == 403


def test_all_waitlist_faculty_access(client, faculty_headers):
    response = client.get("/api/v1/waitlist", headers=faculty_headers)
    assert response.status_code == 200
