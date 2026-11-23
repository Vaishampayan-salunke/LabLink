from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    equipment,
    bookings,
    approvals,
    ai,
    analytics,
    notifications,
    departments,
    admin,
    projects,
    waitlist,
    qr,
    fault_reports,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(equipment.router, prefix="/equipment", tags=["Equipment"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(approvals.router, prefix="/approvals", tags=["Approvals"])
api_router.include_router(ai.router, prefix="/ai", tags=["GenAI Assistant"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments & Laboratories"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_router.include_router(projects.router, tags=["Projects"])
api_router.include_router(waitlist.router, tags=["Waitlist"])
api_router.include_router(qr.router, tags=["QR Management"])
api_router.include_router(fault_reports.router, tags=["Fault Reports"])
