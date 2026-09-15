import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.user import User
from app.models.application import Application, ApplicationStatusHistory
from app.models.scheme import Scheme
from app.api.auth import get_current_user
from app.schemas.application import (
    ApplicationSchema,
    ApplicationCreateSchema,
    ApplicationStatusUpdateSchema,
    ApplicationStatusHistorySchema,
    ApplicationDashboardSummary,
    VALID_APPLICATION_STATUSES
)
from app.services.application_engine import update_application_status
from app.core.events import dispatch_event

router = APIRouter(prefix="/applications", tags=["Application Tracking"])

def _generate_reference_number() -> str:
    rand_num = random.randint(10000, 99999)
    return f"SM-2026-{rand_num}"

@router.get("", response_model=ApplicationDashboardSummary)
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Application)
        .filter(Application.user_id == current_user.id)
        .options(selectinload(Application.scheme), selectinload(Application.status_history))
        .order_by(Application.updated_at.desc())
    )
    result = await db.execute(stmt)
    apps = result.scalars().all()

    # Calculate status counts
    total = len(apps)
    active = sum(1 for a in apps if a.status in ["DOCUMENTS_PENDING", "READY_TO_SUBMIT", "SUBMITTED", "UNDER_REVIEW", "ADDITIONAL_INFORMATION_REQUIRED"])
    docs_pending = sum(1 for a in apps if a.status == "DOCUMENTS_PENDING")
    under_review = sum(1 for a in apps if a.status == "UNDER_REVIEW")
    approved = sum(1 for a in apps if a.status == "APPROVED")
    rejected = sum(1 for a in apps if a.status == "REJECTED")
    disbursed = sum(1 for a in apps if a.status == "DISBURSED")

    app_dtos = [ApplicationSchema.model_validate(a) for a in apps]

    return ApplicationDashboardSummary(
        total_applications=total,
        active_applications=active,
        documents_pending=docs_pending,
        under_review=under_review,
        approved=approved,
        rejected=rejected,
        disbursed=disbursed,
        applications=app_dtos
    )

@router.post("", response_model=ApplicationSchema, status_code=status.HTTP_201_CREATED)
async def create_application(
    req: ApplicationCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify scheme exists
    s_stmt = select(Scheme).filter(Scheme.id == req.scheme_id)
    scheme = (await db.execute(s_stmt)).scalars().first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    # Check if application already exists for this scheme and user
    existing_stmt = select(Application).filter(Application.user_id == current_user.id, Application.scheme_id == req.scheme_id)
    existing_app = (await db.execute(existing_stmt)).scalars().first()
    if existing_app:
        stmt = (
            select(Application)
            .filter(Application.id == existing_app.id)
            .options(selectinload(Application.scheme), selectinload(Application.status_history))
        )
        return ApplicationSchema.model_validate((await db.execute(stmt)).scalars().first())

    ref_no = req.reference_number or _generate_reference_number()
    app_obj = Application(
        user_id=current_user.id,
        scheme_id=req.scheme_id,
        reference_number=ref_no,
        status="DRAFT",
        notes=req.notes or f"Application started for {scheme.title}",
        official_application_url=scheme.official_url or "https://myscheme.gov.in"
    )
    db.add(app_obj)
    await db.commit()
    await db.refresh(app_obj)

    # Add initial status history log
    initial_history = ApplicationStatusHistory(
        application_id=app_obj.id,
        old_status=None,
        new_status="DRAFT",
        note="Application created by citizen",
        changed_by="User"
    )
    db.add(initial_history)
    await db.commit()

    dispatch_event("APPLICATION_CREATED", {"user_id": current_user.id, "application_id": app_obj.id, "scheme_id": req.scheme_id})

    stmt = (
        select(Application)
        .filter(Application.id == app_obj.id)
        .options(selectinload(Application.scheme), selectinload(Application.status_history))
    )
    res_app = (await db.execute(stmt)).scalars().first()
    return ApplicationSchema.model_validate(res_app)

@router.get("/{application_id}", response_model=ApplicationSchema)
async def get_application_details(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .options(selectinload(Application.scheme), selectinload(Application.status_history))
    )
    result = await db.execute(stmt)
    app_obj = result.scalars().first()
    if not app_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found or unauthorized")

    return ApplicationSchema.model_validate(app_obj)

@router.put("/{application_id}", response_model=ApplicationSchema)
async def update_application_details(
    application_id: str,
    req: ApplicationCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .options(selectinload(Application.scheme), selectinload(Application.status_history))
    )
    app_obj = (await db.execute(stmt)).scalars().first()
    if not app_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found or unauthorized")

    if req.reference_number:
        app_obj.reference_number = req.reference_number
    if req.notes:
        app_obj.notes = req.notes

    await db.commit()
    await db.refresh(app_obj)
    return ApplicationSchema.model_validate(app_obj)

@router.post("/{application_id}/status", response_model=ApplicationSchema)
async def update_status(
    application_id: str,
    req: ApplicationStatusUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .options(selectinload(Application.scheme), selectinload(Application.status_history))
    )
    app_obj = (await db.execute(stmt)).scalars().first()
    if not app_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found or unauthorized")

    if req.reference_number:
        app_obj.reference_number = req.reference_number

    updated_app = await update_application_status(
        application=app_obj,
        new_status=req.status,
        note=req.notes or f"Status updated to {req.status}",
        changed_by="User",
        db=db
    )

    dispatch_event("APPLICATION_STATUS_CHANGED", {
        "user_id": current_user.id,
        "application_id": application_id,
        "new_status": req.status
    })

    return ApplicationSchema.model_validate(updated_app)

@router.get("/{application_id}/timeline", response_model=List[ApplicationStatusHistorySchema])
async def get_application_timeline(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Security check: User ownership
    stmt = select(Application).filter(Application.id == application_id, Application.user_id == current_user.id)
    app_obj = (await db.execute(stmt)).scalars().first()
    if not app_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found or unauthorized")

    h_stmt = (
        select(ApplicationStatusHistory)
        .filter(ApplicationStatusHistory.application_id == application_id)
        .order_by(ApplicationStatusHistory.created_at.asc())
    )
    history_records = (await db.execute(h_stmt)).scalars().all()
    return [ApplicationStatusHistorySchema.model_validate(h) for h in history_records]

@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Application).filter(Application.id == application_id, Application.user_id == current_user.id)
    app_obj = (await db.execute(stmt)).scalars().first()
    if not app_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found or unauthorized")

    await db.delete(app_obj)
    await db.commit()
    return {"status": "deleted", "id": application_id}
