import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
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


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_request_id = Column(String(36), ForeignKey("project_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    raw_prompt = Column(Text, nullable=False)
    extracted_requirements = Column(Text, nullable=False)  # JSON formatted extracted specs
    matched_equipment_json = Column(Text, nullable=False)  # JSON formatted list of actual equipment IDs
    scheduling_score = Column(Float, nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    project_request = relationship("ProjectRequest", back_populates="ai_recommendations")
