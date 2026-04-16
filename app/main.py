"""
main.py — FastAPI application entry point.

Project structure:
    main.py
    firebase_config.py
    schemas.py
    models.py
    routers/
        predict.py        ← ML prediction endpoint
        dashboard.py      ← All dashboard frontend endpoints
        profile.py        ← 9-step School Profile page
        registration.py   ← 9-step Registration page (New / Renewal / Upgradation)
        auth.py           ← Signup, Login, OTP, Verify UDISE
"""

from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import firebase_config  # noqa
from app.routers import predict, dashboard, profile, registration, status, notifications, inspection, auth
from app.routers import admin_dashboard,admin_schools,admin_inspection,admin_documents
from app.routers import admin_notifications
app = FastAPI(
    title="AI-Enabled School System API",
    description=(
        "Backend for the school dashboard — profile, applications, "
        "inspections, certificates & ML predictions."
    ),
    version="1.0.0",
)

# ── CORS (adjust origins for production) ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(predict.router)
app.include_router(dashboard.router)
app.include_router(profile.router)
app.include_router(registration.router)
app.include_router(status.router)
app.include_router(notifications.router)
app.include_router(inspection.router)
app.include_router(auth.router)          
app.include_router(admin_dashboard.router)
app.include_router(admin_schools.router)
app.include_router(admin_inspection.router)
app.include_router(admin_documents.router)
app.include_router(admin_notifications.router)




# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "AI School System API is running."}