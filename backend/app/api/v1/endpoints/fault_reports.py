"""Fault Reports API – submit, list, update status."""
from __future__ import annotations
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_faculty_or_admin
from app.models.fault_report import EquipmentFaultReport, FaultStatus
from app.models.user import User
from app.schemas.fault_report import FaultReportCreate, FaultReportOut, FaultReportUpdate

router = APIRouter(tags=["fault-reports"])


@router.post(
    "/equipment/{equipment_id}/fault-reports",
    response_model=FaultReportOut,
    status_code=status.HTTP_201_CREATED,
)
def submit_fault_report(
    equipment_id: str,
    body: FaultReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FaultReportOut:
    report = EquipmentFaultReport(
        equipment_id=equipment_id,
        reported_by_id=str(current_user.id),
        fault_description=body.fault_description,
        severity=body.severity,
        status=FaultStatus.OPEN,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return FaultReportOut.model_validate(report)


@router.get("/equipment/{equipment_id}/fault-reports", response_model=list[FaultReportOut])
def list_fault_reports(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[FaultReportOut]:
    reports = (
        db.query(EquipmentFaultReport)
        .filter(EquipmentFaultReport.equipment_id == equipment_id)
        .order_by(EquipmentFaultReport.created_at.desc())
        .all()
    )
    return [FaultReportOut.model_validate(r) for r in reports]


@router.patch(
    "/fault-reports/{report_id}",
    response_model=FaultReportOut,
    dependencies=[Depends(require_faculty_or_admin)],
)
def update_fault_report(
    report_id: str,
    body: FaultReportUpdate,
    db: Session = Depends(get_db),
) -> FaultReportOut:
    report = db.query(EquipmentFaultReport).filter(EquipmentFaultReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Fault report not found")
    if body.status is not None:
        report.status = body.status
        if body.status == FaultStatus.RESOLVED and not report.resolved_at:
            report.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(report)
    return FaultReportOut.model_validate(report)
