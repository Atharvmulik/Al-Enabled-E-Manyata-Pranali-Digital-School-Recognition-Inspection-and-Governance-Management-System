"""
app/routers/auth.py
"""

import os
import random
import string
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import firestore
import jwt

from app.models import get_db, COL_SCHOOLS, COL_USERS, COL_OTP
from app.schemas import (
    SendOtpRequest,
    SignupRequest,
    LoginRequest,
    SignupResponse,
    LoginResponse,
    MessageResponse,
    UdiseVerifyResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ─── JWT configuration ────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRY_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    return user_id

# ─── Constants ────────────────────────────────────────────────────────────────
COL_USERS    = "users"
COL_OTP      = "otp_codes"
OTP_EXPIRY_MINUTES = 10

def _send_email_otp(to_email: str, otp_code: str):
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")
    smtp_from = os.getenv("SMTP_FROM", smtp_user)

    if not smtp_user or not smtp_pass:
        print(f"[DEV] OTP for {to_email}: {otp_code}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your OTP for School Recognition & Inspection System"
    msg["From"]    = smtp_from
    msg["To"]      = to_email

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1a1a2e; margin-bottom: 8px;">Verify your email</h2>
      <p style="color: #555; margin-bottom: 24px;">
        Use the OTP below to complete your account registration.
        This code expires in {OTP_EXPIRY_MINUTES} minutes.
      </p>
      <div style="background: #f4f4f8; border-radius: 12px; padding: 24px; text-align: center;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #2563eb;">
          {otp_code}
        </span>
      </div>
      <p style="color: #aaa; font-size: 12px; margin-top: 24px;">
        If you did not request this, please ignore this email.
      </p>
    </div>
    """
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_from, to_email, msg.as_string())


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def _generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))


# ══════════════════════════════════════════════
# POST /auth/send-otp
# ══════════════════════════════════════════════

@router.post("/send-otp", response_model=MessageResponse)
def send_otp(
    payload: SendOtpRequest,
    db=Depends(get_db),
):
    existing = (
        db.collection(COL_USERS)
        .where("email", "==", payload.email)
        .limit(1)
        .stream()
    )
    if any(True for _ in existing):
        raise HTTPException(400, "An account with this email already exists. Please sign in.")

    otp_code = _generate_otp()
    expiry   = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    otp_ref = db.collection(COL_OTP).document(payload.email)
    otp_ref.set({
        "email":      payload.email,
        "otp":        otp_code,
        "expires_at": expiry,
        "used":       False,
        "created_at": firestore.SERVER_TIMESTAMP,
    })

    _send_email_otp(payload.email, otp_code)

    return MessageResponse(message=f"OTP sent to {payload.email}. Valid for {OTP_EXPIRY_MINUTES} minutes.")


# ══════════════════════════════════════════════
# POST /auth/signup
# ══════════════════════════════════════════════

@router.post("/signup", response_model=SignupResponse, status_code=201)
def signup(
    payload: SignupRequest,
    db=Depends(get_db),
):
    # ── 1. Validate OTP ──────────────────────────────────────────────────────
    otp_ref  = db.collection(COL_OTP).document(payload.email)
    otp_snap = otp_ref.get()

    if not otp_snap.exists:
        raise HTTPException(400, "No OTP found for this email. Please request a new OTP.")

    otp_data = otp_snap.to_dict() or {}

    if otp_data.get("used"):
        raise HTTPException(400, "OTP already used. Please request a new OTP.")

    expires_at = otp_data.get("expires_at")
    if expires_at:
        if isinstance(expires_at, datetime):
            exp = expires_at.replace(tzinfo=timezone.utc) if expires_at.tzinfo is None else expires_at
        else:
            exp = datetime.fromtimestamp(expires_at.timestamp(), tz=timezone.utc)
        if datetime.now(timezone.utc) > exp:
            raise HTTPException(400, "OTP has expired. Please request a new OTP.")

    if otp_data.get("otp") != payload.otp:
        raise HTTPException(400, "Invalid OTP. Please try again.")

    # ── 2. Check email not already registered ────────────────────────────────
    existing_email = (
        db.collection(COL_USERS)
        .where("email", "==", payload.email)
        .limit(1)
        .stream()
    )
    if any(True for _ in existing_email):
        raise HTTPException(400, "An account with this email already exists.")

    # ── 3. Check UDISE not already registered ────────────────────────────────
    existing_udise = (
        db.collection(COL_USERS)
        .where("udise_number", "==", payload.udise_number)
        .limit(1)
        .stream()
    )
    if any(True for _ in existing_udise):
        raise HTTPException(400, "An account with this UDISE number already exists.")

    # ── 4. Create user document ──────────────────────────────────────────────
    user_ref = db.collection(COL_USERS).document()
    user_doc = {
        "full_name":      payload.full_name,
        "email":          payload.email,
        "contact_number": payload.contact_number,
        "school_name":    payload.school_name,
        "udise_number":   payload.udise_number,
        "password_hash":  _hash_password(payload.password),
        "role":           "school",
        "is_active":      True,
        "created_at":     firestore.SERVER_TIMESTAMP,
        "updated_at":     firestore.SERVER_TIMESTAMP,
    }
    user_ref.set(user_doc)

    # ── 5. Create school profile document ────────────────────────────────────
    school_ref = db.collection(COL_SCHOOLS).document(user_ref.id)
    school_doc = {
        "basic_details": {
            "school_name": payload.school_name,
            "udise_number": payload.udise_number,
            "email": payload.email,
            "mobile": payload.contact_number,
        },
        "location": {},
        "infrastructure": {},
        "legal_details": {},
        "status": "Pending",
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
    }
    school_ref.set(school_doc)

    # ── 6. Mark OTP as used ──────────────────────────────────────────────────
    otp_ref.update({"used": True})

    return SignupResponse(
        message="Account created successfully! Please sign in.",
        user_id=user_ref.id,
        email=payload.email,
    )


# ══════════════════════════════════════════════
# POST /auth/login
# ══════════════════════════════════════════════

@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    db=Depends(get_db),
):
    results = list(
        db.collection(COL_USERS)
        .where("email", "==", payload.email)
        .limit(1)
        .stream()
    )

    if not results:
        raise HTTPException(401, "Invalid email or password.")

    user_data = results[0].to_dict() or {}
    user_id   = results[0].id

    if user_data.get("password_hash") != _hash_password(payload.password):
        raise HTTPException(401, "Invalid email or password.")

    if not user_data.get("is_active", True):
        raise HTTPException(403, "Your account has been deactivated. Please contact support.")

    access_token = create_access_token(data={"sub": user_id})

    return LoginResponse(
        message="Login successful",
        user_id=user_id,
        email=user_data["email"],
        full_name=user_data.get("full_name", ""),
        school_name=user_data.get("school_name", ""),
        udise_number=user_data.get("udise_number", ""),
        role=user_data.get("role", "school"),
        access_token=access_token,
        token_type="bearer",
    )