def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["online", "degraded"]
    assert data["service"] == "LabLink"
    assert "database" in data


def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test.admin@lablink.edu", "password": "TestAdminPass123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["email"] == "test.admin@lablink.edu"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test.admin@lablink.edu", "password": "WrongPassword999!"},
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_register_student_enforces_student_role(client):
    """Verify security: self-registration MUST enforce STUDENT role and ignore attempted privilege escalation."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "hacker.wannabe@college.edu",
            "password": "Password123!",
            "full_name": "Hacker Wannabe",
            "role": "ADMIN",  # Attempting privilege escalation
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "STUDENT"  # Securely forced to STUDENT!


def test_get_current_user_profile(client, student_headers):
    response = client.get("/api/v1/auth/me", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test.student@lablink.edu"
    assert data["role"] == "STUDENT"


def test_unauthorized_access_rejected(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
