from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.session import get_db
from app.models.user import User, UserRole, AuditLog
from app.models.booking import Booking
from app.schemas.user import UserOut, UserUpdate
from app.schemas.booking import BookingOut
from app.api.deps import get_current_active_admin

router = APIRouter()


@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[UserRole] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Admin endpoint to list all campus users."""
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    offset = (page - 1) * page_size
    return q.order_by(User.full_name).offset(offset).limit(page_size).all()


@router.patch("/users/{id}", response_model=UserOut)
def update_user_status(
    id: str,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Admin endpoint to activate/deactivate user accounts or assign department."""
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.department_id is not None:
        user.department_id = user_in.department_id
    if user_in.is_active is not None:
        user.is_active = user_in.is_active

    db.commit()
    db.refresh(user)
    return user


@router.get("/bookings", response_model=List[BookingOut])
def list_all_bookings(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Admin endpoint to view all institution-wide bookings."""
    offset = (page - 1) * page_size
    bookings = db.query(Booking).order_by(desc(Booking.created_at)).offset(offset).limit(page_size).all()

    result: List[BookingOut] = []
    for b in bookings:
        out = BookingOut.model_validate(b)
        out.equipment_name = b.equipment.name if b.equipment else None
        out.equipment_category = b.equipment.category if b.equipment else None
        out.student_name = b.student.full_name if b.student else None
        out.student_email = b.student.email if b.student else None
        out.department_name = b.equipment.department.name if b.equipment and b.equipment.department else None
        out.laboratory_name = b.equipment.laboratory.name if b.equipment and b.equipment.laboratory else None
        out.project_title = b.project_request.title if b.project_request else None
        result.append(out)
    return result


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Admin endpoint to review security audit logs."""
    logs = db.query(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]
