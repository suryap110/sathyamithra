from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

ALLOWED_DOCUMENT_TYPES = [
    "Aadhaar",
    "PAN",
    "Income Certificate",
    "Caste Certificate",
    "Residence Certificate",
    "Community Certificate",
    "Birth Certificate",
    "Bank Passbook",
    "Marksheet",
    "Transfer Certificate",
    "Disability Certificate",
    "Land Documents",
    "Employment Certificate",
    "Ration Card",
    "Passport",
    "Other"
]

class DocumentSchema(BaseModel):
    id: str
    user_id: str
    document_type: str
    file_name: str
    mime_type: str
    file_size: int
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    verification_status: str = "UPLOADED"
    verification_notes: Optional[str] = None
    uploaded_at: datetime
    updated_at: datetime
    
    # Virtual fields for UI convenience
    is_expiring_soon: bool = False
    is_expired: bool = False

    model_config = ConfigDict(from_attributes=True)

class DocumentUpdateSchema(BaseModel):
    document_type: Optional[str] = None
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    verification_notes: Optional[str] = None

class DocumentMatchItem(BaseModel):
    required_document_type: str
    description: Optional[str] = None
    is_mandatory: bool = True
    status: str  # MATCHED, MISSING, EXPIRING, NEEDS_REVIEW
    user_document: Optional[DocumentSchema] = None

class DocumentReadinessResponse(BaseModel):
    scheme_id: Optional[str] = None
    scheme_title: Optional[str] = None
    readiness_percentage: int
    total_required: int
    total_available: int
    total_missing: int
    items: List[DocumentMatchItem]
