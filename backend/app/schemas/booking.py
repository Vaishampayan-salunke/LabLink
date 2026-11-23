from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.models.booking import BookingStatus, ApprovalDecision


class ProjectRequestCreate(BaseModel):
    title: str
    description: str
    deadline: Optional[datetime] = None


class ProjectRequestOut(ProjectRequestCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    student_id: str
    created_at: datetime


class BookingCreate(BaseModel):
    equipment_id: str
    start_time: datetime
    end_time: datetime
    purpose: str
    project_title: Optional[str] = None
    project_description: Optional[str] = None
    project_deadline: Optional[datetime] = None


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    equipment_id: str
    equipment_name: Optional[str] = None
    equipment_category: Optional[str] = None
    student_id: str
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    department_name: Optional[str] = None
    laboratory_name: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: BookingStatus
    purpose: str
    rejection_reason: Optional[str] = None
    project_title: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class BookingApprovalRequest(BaseModel):
    decision: ApprovalDecision
    comments: Optional[str] = None
    rejection_reason: Optional[str] = None


class ConflictCheckRequest(BaseModel):
    equipment_id: str
    start_time: datetime
    end_time: datetime


class ConflictCheckResponse(BaseModel):
    has_conflict: bool
    reason: Optional[str] = None
    conflicting_bookings_count: int = 0
    maintenance_conflict: bool = False


class AlternativeSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    score: float
    feasibility: bool
    explanation: str
    equipment_id: str
    equipment_name: str


class SchedulingRecommendationResponse(BaseModel):
    is_requested_slot_available: bool
    recommended_slot: Optional[AlternativeSlot] = None
    alternative_slots: List[AlternativeSlot] = []
    conflict_reason: Optional[str] = None
