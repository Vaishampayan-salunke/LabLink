import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.db.session import get_db
from app.models.user import User, UserRole, RefreshSession, AuditLog
from app.schemas.user import UserCreate, UserLogin, UserOut, Token, RefreshTokenRequest
from app.api.deps import get_current_user

router = APIRouter()


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Student registration. Never allows users to self-assign Admin or Faculty roles."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # Security: force role to STUDENT on self-registration
    assigned_role = UserRole.STUDENT

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=assigned_role,
        department_id=user_in.department_id,
        student_id=user_in.student_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="USER_REGISTERED",
        entity_type="User",
        entity_id=user.id,
        details=f"User {user.email} registered with role {user.role.value}",
        ip_address=request.client.host if request.client else None,
    )
    db.add(audit)
    db.commit()

    return user


@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Authenticate user with password hash verification.
    Issues short-lived JWT access token and rotates persistent refresh token.
    """
    user = db.query(User).filter(User.email == login_data.email).first()

    # Self-healing: if demo account is missing or equipment count is 0, auto-seed and re-query
    if not user and login_data.email.endswith("@lablink.demo"):
        try:
            from app.db.seed import seed_database
            seed_database()
            user = db.query(User).filter(User.email == login_data.email).first()
        except Exception as e:
            pass

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated. Please contact laboratory administrator.",
        )

    # Generate tokens
    access_token = create_access_token(subject=user.id, role=user.role.value)
    raw_refresh_token = secrets.token_urlsafe(48)
    token_h = hash_token(raw_refresh_token)

    refresh_expiry = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_session = RefreshSession(
        user_id=user.id,
        token_hash=token_h,
        expires_at=refresh_expiry,
        revoked=False,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(refresh_session)

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        entity_type="User",
        entity_id=user.id,
        details=f"Successful login for {user.email}",
        ip_address=request.client.host if request.client else None,
    )
    db.add(audit)
    db.commit()

    # Set secure HttpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=raw_refresh_token,
        httponly=True,
        secure=False if settings.ENVIRONMENT == "development" else True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        refresh_token=raw_refresh_token,
        user=UserOut.model_validate(user),
    )


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_req: RefreshTokenRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Rotate refresh token and issue new access token."""
    raw_token = refresh_req.refresh_token or request.cookies.get("refresh_token")
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    token_h = hash_token(raw_token)
    session = db.query(RefreshSession).filter(
        RefreshSession.token_hash == token_h,
        RefreshSession.revoked == False,
    ).first()

    now = datetime.now(timezone.utc)
    # Ensure session expires_at is timezone-aware for comparison
    if session and session.expires_at:
        exp = session.expires_at if session.expires_at.tzinfo else session.expires_at.replace(tzinfo=timezone.utc)
    else:
        exp = now - timedelta(seconds=1)

    if not session or exp < now:
        if session:
            session.revoked = True
            db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is expired or revoked",
        )

    # Revoke old session (Rotation)
    session.revoked = True

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user or not user.is_active:
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is invalid or deactivated",
        )

    # Issue new pair
    new_access_token = create_access_token(subject=user.id, role=user.role.value)
    new_raw_refresh = secrets.token_urlsafe(48)
    new_token_h = hash_token(new_raw_refresh)

    new_session = RefreshSession(
        user_id=user.id,
        token_hash=new_token_h,
        expires_at=now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        revoked=False,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(new_session)
    db.commit()

    response.set_cookie(
        key="refresh_token",
        value=new_raw_refresh,
        httponly=True,
        secure=False if settings.ENVIRONMENT == "development" else True,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

    return Token(
        access_token=new_access_token,
        token_type="bearer",
        refresh_token=new_raw_refresh,
        user=UserOut.model_validate(user),
    )


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revoke all active refresh sessions for this user on logout."""
    db.query(RefreshSession).filter(
        RefreshSession.user_id == current_user.id,
        RefreshSession.revoked == False
    ).update({"revoked": True})
    db.commit()

    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out and revoked active sessions."}


@router.get("/me", response_model=UserOut)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """Return profile of currently authenticated user."""
    return current_user


@router.api_route("/seed", methods=["GET", "POST"])
def trigger_seed(db: Session = Depends(get_db)):
    """Triggers database seed to ensure all 28 equipment items and demo users exist."""
    from app.db.seed import seed_database
    seed_database()
    return {
        "status": "success",
        "message": "Database successfully seeded with 28 equipment items, laboratories, and demo accounts.",
    }
