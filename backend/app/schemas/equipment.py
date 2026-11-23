from datetime import datetime, time
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.equipment import EquipmentStatus, MaintenanceStatus


class SpecificationSchema(BaseModel):
    spec_name: str
    spec_value: str


class AccessPolicySchema(BaseModel):
    allowed_roles: str = "STUDENT,FACULTY,ADMIN"
    max_booking_hours: int = 4
    requires_approval: bool = False
    auto_approve_eligible: bool = True


class AvailabilityRuleSchema(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time
    is_available: bool = True


class EquipmentBase(BaseModel):
    name: str
    category: str
    department_id: str
    laboratory_id: str
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: EquipmentStatus = EquipmentStatus.AVAILABLE
    is_restricted: bool = False
    total_quantity: int = 1
    available_quantity: int = 1


class EquipmentCreate(EquipmentBase):
    specifications: Optional[List[SpecificationSchema]] = []
    access_policy: Optional[AccessPolicySchema] = None
    availability_rules: Optional[List[AvailabilityRuleSchema]] = []


class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    department_id: Optional[str] = None
    laboratory_id: Optional[str] = None
    model_number: Optional[str] = None
    serial_number: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[EquipmentStatus] = None
    is_restricted: Optional[bool] = None
    total_quantity: Optional[int] = None
    available_quantity: Optional[int] = None


class SpecificationOut(SpecificationSchema):
    id: str

    class Config:
        from_attributes = True


class AccessPolicyOut(AccessPolicySchema):
    id: str

    class Config:
        from_attributes = True


class AvailabilityRuleOut(AvailabilityRuleSchema):
    id: str

    class Config:
        from_attributes = True


class EquipmentOut(EquipmentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    department_name: Optional[str] = None
    laboratory_name: Optional[str] = None
    specifications: List[SpecificationOut] = []
    access_policy: Optional[AccessPolicyOut] = None

    class Config:
        from_attributes = True


class EquipmentFilter(BaseModel):
    search: Optional[str] = None
    department_id: Optional[str] = None
    laboratory_id: Optional[str] = None
    category: Optional[str] = None
    status: Optional[EquipmentStatus] = None
    is_restricted: Optional[bool] = None
    page: int = 1
    page_size: int = 20


class MaintenanceCreate(BaseModel):
    equipment_id: str
    start_time: datetime
    end_time: datetime
    reason: str
    notes: Optional[str] = None


class MaintenanceOut(BaseModel):
    id: str
    equipment_id: str
    equipment_name: Optional[str] = None
    start_time: datetime
    end_time: datetime
    reason: str
    status: MaintenanceStatus
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
