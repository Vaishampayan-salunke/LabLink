import json
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.config import settings
from app.models.equipment import Equipment, EquipmentStatus
from app.models.department import Department, Laboratory
from app.schemas.ai import (
    ProjectAnalysisResponse,
    ExtractedEquipmentRequirement,
    EquipmentMatchResult,
    EquipmentRecommendResponse,
    AIChatResponse,
    AIChatMessage,
)

logger = logging.getLogger(__name__)


def extract_project_requirements(project_description: str) -> ProjectAnalysisResponse:
    """
    Extract project title, deadline, equipment categories and specifications using Gemini API.
    If Gemini is unavailable or not configured, utilizes deterministic heuristic parsing fallback.
    """
    if settings.GEMINI_API_KEY:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            prompt = f"""
You are an expert academic laboratory assistant. Analyze this student project description and extract the hardware/laboratory requirements:

"{project_description}"

Respond in valid JSON with this exact schema:
{{
  "project_title": "Short descriptive title",
  "summary": "1-2 sentence overview",
  "deadline_days_from_now": 30,
  "extracted_requirements": [
    {{
      "category": "Microcontrollers / Sensors / Computing / Test / Manufacturing",
      "name_hint": "e.g. ESP32, Oscilloscope, 3D Printer",
      "specifications": {{"key": "value"}},
      "reason": "Why needed"
    }}
  ],
  "compatibility_notes": ["Any voltage, interface, or software dependencies"]
}}
Return ONLY raw JSON, without markdown formatting.
"""
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
            )
            raw_text = response.text.strip()
            # Clean possible markdown fence
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            data = json.loads(raw_text.strip())
            days = data.get("deadline_days_from_now", 30)
            deadline = datetime.now(timezone.utc) + timedelta(days=days)

            reqs = [
                ExtractedEquipmentRequirement(
                    category=r.get("category", "General"),
                    name_hint=r.get("name_hint"),
                    specifications=r.get("specifications", {}),
                    reason=r.get("reason", "Required for project execution")
                )
                for r in data.get("extracted_requirements", [])
            ]

            return ProjectAnalysisResponse(
                project_title=data.get("project_title", "Student Research Project"),
                summary=data.get("summary", project_description[:150]),
                deadline=deadline,
                extracted_requirements=reqs,
                compatibility_notes=data.get("compatibility_notes", [])
            )
        except Exception as e:
            logger.warning(f"Gemini API call failed or timed out: {e}. Falling back to deterministic extractor.")

    # Robust deterministic fallback
    desc_lower = project_description.lower()
    reqs: List[ExtractedEquipmentRequirement] = []

    # Heuristic matches for standard engineering lab equipment
    if "esp32" in desc_lower or "iot" in desc_lower or "sensor" in desc_lower or "arduino" in desc_lower:
        reqs.append(
            ExtractedEquipmentRequirement(
                category="Embedded Systems",
                name_hint="ESP32 Development Board",
                specifications={"microcontroller": "Xtensa Dual-Core", "wireless": "Wi-Fi + BLE"},
                reason="Required for IoT sensing and network telemetry"
            )
        )
    if "raspberry" in desc_lower or "camera" in desc_lower or "vision" in desc_lower:
        reqs.append(
            ExtractedEquipmentRequirement(
                category="Single Board Computers",
                name_hint="Raspberry Pi 4 / 5",
                specifications={"ram": "4GB/8GB", "os": "Linux"},
                reason="Edge computation and host processing gateway"
            )
        )
    if "workstation" in desc_lower or "gpu" in desc_lower or "deep learning" in desc_lower or "train" in desc_lower:
        reqs.append(
            ExtractedEquipmentRequirement(
                category="High Performance Computing",
                name_hint="GPU Deep Learning Workstation",
                specifications={"gpu": "NVIDIA RTX 4090 / A5000", "cuda": "12.x"},
                reason="Model training, simulation, and high-performance computing"
            )
        )
    if "oscilloscope" in desc_lower or "circuit" in desc_lower or "signal" in desc_lower:
        reqs.append(
            ExtractedEquipmentRequirement(
                category="Measurement & Testing",
                name_hint="Digital Storage Oscilloscope",
                specifications={"bandwidth": "100MHz+", "channels": "4"},
                reason="Signal waveform analysis and circuit debugging"
            )
        )
    if "3d print" in desc_lower or "prototype" in desc_lower or "chassis" in desc_lower:
        reqs.append(
            ExtractedEquipmentRequirement(
                category="Additive Manufacturing",
                name_hint="Industrial 3D Printer",
                specifications={"material": "PLA / ABS / PETG"},
                reason="Rapid mechanical chassis and enclosure prototyping"
            )
        )

    if not reqs:
        reqs.append(
            ExtractedEquipmentRequirement(
                category="Laboratory Workstation",
                name_hint="General Lab Workstation",
                specifications={},
                reason="General experiment workbench"
            )
        )

    return ProjectAnalysisResponse(
        project_title="Extracted Engineering Project",
        summary=project_description[:200],
        deadline=datetime.now(timezone.utc) + timedelta(days=21),
        extracted_requirements=reqs,
        compatibility_notes=["Verify power supply voltages and interface pin compatibility"]
    )


