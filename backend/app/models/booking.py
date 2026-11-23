import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import (
    Column,
    String,
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


class BookingStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    CHECKED_OUT = "CHECKED_OUT"
    RETURNED = "RETURNED"
    COMPLETED = "COMPLETED"


class ApprovalDecision(str, enum.Enum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"


class ProjectRequest(Base):
    __tablename__ = "project_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    student = relationship("User", back_populates="project_requests")
    bookings = relationship("Booking", back_populates="project_request")
    ai_recommendations = relationship("AIRecommendation", back_populates="project_request", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    equipment_id = Column(String(36), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_request_id = Column(String(36), ForeignKey("project_requests.id", ondelete="SET NULL"), nullable=True, index=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING, nullable=False, index=True)
    purpose = Column(Text, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    equipment = relationship("Equipment", back_populates="bookings")
    student = relationship("User", back_populates="bookings", foreign_keys=[student_id])
    project_request = relationship("ProjectRequest", back_populates="bookings")
    project = relationship("Project", back_populates="bookings")
    approvals = relationship("BookingApproval", back_populates="booking", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_bookings_equipment_timerange", "equipment_id", "start_time", "end_time"),
    )


class BookingApproval(Base):
    __tablename__ = "booking_approvals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    faculty_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    decision = Column(Enum(ApprovalDecision), nullable=False)
    comments = Column(Text, nullable=True)
    decided_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    booking = relationship("Booking", back_populates="approvals")
    faculty = relationship("User")
