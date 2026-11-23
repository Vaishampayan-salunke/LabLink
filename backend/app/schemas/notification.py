from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel
from app.models.notification import NotificationType


class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    type: NotificationType = NotificationType.SYSTEM
    metadata_json: Optional[str] = None


class NotificationOut(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: NotificationType
    is_read: bool
    metadata_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationUpdate(BaseModel):
    is_read: bool
