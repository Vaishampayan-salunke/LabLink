from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel
from app.models.equipment_unit import QREventType


class QRCheckInRequest(BaseModel):
    unit_serial: str
    booking_id: str


class QRCheckOutRequest(BaseModel):
    unit_serial: str
    booking_id: str
    condition_notes: str | None = None


class QRCheckEventOut(BaseModel):
    id: str
    equipment_unit_id: str
    booking_id: str
    event_type: QREventType
    user_id: str | None
    condition_notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class EquipmentUnitOut(BaseModel):
    id: str
    equipment_id: str
    unit_serial: str
    qr_code_token: str
    is_functional: bool
    is_available: bool
    created_at: datetime

    model_config = {"from_attributes": True}
