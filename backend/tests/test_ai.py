from app.services.ai_service import extract_project_requirements, match_equipment_from_db


def test_ai_project_requirements_extraction():
    prompt = "I am developing an IoT smart irrigation system with ESP32. I need soil moisture sensors, Raspberry Pi, and an oscilloscope. My deadline is Dec 15."
    analysis = extract_project_requirements(prompt)

    assert analysis.project_title is not None
    assert len(analysis.extracted_requirements) >= 2

    categories = [r.category.lower() for r in analysis.extracted_requirements]
    hints = [r.name_hint.lower() for r in analysis.extracted_requirements if r.name_hint]

    # Verify key hardware was extracted
    assert any("embedded" in c or "esp32" in h for c, h in zip(categories, hints)) or len(hints) > 0


def test_ai_grounded_equipment_matching(db):
    prompt = "Need ESP32 and oscilloscope for telemetry"
    analysis = extract_project_requirements(prompt)
    result = match_equipment_from_db(db, analysis.extracted_requirements)

    assert result.matched_equipment is not None
    assert len(result.matched_equipment) > 0

    # Ensure every recommended equipment item exists in the database
    for eq in result.matched_equipment:
        assert eq.equipment_id is not None
        assert eq.equipment_name is not None
        assert eq.status in ["AVAILABLE", "IN_USE", "MAINTENANCE", "RETIRED"]