def match_equipment_from_db(
    db: Session,
    requirements: List[ExtractedEquipmentRequirement]
) -> EquipmentRecommendResponse:
    """
    Search actual PostgreSQL database for matching equipment.
    Never hallucinates equipment IDs or fake statuses.
    """
    matched: List[EquipmentMatchResult] = []
    alternatives: List[EquipmentMatchResult] = []
    seen_ids = set()

    for req in requirements:
        query = db.query(Equipment)
        # Search by name hint or category
        filters = []
        if req.name_hint:
            filters.append(Equipment.name.ilike(f"%{req.name_hint}%"))
            filters.append(Equipment.description.ilike(f"%{req.name_hint}%"))
        if req.category:
            filters.append(Equipment.category.ilike(f"%{req.category}%"))

        if filters:
            query = query.filter(or_(*filters))

        results = query.limit(3).all()
        for eq in results:
            if eq.id in seen_ids:
                continue
            seen_ids.add(eq.id)

            dept_name = eq.department.name if eq.department else "General Department"
            lab_name = eq.laboratory.name if eq.laboratory else "Central Lab"

            match_res = EquipmentMatchResult(
                equipment_id=eq.id,
                equipment_name=eq.name,
                category=eq.category,
                department_name=dept_name,
                laboratory_name=lab_name,
                is_available=(eq.status == EquipmentStatus.AVAILABLE and eq.available_quantity > 0),
                status=eq.status.value,
                compatibility_score=95.0 if eq.status == EquipmentStatus.AVAILABLE else 60.0,
                relevance_explanation=f"Direct match for '{req.name_hint or req.category}'. {req.reason}"
            )
            if eq.status == EquipmentStatus.AVAILABLE and eq.available_quantity > 0:
                matched.append(match_res)
            else:
                alternatives.append(match_res)

    # If no direct matches, return available popular equipment as suggestions
    if not matched:
        fallbacks = db.query(Equipment).filter(
            Equipment.status == EquipmentStatus.AVAILABLE,
            Equipment.available_quantity > 0
        ).limit(3).all()
        for eq in fallbacks:
            if eq.id not in seen_ids:
                dept_name = eq.department.name if eq.department else "General Department"
                lab_name = eq.laboratory.name if eq.laboratory else "Central Lab"
                matched.append(
                    EquipmentMatchResult(
                        equipment_id=eq.id,
                        equipment_name=eq.name,
                        category=eq.category,
                        department_name=dept_name,
                        laboratory_name=lab_name,
                        is_available=True,
                        status=eq.status.value,
                        compatibility_score=75.0,
                        relevance_explanation="Suggested campus laboratory resource with available capacity."
                    )
                )

    guidance = (
        f"Retrieved {len(matched)} matching verified equipment items from campus laboratories. "
        "All recommendations are verified against live database availability."
    )
    return EquipmentRecommendResponse(
        matched_equipment=matched,
        alternatives=alternatives,
        guidance=guidance
    )


def handle_ai_chat(
    db: Session,
    message: str,
    history: List[AIChatMessage]
) -> AIChatResponse:
    """
    Interactive AI assistant chat for equipment discovery and project advising.
    Integrates Gemini where configured and supplies grounded equipment links from PostgreSQL.
    """
    analysis = extract_project_requirements(message)
    matched_results = match_equipment_from_db(db, analysis.extracted_requirements)

    equipment_summary = ", ".join([f"{e.equipment_name} ({e.department_name} - {e.laboratory_name})" for e in matched_results.matched_equipment[:3]])

    reply = (
        f"Based on your request, I analyzed the project requirements: '{analysis.project_title}'. "
        f"I identified {len(analysis.extracted_requirements)} required resource types. "
    )
    if equipment_summary:
        reply += f"Verified equipment available on campus includes: {equipment_summary}. "
        reply += "You can submit an access booking directly with slot conflict checking."
    else:
        reply += "You can browse the equipment catalogue to inspect available laboratory hardware."

    return AIChatResponse(
        reply=reply,
        suggested_equipment=matched_results.matched_equipment
    )
