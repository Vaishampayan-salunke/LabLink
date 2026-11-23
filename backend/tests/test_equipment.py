def test_list_equipment(client):
    response = client.get("/api/v1/equipment")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    names = [e["name"] for e in data]
    assert "Test ESP32 Kit" in names
    assert "Test FPGA Board" in names


def test_filter_equipment_by_category(client):
    response = client.get("/api/v1/equipment?category=FPGA")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    for eq in data:
        assert "FPGA" in eq["category"]


def test_get_equipment_detail(client):
    all_eq = client.get("/api/v1/equipment").json()
    target_id = all_eq[0]["id"]

    response = client.get(f"/api/v1/equipment/{target_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == target_id
    assert "access_policy" in data


def test_student_cannot_delete_equipment(client, student_headers):
    all_eq = client.get("/api/v1/equipment").json()
    target_id = all_eq[0]["id"]

    response = client.delete(f"/api/v1/equipment/{target_id}", headers=student_headers)
    assert response.status_code == 403  # Admin required!
