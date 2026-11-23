import uuid
from datetime import datetime, timezone, time
import enum
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    DateTime,
    Time,
    ForeignKey,
    Text,
    Enum,
    Index
)
from sqlalchemy.orm import relationship
from app.db.base import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class EquipmentStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    IN_USE = "IN_USE"
    MAINTENANCE = "MAINTENANCE"
    RETIRED = "RETIRED"


class MaintenanceStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    laboratory_id = Column(String(36), ForeignKey("laboratories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(80), nullable=False, index=True)
    model_number = Column(String(100), nullable=True)
    serial_number = Column(String(100), nullable=True, unique=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.AVAILABLE, nullable=False, index=True)
    is_restricted = Column(Boolean, default=False, nullable=False, index=True)
    total_quantity = Column(Integer, default=1, nullable=False)
    available_quantity = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    department = relationship("Department", back_populates="equipment")
    laboratory = relationship("Laboratory", back_populates="equipment")
    specifications = relationship("EquipmentSpecification", back_populates="equipment", cascade="all, delete-orphan")
    access_policy = relationship("EquipmentAccessPolicy", back_populates="equipment", uselist=False, cascade="all, delete-orphan")
    availability_rules = relationship("AvailabilityRule", back_populates="equipment", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="equipment", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceRecord", back_populates="equipment", cascade="all, delete-orphan")
    usage_records = relationship("EquipmentUsage", back_populates="equipment", cascade="all, delete-orphan")
    units = relationship("EquipmentUnit", back_populates="equipment", cascade="all, delete-orphan")


class EquipmentSpecification(Base):
    __tablename__ = "equipment_specifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(36), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    spec_name = Column(String(100), nullable=False)
    spec_value = Column(String(255), nullable=False)

    equipment = relationship("Equipment", back_populates="specifications")


class EquipmentAccessPolicy(Base):
    __tablename__ = "equipment_access_policies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(36), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    allowed_roles = Column(String(100), default="STUDENT,FACULTY,ADMIN", nullable=False)
    max_booking_hours = Column(Integer, default=4, nullable=False)
    requires_approval = Column(Boolean, default=False, nullable=False)
    auto_approve_eligible = Column(Boolean, default=True, nullable=False)

    equipment = relationship("Equipment", back_populates="access_policy")


class AvailabilityRule(Base):
    __tablename__ = "availability_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(36), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0 = Monday, 6 = Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)

    equipment = relationship("Equipment", back_populates="availability_rules")


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(36), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    reason = Column(String(255), nullable=False)
    status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.SCHEDULED, nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    equipment = relationship("Equipment", back_populates="maintenance_records")
    scheduled_by = relationship("User", foreign_keys=[scheduled_by_id])


class EquipmentUsage(Base):
    __tablename__ = "equipment_usage"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(36), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    checked_out_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    checked_out_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    returned_at = Column(DateTime(timezone=True), nullable=True)
    returned_to_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    condition_notes = Column(Text, nullable=True)

    equipment = relationship("Equipment", back_populates="usage_records")
    booking = relationship("Booking")
