import os
import pytest
from datetime import datetime, timezone, timedelta, time
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///./test_lablink.db"
os.environ["ENVIRONMENT"] = "development"
os.environ["TESTING"] = "1"

from app.core.config import settings
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.core.security import get_password_hash, create_access_token
from app.models.user import User, UserRole
from app.models.department import Department, Laboratory
from app.models.equipment import (
    Equipment,
    EquipmentStatus,
    EquipmentSpecification,
    EquipmentAccessPolicy,
    AvailabilityRule,
)
from app.models.booking import Booking, BookingStatus, ProjectRequest

TEST_DATABASE_URL = "sqlite:///./test_lablink.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # Seed baseline fixtures
    dept = Department(name="Electrical & Computing Test Dept", code="TEST-ECE", description="Testing department")
    db.add(dept)
    db.flush()

    admin = User(
        email="test.admin@lablink.edu",
        hashed_password=get_password_hash("TestAdminPass123!"),
        full_name="Test Administrator",
        role=UserRole.ADMIN,
        is_active=True,
    )
    faculty = User(
        email="test.faculty@lablink.edu",
        hashed_password=get_password_hash("TestFacultyPass123!"),
        full_name="Prof. Test Faculty",
        role=UserRole.FACULTY,
        department_id=dept.id,
        is_active=True,
    )
    student = User(
        email="test.student@lablink.edu",
        hashed_password=get_password_hash("TestStudentPass123!"),
        full_name="Test Student",
        role=UserRole.STUDENT,
        department_id=dept.id,
        is_active=True,
    )
    db.add_all([admin, faculty, student])
    db.flush()

    lab = Laboratory(
        department_id=dept.id,
        name="Test Instrumentation Lab",
        room_number="TL-101",
        building="Test Hall",
        faculty_coordinator_id=faculty.id,
    )
    db.add(lab)
    db.flush()

    # Unrestricted equipment (eligible for instant auto-approval)
    eq_unrestricted = Equipment(
        department_id=dept.id,
        laboratory_id=lab.id,
        name="Test ESP32 Kit",
        category="Embedded Systems",
        status=EquipmentStatus.AVAILABLE,
        is_restricted=False,
        total_quantity=1,
        available_quantity=1,
    )
    # Restricted equipment (requires faculty approval)
    eq_restricted = Equipment(
        department_id=dept.id,
        laboratory_id=lab.id,
        name="Test FPGA Board",
        category="FPGA & Reconfigurable Logic",
        status=EquipmentStatus.AVAILABLE,
        is_restricted=True,
        total_quantity=1,
        available_quantity=1,
    )
    db.add_all([eq_unrestricted, eq_restricted])
    db.flush()

    pol1 = EquipmentAccessPolicy(
        equipment_id=eq_unrestricted.id,
        allowed_roles="STUDENT,FACULTY,ADMIN",
        max_booking_hours=6,
        requires_approval=False,
        auto_approve_eligible=True,
    )
    pol2 = EquipmentAccessPolicy(
        equipment_id=eq_restricted.id,
        allowed_roles="STUDENT,FACULTY,ADMIN",
        max_booking_hours=4,
        requires_approval=True,
        auto_approve_eligible=False,
    )
    db.add_all([pol1, pol2])

    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_lablink.db"):
        try:
            os.remove("./test_lablink.db")
        except:
            pass


@pytest.fixture
def db():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client():
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def admin_headers():
    db = TestingSessionLocal()
    admin = db.query(User).filter(User.email == "test.admin@lablink.edu").first()
    token = create_access_token(subject=admin.id, role=admin.role.value)
    db.close()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def faculty_headers():
    db = TestingSessionLocal()
    faculty = db.query(User).filter(User.email == "test.faculty@lablink.edu").first()
    token = create_access_token(subject=faculty.id, role=faculty.role.value)
    db.close()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def student_headers():
    db = TestingSessionLocal()
    student = db.query(User).filter(User.email == "test.student@lablink.edu").first()
    token = create_access_token(subject=student.id, role=student.role.value)
    db.close()
    return {"Authorization": f"Bearer {token}"}
