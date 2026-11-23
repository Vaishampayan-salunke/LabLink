"""Waitlist API – join queue, view queue, cancel, accept offer."""
from __future__ import annotations
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_faculty_or_admin
from app.models.user import User
from app.models.waitlist import WaitlistEntry, WaitlistStatus
from app.schemas.waitlist import WaitlistEntryCreate, WaitlistEntryOut

router = APIRouter(prefix="/waitlist", tags=["waitlist"])


@router.post("", response_model=WaitlistEntryOut, status_code=status.HTTP_201_CREATED)
def join_waitlist(
    body: WaitlistEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WaitlistEntryOut:
    # Prevent duplicate entries
    existing = (
        db.query(WaitlistEntry)
        .filter(
            WaitlistEntry.equipment_id == body.equipment_id,
            WaitlistEntry.student_id == str(current_user.id),
            WaitlistEntry.status == WaitlistStatus.QUEUED,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Already on waitlist for this equipment")

    # Count existing queued entries to set priority_score
    existing_count = (
        db.query(func.count(WaitlistEntry.id))
        .filter(
            WaitlistEntry.equipment_id == body.equipment_id,
            WaitlistEntry.status == WaitlistStatus.QUEUED,
        )
        .scalar()
        or 0
    )

    entry = WaitlistEntry(
        equipment_id=body.equipment_id,
        student_id=str(current_user.id),
        priority_score=50.0 - existing_count,  # Lower score = higher priority
        preferred_start=datetime.now(timezone.utc),
        preferred_end=datetime.now(timezone.utc) + timedelta(hours=2),
        status=WaitlistStatus.QUEUED,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return WaitlistEntryOut.model_validate(entry)


@router.get("/my", response_model=list[WaitlistEntryOut])
def my_waitlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[WaitlistEntryOut]:
    entries = (
        db.query(WaitlistEntry)
        .filter(WaitlistEntry.student_id == str(current_user.id))
        .order_by(WaitlistEntry.created_at.desc())
        .all()
    )
    return [WaitlistEntryOut.model_validate(e) for e in entries]


@router.get("", response_model=list[WaitlistEntryOut], dependencies=[Depends(require_faculty_or_admin)])
def all_waitlist(
    equipment_id: str | None = None,
    db: Session = Depends(get_db),
) -> list[WaitlistEntryOut]:
    q = db.query(WaitlistEntry)
    if equipment_id:
        q = q.filter(WaitlistEntry.equipment_id == equipment_id)
    entries = q.order_by(WaitlistEntry.priority_score.desc()).all()
    return [WaitlistEntryOut.model_validate(e) for e in entries]


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_waitlist(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    entry = db.query(WaitlistEntry).filter(WaitlistEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    if entry.student_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your waitlist entry")
    entry.status = WaitlistStatus.CANCELLED
    db.commit()


@router.post("/{entry_id}/accept", response_model=WaitlistEntryOut)
def accept_offer(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WaitlistEntryOut:
    entry = db.query(WaitlistEntry).filter(WaitlistEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    if entry.student_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your waitlist entry")
    if entry.status != WaitlistStatus.OFFERED:
        raise HTTPException(status_code=400, detail="No pending offer to accept")
    if entry.expires_at and entry.expires_at < datetime.now(timezone.utc):
        entry.status = WaitlistStatus.EXPIRED
        db.commit()
        raise HTTPException(status_code=410, detail="Offer has expired")
    entry.status = WaitlistStatus.ACCEPTED
    db.commit()
    db.refresh(entry)
    return WaitlistEntryOut.model_validate(entry)
