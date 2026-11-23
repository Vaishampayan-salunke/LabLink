from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class UtilizationStat(BaseModel):
    category_or_dept: str
    total_equipment: int
    booked_count: int
    utilization_rate: float


class MostRequestedItem(BaseModel):
    equipment_id: str
    equipment_name: str
    category: str
    department_name: str
    booking_count: int


class BookingTrendItem(BaseModel):
    date: str
    count: int


class StudentAnalytics(BaseModel):
    total_bookings: int
    upcoming_bookings: int
    pending_approvals: int
    completed_bookings: int
    recent_activity: List[Dict[str, Any]] = []


class FacultyAnalytics(BaseModel):
    pending_approvals_count: int
    department_equipment_count: int
    active_bookings_count: int
    utilization_rate: float
    maintenance_count: int
    most_requested: List[MostRequestedItem] = []


class AdminAnalytics(BaseModel):
    total_users: int
    total_students: int
    total_faculty: int
    total_departments: int
    total_laboratories: int
    total_equipment: int
    total_bookings: int
    overall_utilization_rate: float
    approval_rate: float
    department_utilization: List[UtilizationStat] = []
    most_requested_equipment: List[MostRequestedItem] = []
    booking_trends: List[BookingTrendItem] = []
