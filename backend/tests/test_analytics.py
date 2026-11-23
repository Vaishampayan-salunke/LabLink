def test_student_analytics_endpoint(client, student_headers):
    response = client.get("/api/v1/analytics/student", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert "upcoming_bookings" in data
    assert "pending_approvals" in data
    assert "total_bookings" in data
    assert "recent_activity" in data


def test_faculty_analytics_endpoint(client, faculty_headers):
    response = client.get("/api/v1/analytics/faculty", headers=faculty_headers)
    assert response.status_code == 200
    data = response.json()
    assert "pending_approvals_count" in data
    assert "utilization_rate" in data
    assert "department_equipment_count" in data


def test_admin_analytics_endpoint(client, admin_headers):
    response = client.get("/api/v1/analytics/admin", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_users"] >= 3
    assert data["total_equipment"] >= 2
    assert "department_utilization" in data
    assert "booking_trends" in data
