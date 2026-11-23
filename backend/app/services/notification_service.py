import json
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.core.config import settings

logger = logging.getLogger(__name__)


def create_notification(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    notification_type: NotificationType,
    metadata: Optional[Dict[str, Any]] = None,
) -> Notification:
    """Create persistent in-app notification and optionally trigger email."""
    metadata_json = json.dumps(metadata) if metadata else None
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        metadata_json=metadata_json,
        is_read=False,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # Attempt email notification if SMTP is configured
    try_send_email_notification(db, user_id, title, message)
    return notification


def try_send_email_notification(db: Session, user_id: str, subject: str, body: str) -> bool:
    if not settings.SMTP_ENABLED or not settings.SMTP_HOST or not settings.SMTP_USER:
        return False
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.email:
        return False
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = user.email
        msg["Subject"] = f"LabLink Notification: {subject}"
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=5)
        if settings.SMTP_TLS:
            server.starttls()
        if settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        logger.info(f"Email notification dispatched to {user.email}")
        return True
    except Exception as e:
        logger.warning(f"Failed to dispatch email to {user.email}: {e}")
        return False
