from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import csv

from app.db.session import get_db
from app.models.user import User
from app.models.booking import Booking
from app.models.equipment import Equipment
from app.api.deps import (
    get_current_user,
    get_current_active_student,
    get_current_active_faculty,
    get_current_active_admin,
)
from app.schemas.analytics import StudentAnalytics, FacultyAnalytics, AdminAnalytics
from app.services.analytics_service import (
    get_student_analytics,
    get_faculty_analytics,
    get_admin_analytics,
)

router = APIRouter()


@router.get("/student", response_model=StudentAnalytics)
def student_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    """Retrieve real aggregate metrics for the student dashboard."""
    return get_student_analytics(db, current_user.id)


@router.get("/faculty", response_model=FacultyAnalytics)
def faculty_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_faculty),
):
    """Retrieve department equipment utilisation and approval workload."""
    return get_faculty_analytics(db, current_user)


@router.get("/admin", response_model=AdminAnalytics)
def admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Retrieve institution-wide aggregates, utilisation, and booking trends."""
    return get_admin_analytics(db)


@router.get("/export/csv", dependencies=[Depends(get_current_active_admin)])
def export_bookings_csv(db: Session = Depends(get_db)):
    """Export all booking records as a downloadable CSV file."""
    import io
    import csv
    from fastapi.responses import StreamingResponse
    from app.models.booking import Booking
    from app.models.equipment import Equipment

    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "booking_id", "student_id", "equipment_id", "equipment_name",
        "status", "start_time", "end_time", "purpose", "created_at",
    ])
    writer.writeheader()
    for b in bookings:
        eq = db.query(Equipment).filter(Equipment.id == b.equipment_id).first()
        writer.writerow({
            "booking_id": b.id,
            "student_id": b.student_id,
            "equipment_id": b.equipment_id,
            "equipment_name": eq.name if eq else "Unknown",
            "status": b.status.value,
            "start_time": b.start_time.isoformat() if b.start_time else "",
            "end_time": b.end_time.isoformat() if b.end_time else "",
            "purpose": b.purpose or "",
            "created_at": b.created_at.isoformat() if b.created_at else "",
        })

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=lablink_bookings.csv"},
    )
