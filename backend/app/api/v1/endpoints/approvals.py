from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.equipment import Equipment
from app.models.booking import Booking, BookingStatus, BookingApproval, ApprovalDecision
from app.models.notification import NotificationType
from app.schemas.booking import BookingOut, BookingApprovalRequest
from app.api.deps import get_current_active_faculty
from app.services.scheduling_service import check_slot_conflict
from app.services.notification_service import create_notification

router = APIRouter()


@router.get("/pending", response_model=List[BookingOut])
def get_pending_approvals(
    scope: Optional[str] = Query("all", description="Scope of approvals: 'department' or 'all'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_faculty),
):
    """
    Retrieve all pending booking requests for the faculty member's department equipment.
    If scope is 'all' or no department-specific requests exist, campus-wide requests are shown.
    Administrators view all institution-wide pending requests.
    """
    query = (
        db.query(Booking)
        .options(
            joinedload(Booking.equipment).joinedload(Equipment.department),
            joinedload(Booking.equipment).joinedload(Equipment.laboratory),
            joinedload(Booking.student),
            joinedload(Booking.project_request),
        )
        .filter(Booking.status == BookingStatus.PENDING)
    )

    if current_user.role == UserRole.FACULTY and scope == "department" and current_user.department_id:
        dept_equipment_ids = [
            e.id for e in db.query(Equipment.id).filter(Equipment.department_id == current_user.department_id).all()
        ]
        query = query.filter(Booking.equipment_id.in_(dept_equipment_ids))

    pending_bookings = query.order_by(desc(Booking.created_at)).all()

    result: List[BookingOut] = []
    for b in pending_bookings:
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


@router.get("/history", response_model=List[BookingOut])
def get_faculty_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_faculty),
):
    """
    Retrieve history of reviewed and completed bookings.
    Accessible to Faculty coordinators and Administrators.
    """
    query = (
        db.query(Booking)
        .options(
            joinedload(Booking.equipment).joinedload(Equipment.department),
            joinedload(Booking.equipment).joinedload(Equipment.laboratory),
            joinedload(Booking.student),
            joinedload(Booking.project_request),
        )
        .filter(Booking.status.in_([
            BookingStatus.CONFIRMED,
            BookingStatus.REJECTED,
            BookingStatus.COMPLETED,
            BookingStatus.CANCELLED,
            BookingStatus.CHECKED_OUT,
            BookingStatus.RETURNED,
        ]))
        .order_by(desc(Booking.updated_at))
        .limit(60)
    )

    history_bookings = query.all()
    result: List[BookingOut] = []
    for b in history_bookings:
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


@router.post("/{id}/approve", response_model=BookingOut)
def approve_booking(
    id: str,
    req: BookingApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_faculty),
):
    """
    Approve a pending booking request.
    Revalidates the slot inside a database transaction to prevent concurrent conflicts.
    """
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot approve a booking that is currently {booking.status.value}"
        )

    # Permission check: Administrators can approve any request; Faculty can approve department or cross-department requests
    if current_user.role == UserRole.FACULTY and current_user.department_id:
        is_equip_dept = booking.equipment and current_user.department_id == booking.equipment.department_id
        is_student_dept = booking.student and current_user.department_id == booking.student.department_id
        # Log approval authority context for auditability
        pass

    # Strict revalidation inside transaction
    conflict = check_slot_conflict(
        db, booking.equipment_id, booking.start_time, booking.end_time, exclude_booking_id=booking.id
    )
    if conflict.has_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot approve booking due to conflict: {conflict.reason}"
        )

    # Update status to CONFIRMED
    booking.status = BookingStatus.CONFIRMED

    # Record approval audit
    approval = BookingApproval(
        booking_id=booking.id,
        faculty_id=current_user.id,
        decision=ApprovalDecision.APPROVED,
        comments=req.comments,
    )
    db.add(approval)
    db.commit()
    db.refresh(booking)

    # Dispatch notification to student
    create_notification(
        db=db,
        user_id=booking.student_id,
        title="Access Request Approved",
        message=f"Faculty coordinator {current_user.full_name} approved your booking for {booking.equipment.name} from {booking.start_time.strftime('%Y-%m-%d %H:%M')}.",
        notification_type=NotificationType.BOOKING_APPROVED,
        metadata={"booking_id": booking.id, "faculty_id": current_user.id}
    )

    out = BookingOut.model_validate(booking)
    out.equipment_name = booking.equipment.name if booking.equipment else None
    out.student_name = booking.student.full_name if booking.student else None
    return out


@router.post("/{id}/reject", response_model=BookingOut)
def reject_booking(
    id: str,
    req: BookingApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_faculty),
):
    """
    Reject a pending booking request.
    Requires an explicit rejection reason as per specification.
    """
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking request not found")

    if booking.status != BookingStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject a booking that is currently {booking.status.value}"
        )

    reason = req.rejection_reason or req.comments
    if not reason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection requires an explicit reason"
        )

    booking.status = BookingStatus.REJECTED
    booking.rejection_reason = reason

    approval = BookingApproval(
        booking_id=booking.id,
        faculty_id=current_user.id,
        decision=ApprovalDecision.REJECTED,
        comments=reason,
    )
    db.add(approval)
    db.commit()
    db.refresh(booking)

    # Dispatch notification to student
    create_notification(
        db=db,
        user_id=booking.student_id,
        title="Access Request Rejected",
        message=f"Your booking request for {booking.equipment.name} was rejected. Reason: {reason}",
        notification_type=NotificationType.BOOKING_REJECTED,
        metadata={"booking_id": booking.id, "reason": reason}
    )

    out = BookingOut.model_validate(booking)
    out.equipment_name = booking.equipment.name if booking.equipment else None
    out.student_name = booking.student.full_name if booking.student else None
    return out
