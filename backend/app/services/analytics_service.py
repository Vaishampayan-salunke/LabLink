from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc

from app.models.user import User, UserRole
from app.models.department import Department, Laboratory
from app.models.equipment import Equipment, EquipmentStatus, MaintenanceRecord, MaintenanceStatus
from app.models.booking import Booking, BookingStatus, BookingApproval, ApprovalDecision
from app.schemas.analytics import (
    StudentAnalytics,
    FacultyAnalytics,
    AdminAnalytics,
    UtilizationStat,
    MostRequestedItem,
    BookingTrendItem,
)


def get_student_analytics(db: Session, student_id: str) -> StudentAnalytics:
    now = datetime.now(timezone.utc)
    total_bookings = db.query(Booking).filter(Booking.student_id == student_id).count()
    
    upcoming_bookings = db.query(Booking).filter(
        Booking.student_id == student_id,
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_OUT]),
        Booking.end_time >= now
    ).count()

    pending_approvals = db.query(Booking).filter(
        Booking.student_id == student_id,
        Booking.status == BookingStatus.PENDING
    ).count()

    completed_bookings = db.query(Booking).filter(
        Booking.student_id == student_id,
        Booking.status.in_([BookingStatus.COMPLETED, BookingStatus.RETURNED])
    ).count()

    recent = db.query(Booking).filter(
        Booking.student_id == student_id
    ).order_by(desc(Booking.created_at)).limit(5).all()

    recent_activity = [
        {
            "id": b.id,
            "equipment_name": b.equipment.name if b.equipment else "Unknown",
            "start_time": b.start_time.isoformat(),
            "end_time": b.end_time.isoformat(),
            "status": b.status.value,
            "purpose": b.purpose
        }
        for b in recent
    ]

    return StudentAnalytics(
        total_bookings=total_bookings,
        upcoming_bookings=upcoming_bookings,
        pending_approvals=pending_approvals,
        completed_bookings=completed_bookings,
        recent_activity=recent_activity
    )


def get_faculty_analytics(db: Session, faculty: User) -> FacultyAnalytics:
    # Get department equipment IDs
    dept_id = faculty.department_id
    equipment_query = db.query(Equipment)
    if dept_id:
        equipment_query = equipment_query.filter(Equipment.department_id == dept_id)
    
    equipment_list = equipment_query.all()
    eq_ids = [e.id for e in equipment_list]
    dept_equipment_count = len(eq_ids)

    # Pending approvals for this department's equipment
    pending_approvals_count = 0
    active_bookings_count = 0
    maintenance_count = 0
    most_requested = []

    if eq_ids:
        pending_approvals_count = db.query(Booking).filter(
            Booking.equipment_id.in_(eq_ids),
            Booking.status == BookingStatus.PENDING
        ).count()

        active_bookings_count = db.query(Booking).filter(
            Booking.equipment_id.in_(eq_ids),
            Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_OUT])
        ).count()

        maintenance_count = db.query(MaintenanceRecord).filter(
            MaintenanceRecord.equipment_id.in_(eq_ids),
            MaintenanceRecord.status.in_([MaintenanceStatus.SCHEDULED, MaintenanceStatus.IN_PROGRESS])
        ).count()

        # Most requested equipment
        req_counts = db.query(
            Booking.equipment_id,
            func.count(Booking.id).label("cnt")
        ).filter(
            Booking.equipment_id.in_(eq_ids)
        ).group_by(Booking.equipment_id).order_by(desc("cnt")).limit(5).all()

        for eq_id, cnt in req_counts:
            eq = db.query(Equipment).filter(Equipment.id == eq_id).first()
            if eq:
                most_requested.append(
                    MostRequestedItem(
                        equipment_id=eq.id,
                        equipment_name=eq.name,
                        category=eq.category,
                        department_name=eq.department.name if eq.department else "General",
                        booking_count=cnt
                    )
                )

    utilization_rate = 0.0
    if dept_equipment_count > 0:
        utilization_rate = min(100.0, round((active_bookings_count / dept_equipment_count) * 100, 1))

    return FacultyAnalytics(
        pending_approvals_count=pending_approvals_count,
        department_equipment_count=dept_equipment_count,
        active_bookings_count=active_bookings_count,
        utilization_rate=utilization_rate,
        maintenance_count=maintenance_count,
        most_requested=most_requested
    )


def get_admin_analytics(db: Session) -> AdminAnalytics:
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_faculty = db.query(User).filter(User.role == UserRole.FACULTY).count()
    total_departments = db.query(Department).count()
    total_laboratories = db.query(Laboratory).count()
    total_equipment = db.query(Equipment).count()
    total_bookings = db.query(Booking).count()

    active_bookings = db.query(Booking).filter(
        Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_OUT])
    ).count()

    overall_utilization = 0.0
    if total_equipment > 0:
        overall_utilization = min(100.0, round((active_bookings / total_equipment) * 100, 1))

    # Approval rate
    total_decided = db.query(BookingApproval).count()
    approved_count = db.query(BookingApproval).filter(BookingApproval.decision == ApprovalDecision.APPROVED).count()
    approval_rate = round((approved_count / total_decided * 100), 1) if total_decided > 0 else 100.0

    # Department-wise utilization
    dept_stats: List[UtilizationStat] = []
    departments = db.query(Department).all()
    for d in departments:
        eq_count = db.query(Equipment).filter(Equipment.department_id == d.id).count()
        d_eq_ids = [e.id for e in db.query(Equipment.id).filter(Equipment.department_id == d.id).all()]
        b_count = 0
        if d_eq_ids:
            b_count = db.query(Booking).filter(
                Booking.equipment_id.in_(d_eq_ids),
                Booking.status.in_([BookingStatus.CONFIRMED, BookingStatus.CHECKED_OUT])
            ).count()
        rate = round((b_count / eq_count * 100), 1) if eq_count > 0 else 0.0
        dept_stats.append(
            UtilizationStat(
                category_or_dept=d.name,
                total_equipment=eq_count,
                booked_count=b_count,
                utilization_rate=rate
            )
        )

    # Most requested equipment institution-wide
    req_counts = db.query(
        Booking.equipment_id,
        func.count(Booking.id).label("cnt")
    ).group_by(Booking.equipment_id).order_by(desc("cnt")).limit(5).all()

    most_requested: List[MostRequestedItem] = []
    for eq_id, cnt in req_counts:
        eq = db.query(Equipment).filter(Equipment.id == eq_id).first()
        if eq:
            most_requested.append(
                MostRequestedItem(
                    equipment_id=eq.id,
                    equipment_name=eq.name,
                    category=eq.category,
                    department_name=eq.department.name if eq.department else "General",
                    booking_count=cnt
                )
            )

    # Booking trends (past 7 days)
    trends: List[BookingTrendItem] = []
    today = datetime.now(timezone.utc).date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        cnt = db.query(Booking).filter(
            Booking.created_at >= day_start,
            Booking.created_at < day_end
        ).count()
        trends.append(BookingTrendItem(date=day.strftime("%b %d"), count=cnt))

    return AdminAnalytics(
        total_users=total_users,
        total_students=total_students,
        total_faculty=total_faculty,
        total_departments=total_departments,
        total_laboratories=total_laboratories,
        total_equipment=total_equipment,
        total_bookings=total_bookings,
        overall_utilization_rate=overall_utilization,
        approval_rate=approval_rate,
        department_utilization=dept_stats,
        most_requested_equipment=most_requested,
        booking_trends=trends
    )
