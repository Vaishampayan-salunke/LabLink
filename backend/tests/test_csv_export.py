"""Tests for CSV analytics export endpoint."""
import pytest


def test_export_bookings_csv(client, admin_headers):
    response = client.get("/api/v1/analytics/export/csv", headers=admin_headers)
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    assert "booking_id" in response.text
    assert "equipment_name" in response.text


def test_export_bookings_csv_forbidden_for_students(client, student_headers):
    response = client.get("/api/v1/analytics/export/csv", headers=student_headers)
    assert response.status_code == 403
