"""Tests for Fault Reports API endpoints."""
import pytest


def _get_equipment_id(client, admin_headers):
    resp = client.get("/api/v1/equipment", headers=admin_headers)
    return resp.json()[0]["id"]


def test_submit_fault_report(client, student_headers, admin_headers):
    eq_id = _get_equipment_id(client, admin_headers)
    response = client.post(
        f"/api/v1/equipment/{eq_id}/fault-reports",
        json={"fault_description": "Screen flickering intermittently", "severity": "MEDIUM"},
        headers=student_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["fault_description"] == "Screen flickering intermittently"
    assert data["severity"] == "MEDIUM"
    assert data["status"] == "OPEN"


def test_list_fault_reports(client, student_headers, admin_headers):
    eq_id = _get_equipment_id(client, admin_headers)
    client.post(
        f"/api/v1/equipment/{eq_id}/fault-reports",
        json={"fault_description": "Power supply issue", "severity": "HIGH"},
        headers=student_headers,
    )
    response = client.get(f"/api/v1/equipment/{eq_id}/fault-reports", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_update_fault_report_status(client, faculty_headers, student_headers, admin_headers):
    eq_id = _get_equipment_id(client, admin_headers)
    create_resp = client.post(
        f"/api/v1/equipment/{eq_id}/fault-reports",
        json={"fault_description": "Needs repair", "severity": "CRITICAL"},
        headers=student_headers,
    )
    report_id = create_resp.json()["id"]
    update_resp = client.patch(
        f"/api/v1/fault-reports/{report_id}",
        json={"status": "RESOLVED"},
        headers=faculty_headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "RESOLVED"
    assert update_resp.json()["resolved_at"] is not None


def test_update_fault_report_requires_faculty(client, student_headers, admin_headers):
    eq_id = _get_equipment_id(client, admin_headers)
    create_resp = client.post(
        f"/api/v1/equipment/{eq_id}/fault-reports",
        json={"fault_description": "Minor issue", "severity": "LOW"},
        headers=student_headers,
    )
    report_id = create_resp.json()["id"]
    update_resp = client.patch(
        f"/api/v1/fault-reports/{report_id}",
        json={"status": "RESOLVED"},
        headers=student_headers,
    )
    assert update_resp.status_code == 403


def test_fault_report_requires_auth(client, admin_headers):
    eq_id = _get_equipment_id(client, admin_headers)
    response = client.post(
        f"/api/v1/equipment/{eq_id}/fault-reports",
        json={"fault_description": "No auth test", "severity": "LOW"},
    )
    assert response.status_code == 401
