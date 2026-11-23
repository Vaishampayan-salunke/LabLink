from __future__ import annotations
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.models.waitlist import WaitlistStatus


class WaitlistEntryCreate(BaseModel):
    equipment_id: str
    notes: str | None = None


class WaitlistEntryOut(BaseModel):
    id: str
    equipment_id: str
    student_id: str
    priority_score: float
    status: WaitlistStatus
    offered_at: datetime | None
    expires_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}
