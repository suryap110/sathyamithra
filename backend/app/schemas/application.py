from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.scheme import SchemeSchema

VALID_APPLICATION_STATUSES = [
    "DRAFT",
    "DOCUMENTS_PENDING",
    "READY_TO_SUBMIT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "ADDITIONAL_INFORMATION_REQUIRED",
    "APPROVED",
    "REJECTED",
    "DISBURSED",
    "CLOSED"
]

class ApplicationStatusHistorySchema(BaseModel):
    id: str
    application_id: str
    old_status: Optional[str] = None
    new_status: str
    note: Optional[str] = None
    changed_by: str = "User"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ApplicationSchema(BaseModel):
    id: str
    user_id: str
    scheme_id: str
    reference_number: Optional[str] = None
    status: str
    notes: Optional[str] = None
    official_application_url: Optional[str] = None
    application_date: datetime
    last_updated: datetime
    created_at: datetime
    updated_at: datetime
    
    scheme: Optional[SchemeSchema] = None
    status_history: List[ApplicationStatusHistorySchema] = []

    model_config = ConfigDict(from_attributes=True)

class ApplicationCreateSchema(BaseModel):
    scheme_id: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class ApplicationStatusUpdateSchema(BaseModel):
    status: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class ApplicationDashboardSummary(BaseModel):
    total_applications: int
    active_applications: int
    documents_pending: int
    under_review: int
    approved: int
    rejected: int
    disbursed: int
    applications: List[ApplicationSchema]
