import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum,
    Index,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class QREventType(str, enum.Enum):
    CHECK_IN = "CHECK_IN"
    CHECK_OUT = "CHECK_OUT"


class EquipmentUnit(Base):
    __tablename__ = "equipment_units"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(36), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    unit_serial = Column(String(100), unique=True, nullable=False, index=True)
    qr_code_token = Column(String(64), unique=True, nullable=False, index=True)
    is_functional = Column(Boolean, default=True, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    equipment = relationship("Equipment", back_populates="units")
    events = relationship("QRCheckEvent", back_populates="unit", cascade="all, delete-orphan")


class QRCheckEvent(Base):
    __tablename__ = "qr_check_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    equipment_unit_id = Column(String(36), ForeignKey("equipment_units.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(Enum(QREventType), nullable=False)
    condition_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    booking = relationship("Booking")
    unit = relationship("EquipmentUnit", back_populates="events")
    user = relationship("User")
