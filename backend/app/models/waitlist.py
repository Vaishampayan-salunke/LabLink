import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import (
    Column,
    String,
    Float,
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


class WaitlistStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    OFFERED = "OFFERED"
    ACCEPTED = "ACCEPTED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(36), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    preferred_start = Column(DateTime(timezone=True), nullable=False)
    preferred_end = Column(DateTime(timezone=True), nullable=False)
    priority_score = Column(Float, default=50.0, nullable=False)
    status = Column(Enum(WaitlistStatus), default=WaitlistStatus.QUEUED, nullable=False, index=True)
    offered_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    equipment = relationship("Equipment")
    student = relationship("User")
