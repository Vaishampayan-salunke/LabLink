from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas.ai import (
    ProjectAnalysisRequest,
    ProjectAnalysisResponse,
    EquipmentRecommendResponse,
    AIChatRequest,
    AIChatResponse,
)
from app.schemas.booking import SchedulingRecommendationResponse
from app.services.ai_service import (
    extract_project_requirements,
    match_equipment_from_db,
    handle_ai_chat,
)
from app.services.scheduling_service import find_alternative_slots, check_slot_conflict

router = APIRouter()


@router.post("/project-analyze", response_model=ProjectAnalysisResponse)
def analyze_project(
    req: ProjectAnalysisRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Extract structured project metadata and hardware requirements from natural language.
    Validates output using Pydantic.
    """
    return extract_project_requirements(req.project_description)


@router.post("/equipment-recommend", response_model=EquipmentRecommendResponse)
def recommend_equipment(
    req: ProjectAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Extracts requirements and retrieves grounded, verified equipment from PostgreSQL.
    Never invents nonexistent IDs.
    """
    analysis = extract_project_requirements(req.project_description)
    return match_equipment_from_db(db, analysis.extracted_requirements)


@router.post("/chat", response_model=AIChatResponse)
def ai_assistant_chat(
    chat_req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Conversational assistant for campus equipment discovery and scheduling advice.
    """
    return handle_ai_chat(db, chat_req.message, chat_req.conversation_history)
