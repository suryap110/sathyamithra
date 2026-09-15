from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.application import Application, ApplicationStatusHistory
from app.schemas.application import VALID_APPLICATION_STATUSES

ALLOWED_TRANSITIONS = {
    "DRAFT": ["DOCUMENTS_PENDING", "READY_TO_SUBMIT", "SUBMITTED", "CLOSED"],
    "DOCUMENTS_PENDING": ["DRAFT", "READY_TO_SUBMIT", "SUBMITTED", "CLOSED"],
    "READY_TO_SUBMIT": ["SUBMITTED", "DOCUMENTS_PENDING", "CLOSED"],
    "SUBMITTED": ["UNDER_REVIEW", "ADDITIONAL_INFORMATION_REQUIRED", "APPROVED", "REJECTED", "CLOSED"],
    "UNDER_REVIEW": ["ADDITIONAL_INFORMATION_REQUIRED", "APPROVED", "REJECTED", "CLOSED"],
    "ADDITIONAL_INFORMATION_REQUIRED": ["SUBMITTED", "UNDER_REVIEW", "CLOSED"],
    "APPROVED": ["DISBURSED", "CLOSED"],
    "REJECTED": ["SUBMITTED", "CLOSED"],
    "DISBURSED": ["CLOSED"],
    "CLOSED": ["DRAFT", "SUBMITTED"]
}

async def update_application_status(
    application: Application,
    new_status: str,
    note: str,
    changed_by: str,
    db: AsyncSession
) -> Application:
    new_status_upper = new_status.upper().strip()
    if new_status_upper not in VALID_APPLICATION_STATUSES:
        raise ValueError(f"Invalid application status '{new_status}'")

    old_status = application.status
    if old_status != new_status_upper:
        history_entry = ApplicationStatusHistory(
            application_id=application.id,
            old_status=old_status,
            new_status=new_status_upper,
            note=note,
            changed_by=changed_by
        )
        db.add(history_entry)
        
        application.status = new_status_upper
        application.last_updated = datetime.utcnow()
        await db.commit()
        await db.refresh(application)

    return application
