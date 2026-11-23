from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class DepartmentBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


class LaboratoryBase(BaseModel):
    name: str
    room_number: str
    building: str
    operating_hours: str = "08:00 - 18:00"
    faculty_coordinator_id: Optional[str] = None


class LaboratoryCreate(LaboratoryBase):
    department_id: str


class LaboratoryUpdate(BaseModel):
    name: Optional[str] = None
    room_number: Optional[str] = None
    building: Optional[str] = None
    operating_hours: Optional[str] = None
    faculty_coordinator_id: Optional[str] = None


class LaboratoryOut(LaboratoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    department_id: str
    created_at: datetime


class DepartmentOut(DepartmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    laboratories: List[LaboratoryOut] = []
