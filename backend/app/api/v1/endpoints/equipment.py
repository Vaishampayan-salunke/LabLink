from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import or_

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.equipment import (
    Equipment,
    EquipmentStatus,
    EquipmentSpecification,
    EquipmentAccessPolicy,
    AvailabilityRule,
    MaintenanceRecord,
    MaintenanceStatus,
)
from app.models.department import Department, Laboratory
from app.schemas.equipment import (
    EquipmentCreate,
    EquipmentUpdate,
    EquipmentOut,
    MaintenanceCreate,
    MaintenanceOut,
)
from app.api.deps import get_current_user, get_current_active_faculty, get_current_active_admin
from app.services.scheduling_service import check_slot_conflict

router = APIRouter()


@router.get("", response_model=List[EquipmentOut])
def list_equipment(
    search: Optional[str] = None,
    department_id: Optional[str] = None,
    laboratory_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[EquipmentStatus] = None,
    is_restricted: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Search and filter equipment catalogue across departments and laboratories.
    Returns real PostgreSQL records with pagination.
    """
    if db.query(Equipment).count() == 0:
        try:
            from app.db.seed import seed_database
            seed_database()
        except Exception:
            pass

    query = db.query(Equipment).options(
        joinedload(Equipment.department),
        joinedload(Equipment.laboratory),
        selectinload(Equipment.specifications),
        joinedload(Equipment.access_policy),
    )

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Equipment.name.ilike(s),
                Equipment.description.ilike(s),
                Equipment.model_number.ilike(s),
                Equipment.category.ilike(s),
            )
        )

    if department_id:
        query = query.filter(Equipment.department_id == department_id)
    if laboratory_id:
        query = query.filter(Equipment.laboratory_id == laboratory_id)
    if category:
        query = query.filter(Equipment.category.ilike(f"%{category}%"))
    if status:
        query = query.filter(Equipment.status == status)
    if is_restricted is not None:
        query = query.filter(Equipment.is_restricted == is_restricted)

    offset = (page - 1) * page_size
    items = query.order_by(Equipment.name).offset(offset).limit(page_size).all()

    # Hydrate names for presentation
    result: List[EquipmentOut] = []
    for eq in items:
        out = EquipmentOut.model_validate(eq)
        out.department_name = eq.department.name if eq.department else None
        out.laboratory_name = eq.laboratory.name if eq.laboratory else None
        result.append(out)

    return result


@router.get("/{id}", response_model=EquipmentOut)
def get_equipment_detail(id: str, db: Session = Depends(get_db)):
    """Retrieve equipment by ID with complete specifications and access policies."""
    eq = (
        db.query(Equipment)
        .options(
            joinedload(Equipment.department),
            joinedload(Equipment.laboratory),
            selectinload(Equipment.specifications),
            joinedload(Equipment.access_policy),
        )
        .filter(Equipment.id == id)
        .first()
    )
    if not eq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment item not found"
        )
    out = EquipmentOut.model_validate(eq)
    out.department_name = eq.department.name if eq.department else None
    out.laboratory_name = eq.laboratory.name if eq.laboratory else None
    return out


@router.post("", response_model=EquipmentOut, status_code=status.HTTP_201_CREATED)
def create_equipment(
    eq_in: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_faculty),
):
    """Create new laboratory equipment. Enforces faculty or administrator permissions."""
    # Verify laboratory exists
    lab = db.query(Laboratory).filter(Laboratory.id == eq_in.laboratory_id).first()
    if not lab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified Laboratory not found"
        )

    # Faculty can only add to their department unless Admin
    if current_user.role == UserRole.FACULTY and current_user.department_id != eq_in.department_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty can only add equipment to their own department"
        )

    eq = Equipment(
        department_id=eq_in.department_id,
        laboratory_id=eq_in.laboratory_id,
        name=eq_in.name,
        category=eq_in.category,
        model_number=eq_in.model_number,
        serial_number=eq_in.serial_number,
        description=eq_in.description,
        image_url=eq_in.image_url,
        status=eq_in.status,
        is_restricted=eq_in.is_restricted,
        total_quantity=eq_in.total_quantity,
        available_quantity=eq_in.available_quantity,
    )
    db.add(eq)
    db.flush()

    # Add specs
    if eq_in.specifications:
        for s in eq_in.specifications:
            spec = EquipmentSpecification(
                equipment_id=eq.id,
                spec_name=s.spec_name,
                spec_value=s.spec_value
            )
            db.add(spec)

    # Add access policy
    policy_data = eq_in.access_policy
    if policy_data:
        pol = EquipmentAccessPolicy(
            equipment_id=eq.id,
            allowed_roles=policy_data.allowed_roles,
            max_booking_hours=policy_data.max_booking_hours,
            requires_approval=policy_data.requires_approval,
            auto_approve_eligible=policy_data.auto_approve_eligible
        )
        db.add(pol)
    else:
        # Default access policy
        pol = EquipmentAccessPolicy(
            equipment_id=eq.id,
            allowed_roles="STUDENT,FACULTY,ADMIN",
            max_booking_hours=4,
            requires_approval=eq_in.is_restricted,
            auto_approve_eligible=not eq_in.is_restricted
        )
        db.add(pol)

    db.commit()
    db.refresh(eq)

    out = EquipmentOut.model_validate(eq)
    out.department_name = eq.department.name if eq.department else None
    out.laboratory_name = eq.laboratory.name if eq.laboratory else None
    return out


@router.patch("/{id}", response_model=EquipmentOut)
def update_equipment(
    id: str,
    eq_in: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_faculty),
):
    """Update equipment details."""
    eq = db.query(Equipment).filter(Equipment.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")

    if current_user.role == UserRole.FACULTY and current_user.department_id != eq.department_id:
        raise HTTPException(status_code=403, detail="Unauthorized to edit another department's equipment")

    update_data = eq_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(eq, field, val)

    db.commit()
    db.refresh(eq)

    out = EquipmentOut.model_validate(eq)
    out.department_name = eq.department.name if eq.department else None
    out.laboratory_name = eq.laboratory.name if eq.laboratory else None
    return out


@router.delete("/{id}")
def delete_equipment(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Archive or remove equipment (Admin only)."""
    eq = db.query(Equipment).filter(Equipment.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")

    db.delete(eq)
    db.commit()
    return {"message": "Equipment successfully removed"}


@router.get("/{id}/availability")
def get_equipment_availability(
    id: str,
    start_time: datetime,
    end_time: datetime,
    db: Session = Depends(get_db),
):
    """Check slot availability and conflict report for specific equipment."""
    conflict = check_slot_conflict(db, id, start_time, end_time)
    return conflict


@router.post("/{id}/maintenance", response_model=MaintenanceOut)
def schedule_maintenance(
    id: str,
    maint_in: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_faculty),
):
    """Schedule equipment maintenance window."""
    eq = db.query(Equipment).filter(Equipment.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipment not found")

    rec = MaintenanceRecord(
        equipment_id=id,
        scheduled_by_id=current_user.id,
        start_time=maint_in.start_time,
        end_time=maint_in.end_time,
        reason=maint_in.reason,
        status=MaintenanceStatus.SCHEDULED,
        notes=maint_in.notes
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    out = MaintenanceOut.model_validate(rec)
    out.equipment_name = eq.name
    return out


@router.get("/{id}/maintenance", response_model=List[MaintenanceOut])
def get_maintenance_history(id: str, db: Session = Depends(get_db)):
    """Retrieve maintenance history for equipment."""
    records = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.equipment_id == id
    ).order_by(MaintenanceRecord.start_time.desc()).all()

    eq = db.query(Equipment).filter(Equipment.id == id).first()
    eq_name = eq.name if eq else None

    result: List[MaintenanceOut] = []
    for r in records:
        out = MaintenanceOut.model_validate(r)
        out.equipment_name = eq_name
        result.append(out)
    return result
