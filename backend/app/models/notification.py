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
    Index
)
from sqlalchemy.orm import relationship
from app.db.base import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class NotificationType(str, enum.Enum):
    BOOKING_SUBMITTED = "BOOKING_SUBMITTED"
    BOOKING_APPROVED = "BOOKING_APPROVED"
    BOOKING_REJECTED = "BOOKING_REJECTED"
    BOOKING_CANCELLED = "BOOKING_CANCELLED"
    ALTERNATIVE_RECOMMENDED = "ALTERNATIVE_RECOMMENDED"
    UPCOMING_REMINDER = "UPCOMING_REMINDER"
    MAINTENANCE_ALERT = "MAINTENANCE_ALERT"
    EQUIPMENT_CHECKOUT = "EQUIPMENT_CHECKOUT"
    EQUIPMENT_RETURN = "EQUIPMENT_RETURN"
    SYSTEM = "SYSTEM"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.SYSTEM, nullable=False, index=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    metadata_json = Column(Text, nullable=True)  # Store JSON data like booking_id, equipment_id
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    user = relationship("User", back_populates="notifications")
