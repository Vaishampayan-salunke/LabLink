"""QR check-in / check-out and equipment unit management."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.booking import Booking, BookingStatus
from app.models.equipment_unit import EquipmentUnit, QRCheckEvent, QREventType
from app.models.user import User
from app.schemas.qr import (
    EquipmentUnitOut,
    QRCheckEventOut,
    QRCheckInRequest,
    QRCheckOutRequest,
)

router = APIRouter(tags=["qr"])


@router.get("/equipment/{equipment_id}/units", response_model=list[EquipmentUnitOut])
def get_units(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[EquipmentUnitOut]:
    units = (
        db.query(EquipmentUnit)
        .filter(EquipmentUnit.equipment_id == equipment_id, EquipmentUnit.is_functional == True)
        .all()
    )
    return [EquipmentUnitOut.model_validate(u) for u in units]


@router.post("/qr/check-in", response_model=QRCheckEventOut, status_code=status.HTTP_201_CREATED)
def qr_check_in(
    body: QRCheckInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QRCheckEventOut:
    unit = db.query(EquipmentUnit).filter(EquipmentUnit.unit_serial == body.unit_serial).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Equipment unit not found")
    booking = db.query(Booking).filter(Booking.id == body.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if str(booking.student_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Booking does not belong to you")
    if booking.status != BookingStatus.CONFIRMED:
        raise HTTPException(status_code=400, detail="Booking is not in CONFIRMED state")
    # Check no duplicate check-in
    existing = (
        db.query(QRCheckEvent)
        .filter(
            QRCheckEvent.equipment_unit_id == unit.id,
            QRCheckEvent.booking_id == body.booking_id,
            QRCheckEvent.event_type == QREventType.CHECK_IN,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already checked in for this booking")
    event = QRCheckEvent(
        equipment_unit_id=unit.id,
        booking_id=body.booking_id,
        event_type=QREventType.CHECK_IN,
        user_id=str(current_user.id),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return QRCheckEventOut.model_validate(event)


@router.post("/qr/check-out", response_model=QRCheckEventOut, status_code=status.HTTP_201_CREATED)
def qr_check_out(
    body: QRCheckOutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QRCheckEventOut:
    unit = db.query(EquipmentUnit).filter(EquipmentUnit.unit_serial == body.unit_serial).first()
    if not unit:
        raise HTTPException(status_code=404, detail="Equipment unit not found")
    booking = db.query(Booking).filter(Booking.id == body.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if str(booking.student_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Booking does not belong to you")
    # Check already checked out
    existing = (
        db.query(QRCheckEvent)
        .filter(
            QRCheckEvent.equipment_unit_id == unit.id,
            QRCheckEvent.booking_id == body.booking_id,
            QRCheckEvent.event_type == QREventType.CHECK_OUT,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already checked out")
    event = QRCheckEvent(
        equipment_unit_id=unit.id,
        booking_id=body.booking_id,
        event_type=QREventType.CHECK_OUT,
        user_id=str(current_user.id),
        condition_notes=body.condition_notes,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return QRCheckEventOut.model_validate(event)
