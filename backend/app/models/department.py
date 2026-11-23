import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from app.db.base import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    users = relationship("User", back_populates="department")
    laboratories = relationship("Laboratory", back_populates="department", cascade="all, delete-orphan")
    equipment = relationship("Equipment", back_populates="department")


class Laboratory(Base):
    __tablename__ = "laboratories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    room_number = Column(String(50), nullable=False)
    building = Column(String(100), nullable=False)
    operating_hours = Column(String(100), default="08:00 - 18:00", nullable=False)
    faculty_coordinator_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    department = relationship("Department", back_populates="laboratories")
    coordinator = relationship("User", foreign_keys=[faculty_coordinator_id])
    equipment = relationship("Equipment", back_populates="laboratory", cascade="all, delete-orphan")
