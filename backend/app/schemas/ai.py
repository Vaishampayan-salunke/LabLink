from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class ExtractedEquipmentRequirement(BaseModel):
    category: str
    name_hint: Optional[str] = None
    specifications: Dict[str, str] = {}
    reason: Optional[str] = None


class ProjectAnalysisRequest(BaseModel):
    project_description: str


class ProjectAnalysisResponse(BaseModel):
    project_title: str
    summary: str
    deadline: Optional[datetime] = None
    extracted_requirements: List[ExtractedEquipmentRequirement] = []
    compatibility_notes: List[str] = []


class EquipmentMatchResult(BaseModel):
    equipment_id: str
    equipment_name: str
    category: str
    department_name: str
    laboratory_name: str
    is_available: bool
    status: str
    compatibility_score: float
    relevance_explanation: str


class EquipmentRecommendResponse(BaseModel):
    matched_equipment: List[EquipmentMatchResult] = []
    alternatives: List[EquipmentMatchResult] = []
    guidance: str


class AIChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class AIChatRequest(BaseModel):
    message: str
    conversation_history: List[AIChatMessage] = []


class AIChatResponse(BaseModel):
    reply: str
    suggested_equipment: List[EquipmentMatchResult] = []
