"""Tests for Projects API endpoints."""
import pytest
from app.models.user import User
from app.models.project import Project


def test_create_project(client, student_headers):
    response = client.post(
        "/api/v1/projects",
        json={"title": "Smart Agriculture Node", "description": "IoT soil sensor mesh project.", "domain": "IoT"},
        headers=student_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Smart Agriculture Node"
    assert data["created_by_id"]
    assert len(data["members"]) == 1  # creator auto-added


def test_list_projects_student(client, student_headers):
    # Create a project first
    client.post(
        "/api/v1/projects",
        json={"title": "Test Project", "description": "Test description."},
        headers=student_headers,
    )
    response = client.get("/api/v1/projects", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_list_projects_admin(client, admin_headers):
    response = client.get("/api/v1/projects", headers=admin_headers)
    assert response.status_code == 200


def test_get_project_detail(client, student_headers):
    create_resp = client.post(
        "/api/v1/projects",
        json={"title": "Detail Test", "description": "Description for detail test."},
        headers=student_headers,
    )
    project_id = create_resp.json()["id"]
    response = client.get(f"/api/v1/projects/{project_id}", headers=student_headers)
    assert response.status_code == 200
    assert response.json()["id"] == project_id


def test_update_project(client, student_headers):
    create_resp = client.post(
        "/api/v1/projects",
        json={"title": "Before Update", "description": "Before."},
        headers=student_headers,
    )
    project_id = create_resp.json()["id"]
    update_resp = client.patch(
        f"/api/v1/projects/{project_id}",
        json={"title": "After Update"},
        headers=student_headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "After Update"


def test_create_project_requires_auth(client):
    response = client.post(
        "/api/v1/projects",
        json={"title": "No Auth", "description": "Should fail."},
    )
    assert response.status_code == 401


def test_get_nonexistent_project(client, student_headers):
    response = client.get("/api/v1/projects/00000000-0000-0000-0000-000000000000", headers=student_headers)
    assert response.status_code == 404
