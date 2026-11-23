from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.equipment import Equipment, EquipmentStatus, EquipmentAccessPolicy
from app.models.booking import Booking, BookingStatus, ProjectRequest
from app.models.notification import NotificationType
from app.schemas.booking import (
    BookingCreate,
    BookingOut,
    ConflictCheckRequest,
    ConflictCheckResponse,
    AlternativeSlot,
    SchedulingRecommendationResponse,
)
from app.api.deps import get_current_user, get_current_active_student
from app.services.scheduling_service import check_slot_conflict, find_alternative_slots
from app.services.notification_service import create_notification

router = APIRouter()


@router.post("", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    """
    Create a project-based equipment booking.
    Executes inside database transaction with concurrency checking.
    If equipment is restricted or requires approval -> PENDING.
    If equipment is unrestricted and eligible -> CONFIRMED.
    """
    if booking_in.end_time <= booking_in.start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be strictly after start time"
        )

    # 1. Fetch equipment with access policy
    equipment = db.query(Equipment).filter(Equipment.id == booking_in.equipment_id).first()
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Selected equipment does not exist"
        )

    if equipment.status != EquipmentStatus.AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Equipment is currently unavailable (Status: {equipment.status.value})"
        )

    # 2. Check access policy & duration
    policy = db.query(EquipmentAccessPolicy).filter(EquipmentAccessPolicy.equipment_id == equipment.id).first()
    duration_hours = (booking_in.end_time - booking_in.start_time).total_seconds() / 3600.0

    if policy and duration_hours > policy.max_booking_hours:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Booking exceeds maximum allowed duration of {policy.max_booking_hours} hours for this equipment."
        )

    # 3. Conflict detection check
    conflict_report = check_slot_conflict(
        db, equipment.id, booking_in.start_time, booking_in.end_time
    )
    if conflict_report.has_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Slot conflict: {conflict_report.reason}"
        )

    # 4. Status determination:
    # If equipment is restricted or a project allocation is attached, require Faculty Approval (PENDING).
    # Standard unrestricted equipment auto-confirms (CONFIRMED) for immediate lab utilization.
    if equipment.is_restricted or booking_in.project_title or booking_in.project_id:
        assigned_status = BookingStatus.PENDING
    else:
        assigned_status = BookingStatus.CONFIRMED

    # 5. Create or link project request if provided
    project_req_id = None
    if booking_in.project_title:
        project_req = ProjectRequest(
            student_id=current_user.id,
            title=booking_in.project_title,
            description=booking_in.project_description or booking_in.purpose,
            deadline=booking_in.project_deadline
        )
        db.add(project_req)
        db.flush()
        project_req_id = project_req.id

    booking = Booking(
        equipment_id=equipment.id,
        student_id=current_user.id,
        project_request_id=project_req_id,
        start_time=booking_in.start_time,
        end_time=booking_in.end_time,
        status=assigned_status,
        purpose=booking_in.purpose
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # 6. Send in-app notification to student
    create_notification(
        db=db,
        user_id=current_user.id,
        title="Access Request Submitted",
        message=f"Your booking request for {equipment.name} from {booking.start_time.strftime('%Y-%m-%d %H:%M')} has been submitted and is awaiting faculty review.",
        notification_type=NotificationType.BOOKING_SUBMITTED,
        metadata={"booking_id": booking.id, "equipment_id": equipment.id}
    )

    # 7. Notify faculty coordinators in the equipment's department
    faculty_users = db.query(User).filter(
        User.role == UserRole.FACULTY,
        User.department_id == equipment.department_id
    ).all()
    for fac in faculty_users:
        create_notification(
            db=db,
            user_id=fac.id,
            title="New Pending Equipment Approval",
            message=f"Student {current_user.full_name} submitted an access request for {equipment.name} ({booking.start_time.strftime('%Y-%m-%d %H:%M')}).",
            notification_type=NotificationType.BOOKING_SUBMITTED,
            metadata={"booking_id": booking.id, "equipment_id": equipment.id, "student_id": current_user.id}
        )
    if equipment.laboratory and equipment.laboratory.faculty_coordinator_id:
        if equipment.laboratory.faculty_coordinator_id not in [f.id for f in faculty_users]:
            create_notification(
                db=db,
                user_id=equipment.laboratory.faculty_coordinator_id,
                title="New Pending Equipment Approval",
                message=f"Student {current_user.full_name} submitted a project booking request for {equipment.name}.",
                notification_type=NotificationType.BOOKING_SUBMITTED,
                metadata={"booking_id": booking.id, "equipment_id": equipment.id, "student_id": current_user.id}
            )

    out = BookingOut.model_validate(booking)
    out.equipment_name = equipment.name
    out.equipment_category = equipment.category
    out.student_name = current_user.full_name
    out.student_email = current_user.email
    out.department_name = equipment.department.name if equipment.department else None
    out.laboratory_name = equipment.laboratory.name if equipment.laboratory else None
    out.project_title = booking_in.project_title
    return out


@router.get("/my", response_model=List[BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all bookings created by the current user."""
    bookings = (
        db.query(Booking)
        .options(
            joinedload(Booking.equipment).joinedload(Equipment.department),
            joinedload(Booking.equipment).joinedload(Equipment.laboratory),
            joinedload(Booking.project_request),
        )
        .filter(Booking.student_id == current_user.id)
        .order_by(desc(Booking.created_at))
        .all()
    )

    result: List[BookingOut] = []
    for b in bookings:
        out = BookingOut.model_validate(b)
        out.equipment_name = b.equipment.name if b.equipment else None
        out.equipment_category = b.equipment.category if b.equipment else None
        out.student_name = current_user.full_name
        out.student_email = current_user.email
        out.department_name = b.equipment.department.name if b.equipment and b.equipment.department else None
        out.laboratory_name = b.equipment.laboratory.name if b.equipment and b.equipment.laboratory else None
        out.project_title = b.project_request.title if b.project_request else None
        result.append(out)
    return result


@router.get("/recommendations", response_model=SchedulingRecommendationResponse)
def get_scheduling_recommendations(
    equipment_id: str,
    start_time: datetime,
    end_time: datetime,
    deadline: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Deterministic scheduling & alternative slot recommendations.
    Checks requested slot and returns scored alternative slots if occupied or for optimization.
    """
    conflict = check_slot_conflict(db, equipment_id, start_time, end_time)
    alternatives = find_alternative_slots(
        db, equipment_id, start_time, end_time, current_user.id, deadline
    )

    recommended = alternatives[0] if alternatives else None

    return SchedulingRecommendationResponse(
        is_requested_slot_available=not conflict.has_conflict,
        recommended_slot=recommended,
        alternative_slots=alternatives,
        conflict_reason=conflict.reason if conflict.has_conflict else None
    )


@router.get("/{id}", response_model=BookingOut)
def get_booking_detail(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details for a specific booking."""
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Access control
    if current_user.role == UserRole.STUDENT and booking.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this booking")

    out = BookingOut.model_validate(booking)
    out.equipment_name = booking.equipment.name if booking.equipment else None
    out.equipment_category = booking.equipment.category if booking.equipment else None
    out.student_name = booking.student.full_name if booking.student else None
    out.student_email = booking.student.email if booking.student else None
    out.department_name = booking.equipment.department.name if booking.equipment and booking.equipment.department else None
    out.laboratory_name = booking.equipment.laboratory.name if booking.equipment and booking.equipment.laboratory else None
    out.project_title = booking.project_request.title if booking.project_request else None
    return out


@router.post("/{id}/cancel", response_model=BookingOut)
def cancel_booking(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel an active or pending booking."""
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == UserRole.STUDENT and booking.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to cancel this booking")

    if booking.status in [BookingStatus.CANCELLED, BookingStatus.REJECTED, BookingStatus.COMPLETED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel booking with status {booking.status.value}"
        )

    booking.status = BookingStatus.CANCELLED
    db.commit()
    db.refresh(booking)

    # In-app notification
    create_notification(
        db=db,
        user_id=booking.student_id,
        title="Booking Cancelled",
        message=f"Booking for {booking.equipment.name} scheduled for {booking.start_time.strftime('%Y-%m-%d %H:%M')} has been cancelled.",
        notification_type=NotificationType.BOOKING_CANCELLED,
        metadata={"booking_id": booking.id}
    )

    out = BookingOut.model_validate(booking)
    out.equipment_name = booking.equipment.name if booking.equipment else None
    out.student_name = booking.student.full_name if booking.student else None
    return out
