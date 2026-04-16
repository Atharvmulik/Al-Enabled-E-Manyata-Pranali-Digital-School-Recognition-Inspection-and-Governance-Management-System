"""
routers/certificates.py
─────────────────────────────────────────────────────────────────────────────
All endpoints powering the Certificates page (page.tsx).

Endpoints:
  GET  /certificates/{school_id}                    → Full certificates page data (1 call)
  GET  /certificates/{school_id}/list               → All certificates for a school
  POST /certificates/{school_id}/issue              → Issue a new certificate (admin only)
  GET  /certificates/{school_id}/{cert_id}          → Single certificate detail
  POST /certificates/{school_id}/{cert_id}/download → Generate / refresh download URL
  PATCH /certificates/{school_id}/{cert_id}/revoke  → Revoke a certificate (admin only)
─────────────────────────────────────────────────────────────────────────────
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from app.schemas import (
    CertificatesPageResponse,
    CertificateItem,
    CertificateStatus,
    CertificatesSummary,
    IssueCertificateRequest,
    IssueCertificateResponse,
    CertificateDetailResponse,
    DownloadUrlResponse,
    RevokeCertificateRequest,
)
from app import certificate_models as models   # see certificate_models.py below

router = APIRouter(prefix="/certificates", tags=["Certificates"])


# ─────────────────────────────────────────────────────────
# Helpers: raw dict → response schema
# ─────────────────────────────────────────────────────────

def _to_certificate_item(d: dict) -> CertificateItem:
    return CertificateItem(
        id=d.get("certificate_id", ""),
        type=d.get("type", "Recognition Certificate"),
        issue_date=d.get("issued_on", ""),
        validity=d.get("valid_until", ""),
        status=CertificateStatus(d.get("status", "Expired")),
        download_url=d.get("download_url"),
    )


def _build_summary(certificates: list[CertificateItem]) -> CertificatesSummary:
    active = sum(1 for c in certificates if c.status == CertificateStatus.active)
    expired = sum(1 for c in certificates if c.status == CertificateStatus.expired)
    return CertificatesSummary(
        active=active,
        expired=expired,
        total=len(certificates),
    )


# ─────────────────────────────────────────────────────────
# 1. Full page load  (powers entire page.tsx in one call)
# ─────────────────────────────────────────────────────────

@router.get(
    "/{school_id}",
    response_model=CertificatesPageResponse,
    summary="Get full certificates page data (one call loads the entire page)",
)
async def get_certificates_page(school_id: str):
    """
    Single endpoint that powers the entire Certificates page.

    Returns:
      - summary counts (active / expired / total)
      - full list of certificate cards
      - current application note (app_id + status)

    Maps directly to every UI element on page.tsx:
      • Summary Cards  → response.summary
      • Certificate Cards list → response.certificates
      • "Current Application" note → response.current_application
    """
    school = models.get_school(school_id)
    if not school:
        raise HTTPException(status_code=404, detail=f"School '{school_id}' not found.")

    raw_certs = models.list_certificates(school_id)
    cert_items = [_to_certificate_item(c) for c in raw_certs]
    summary = _build_summary(cert_items)

    current_app = models.get_current_application_note(school_id)  # may be None

    return CertificatesPageResponse(
        school_id=school_id,
        summary=summary,
        certificates=cert_items,
        current_application=current_app,
    )


# ─────────────────────────────────────────────────────────
# 2. List all certificates
# ─────────────────────────────────────────────────────────

@router.get(
    "/{school_id}/list",
    response_model=list[CertificateItem],
    summary="Get all certificates issued to a school",
)
async def list_certificates(school_id: str):
    """Returns every certificate document for the school, newest first."""
    school = models.get_school(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found.")

    raw_certs = models.list_certificates(school_id)
    return [_to_certificate_item(c) for c in raw_certs]


# ─────────────────────────────────────────────────────────
# 3. Issue a new certificate  (admin only)
# ─────────────────────────────────────────────────────────

@router.post(
    "/{school_id}/issue",
    response_model=IssueCertificateResponse,
    status_code=201,
    summary="Issue a new certificate to a school (admin only)",
)
async def issue_certificate(school_id: str, body: IssueCertificateRequest):
    """
    Admin endpoint — creates a new certificate document for the school.

    Guards:
      • School must exist.
      • Inspection must be in 'Completed' status with result 'Passed'.
      • No currently 'Active' certificate (prevents duplicate issuance).

    On success, returns the new certificate's ID and download URL.
    """
    school = models.get_school(school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found.")

    # Guard: inspection must be completed & passed
    inspection = models.get_inspection(school_id)
    if not inspection or inspection.get("status") != "Completed":
        raise HTTPException(
            status_code=400,
            detail="Inspection must be 'Completed' before issuing a certificate.",
        )
    if inspection.get("overall_result") != "Passed":
        raise HTTPException(
            status_code=400,
            detail=f"Inspection result is '{inspection.get('overall_result')}'. Certificate can only be issued for a 'Passed' inspection.",
        )

    # Guard: no active certificate already exists
    active = models.get_active_certificate(school_id)
    if active:
        raise HTTPException(
            status_code=409,
            detail=f"An active certificate ({active['certificate_id']}) already exists. Revoke it before issuing a new one.",
        )

    new_cert = models.create_certificate(
        school_id=school_id,
        cert_type=body.type,
        valid_until=body.valid_until,
        download_url=body.download_url,
    )
    return IssueCertificateResponse(
        message="Certificate issued successfully.",
        certificate_id=new_cert["certificate_id"],
        issued_on=new_cert["issued_on"],
        valid_until=new_cert["valid_until"],
        download_url=new_cert.get("download_url"),
    )


# ─────────────────────────────────────────────────────────
# 4. Single certificate detail
# ─────────────────────────────────────────────────────────

@router.get(
    "/{school_id}/{cert_id}",
    response_model=CertificateDetailResponse,
    summary="Get details of a single certificate",
)
async def get_certificate(school_id: str, cert_id: str):
    """
    Returns full detail of one certificate — used by the 'View' button
    on each certificate card.
    """
    cert = models.get_certificate_by_id(school_id, cert_id)
    if not cert:
        raise HTTPException(
            status_code=404,
            detail=f"Certificate '{cert_id}' not found for school '{school_id}'.",
        )
    return CertificateDetailResponse(
        certificate_id=cert["certificate_id"],
        school_id=cert["school_id"],
        type=cert.get("type", "Recognition Certificate"),
        issued_on=cert.get("issued_on", ""),
        valid_until=cert.get("valid_until", ""),
        status=CertificateStatus(cert.get("status", "Expired")),
        download_url=cert.get("download_url"),
        issued_by=cert.get("issued_by"),
        remarks=cert.get("remarks"),
    )


# ─────────────────────────────────────────────────────────
# 5. Generate / refresh download URL
# ─────────────────────────────────────────────────────────

@router.post(
    "/{school_id}/{cert_id}/download",
    response_model=DownloadUrlResponse,
    summary="Get or refresh the download URL for a certificate PDF",
)
async def get_download_url(school_id: str, cert_id: str):
    """
    Called when the user presses the 'Download' button on a certificate card.

    - If the certificate already has a Firebase Storage URL, returns it directly.
    - If not, generates a signed URL (or returns a placeholder), then stores it.
    """
    cert = models.get_certificate_by_id(school_id, cert_id)
    if not cert:
        raise HTTPException(
            status_code=404,
            detail=f"Certificate '{cert_id}' not found.",
        )

    url = cert.get("download_url") or models.generate_certificate_download_url(school_id, cert_id)
    if not url:
        raise HTTPException(
            status_code=503,
            detail="Certificate PDF is not available yet. Please contact admin.",
        )

    # Persist URL back if it was freshly generated
    if not cert.get("download_url"):
        models.set_download_url(school_id, cert_id, url)

    return DownloadUrlResponse(
        certificate_id=cert_id,
        download_url=url,
    )


# ─────────────────────────────────────────────────────────
# 6. Revoke a certificate  (admin only)
# ─────────────────────────────────────────────────────────

@router.patch(
    "/{school_id}/{cert_id}/revoke",
    summary="Revoke an active certificate (admin only)",
)
async def revoke_certificate(school_id: str, cert_id: str, body: RevokeCertificateRequest):
    """
    Marks a certificate as 'Revoked' and stores an optional reason.
    Used by admin when a school fails re-inspection or violates conditions.
    """
    cert = models.get_certificate_by_id(school_id, cert_id)
    if not cert:
        raise HTTPException(
            status_code=404,
            detail=f"Certificate '{cert_id}' not found.",
        )
    if cert.get("status") != "Active":
        raise HTTPException(
            status_code=400,
            detail=f"Only 'Active' certificates can be revoked. Current status: {cert.get('status')}.",
        )

    models.revoke_certificate(school_id, cert_id, reason=body.reason)
    return {
        "message": "Certificate revoked successfully.",
        "certificate_id": cert_id,
    }