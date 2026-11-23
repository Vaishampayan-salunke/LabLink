from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.project import ProjectStatus


class ProjectMemberBase(BaseModel):
    user_id: str
    role: str = "Contributor"


class ProjectMemberCreate(ProjectMemberBase):
    pass


class ProjectMemberOut(ProjectMemberBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: str
    joined_at: datetime
    user_name: Optional[str] = None
    user_email: Optional[str] = None


class ProjectBase(BaseModel):
    title: str
    description: str
    domain: str = "IoT & Embedded Systems"
    deadline: Optional[datetime] = None
    status: ProjectStatus = ProjectStatus.ACTIVE


class ProjectCreate(ProjectBase):
    team_members: Optional[List[str]] = []  # User IDs


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[ProjectStatus] = None


class ProjectOut(ProjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_by_id: str
    created_at: datetime
    updated_at: datetime
    creator_name: Optional[str] = None
    members: List[ProjectMemberOut] = []
