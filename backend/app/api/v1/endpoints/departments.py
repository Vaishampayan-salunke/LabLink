from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.department import Department, Laboratory
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentOut,
    LaboratoryCreate,
    LaboratoryUpdate,
    LaboratoryOut,
)
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter()


@router.get("", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    """List all academic departments with nested laboratories."""
    return db.query(Department).order_by(Department.name).all()


@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Create new academic department (Admin only)."""
    existing = db.query(Department).filter(
        (Department.name == dept_in.name) | (Department.code == dept_in.code)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department with this name or code already exists")

    dept = Department(
        name=dept_in.name,
        code=dept_in.code,
        description=dept_in.description
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("/laboratories", response_model=List[LaboratoryOut])
def list_laboratories(department_id: str = None, db: Session = Depends(get_db)):
    """List laboratories, optionally filtered by department."""
    q = db.query(Laboratory)
    if department_id:
        q = q.filter(Laboratory.department_id == department_id)
    return q.order_by(Laboratory.name).all()


@router.post("/laboratories", response_model=LaboratoryOut, status_code=status.HTTP_201_CREATED)
def create_laboratory(
    lab_in: LaboratoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Create new laboratory under a department (Admin only)."""
    dept = db.query(Department).filter(Department.id == lab_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    lab = Laboratory(
        department_id=lab_in.department_id,
        name=lab_in.name,
        room_number=lab_in.room_number,
        building=lab_in.building,
        operating_hours=lab_in.operating_hours,
        faculty_coordinator_id=lab_in.faculty_coordinator_id,
    )
    db.add(lab)
    db.commit()
    db.refresh(lab)
    return lab
