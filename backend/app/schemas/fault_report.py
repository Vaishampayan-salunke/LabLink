from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel
from app.models.fault_report import FaultSeverity, FaultStatus


class FaultReportCreate(BaseModel):
    fault_description: str
    severity: FaultSeverity = FaultSeverity.MEDIUM


class FaultReportUpdate(BaseModel):
    status: FaultStatus | None = None
    resolution_notes: str | None = None


class FaultReportOut(BaseModel):
    id: str
    equipment_id: str
    reported_by_id: str | None
    fault_description: str
    severity: FaultSeverity
    status: FaultStatus
    created_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}
