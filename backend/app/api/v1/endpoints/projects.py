"""Projects API – create, list, detail, update, member management."""
from __future__ import annotations
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.project import Project, ProjectMember, ProjectStatus
from app.models.user import User, UserRole
from app.schemas.project import ProjectCreate, ProjectMemberOut, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectOut:
    project = Project(
        title=body.title,
        description=body.description,
        domain=body.domain,
        deadline=body.deadline,
        status=ProjectStatus.ACTIVE,
        created_by_id=str(current_user.id),
    )
    db.add(project)
    db.flush()
    # Auto-add creator as lead member
    member = ProjectMember(project_id=project.id, user_id=str(current_user.id), role="Lead")
    db.add(member)
    # Add any additional members from body
    for uid in (body.team_members or []):
        if uid != str(current_user.id):
            m = ProjectMember(project_id=project.id, user_id=uid)
            db.add(m)
    db.commit()
    db.refresh(project)
    return ProjectOut.model_validate(project)


@router.get("", response_model=list[ProjectOut])
def list_my_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectOut]:
    if current_user.role == UserRole.ADMIN:
        projects = db.query(Project).order_by(Project.created_at.desc()).all()
    elif current_user.role == UserRole.FACULTY:
        projects = (
            db.query(Project)
            .order_by(Project.created_at.desc())
            .all()
        )
    else:
        memberships = (
            db.query(ProjectMember).filter(ProjectMember.user_id == str(current_user.id)).all()
        )
        project_ids = [m.project_id for m in memberships]
        projects = (
            db.query(Project)
            .filter(Project.id.in_(project_ids))
            .order_by(Project.created_at.desc())
            .all()
        )
    return [ProjectOut.model_validate(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectOut:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectOut.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    body: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectOut:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.created_by_id != str(current_user.id) and current_user.role not in (
        UserRole.FACULTY,
        UserRole.ADMIN,
    ):
        raise HTTPException(status_code=403, detail="Not authorised to update this project")
    for field, val in body.model_dump(exclude_unset=True).items():
        setattr(project, field, val)
    db.commit()
    db.refresh(project)
    return ProjectOut.model_validate(project)


@router.post("/{project_id}/members", response_model=ProjectMemberOut, status_code=201)
def add_member(
    project_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectMemberOut:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.created_by_id != str(current_user.id) and current_user.role not in (
        UserRole.FACULTY,
        UserRole.ADMIN,
    ):
        raise HTTPException(status_code=403, detail="Not authorised")
    existing = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="User already a member")
    member = ProjectMember(project_id=project_id, user_id=user_id)
    db.add(member)
    db.commit()
    db.refresh(member)
    return ProjectMemberOut.model_validate(member)
