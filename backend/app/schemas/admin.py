from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, HttpUrl

class AdminDashboardStats(BaseModel):
    total_users: int
    active_users: int
    total_schemes: int
    verified_schemes: int
    pending_verification: int
    stale_schemes: int
    reported_schemes: int
    total_applications: int
    ai_conversations: int
    community_reports: int
    broken_sources: int
    freshness_score: float

class SchemeAdminCreate(BaseModel):
    title: str
    short_description: str
    detailed_description: Optional[str] = None
    category_id: Optional[str] = None
    state: str = "Central"
    ministry: Optional[str] = None
    benefit_type: Optional[str] = None
    estimated_benefit_amount: Optional[float] = 0.0
    benefit_summary: Optional[str] = None
    application_mode: str = "Online"
    official_url: Optional[str] = None
    processing_timeline_days: int = 30
    status: str = "DRAFT"  # DRAFT, PENDING_REVIEW, VERIFIED, PUBLISHED
    source_type: str = "CENTRAL_GOVERNMENT"
    source_name: Optional[str] = None
    
    # Nested components
    eligibility_rule: Optional[Dict[str, Any]] = None
    benefits: Optional[List[Dict[str, Any]]] = []
    documents: Optional[List[Dict[str, Any]]] = []
    steps: Optional[List[Dict[str, Any]]] = []
    faqs: Optional[List[Dict[str, Any]]] = []

class SchemeAdminUpdate(BaseModel):
    title: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    category_id: Optional[str] = None
    state: Optional[str] = None
    ministry: Optional[str] = None
    benefit_type: Optional[str] = None
    estimated_benefit_amount: Optional[float] = None
    benefit_summary: Optional[str] = None
    application_mode: Optional[str] = None
    official_url: Optional[str] = None
    processing_timeline_days: Optional[int] = None
    status: Optional[str] = None
    verification_status: Optional[str] = None
    source_type: Optional[str] = None
    source_name: Optional[str] = None
    quality_score: Optional[float] = None

class SchemeVerificationRequest(BaseModel):
    status: str = "VERIFIED"  # VERIFIED, REJECTED, STALE, REQUEST_CHANGES
    notes: Optional[str] = None
    checks_performed: Dict[str, bool] = {
        "source_url": True,
        "content_accurate": True,
        "eligibility_rules": True,
        "benefits_verified": True,
        "documents_required": True
    }

class SchemeStatusUpdate(BaseModel):
    status: str  # DRAFT, PENDING_REVIEW, VERIFIED, PUBLISHED, UNPUBLISHED, REJECTED, ARCHIVED, STALE
    reason: Optional[str] = None

class CitizenReportUpdate(BaseModel):
    status: str  # NEW, UNDER_REVIEW, CONFIRMED, REJECTED, RESOLVED
    admin_notes: Optional[str] = None

class UserAdminUpdate(BaseModel):
    role: Optional[str] = None  # USER, ADMIN, CONTENT_EDITOR, SUPPORT_AGENT, COMMUNITY_MODERATOR
    is_active: Optional[bool] = None
    full_name: Optional[str] = None

class CommunityModerationRequest(BaseModel):
    action: str  # HIDE, RESTORE, REMOVE, MARK_SAFE
    reason: Optional[str] = None

class AdminSettingUpdate(BaseModel):
    key: str
    value: str

class FeatureFlagUpdate(BaseModel):
    key: str
    enabled: bool

class AuditLogResponse(BaseModel):
    id: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    change_summary: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FreshnessSummaryResponse(BaseModel):
    fresh_count: int
    due_soon_count: int
    stale_count: int
    critical_count: int
    total_schemes: int
    last_scan_at: datetime

class SourceHealthResponse(BaseModel):
    scheme_id: str
    scheme_title: str
    source_url: str
    reachability: str
    http_status: Optional[int] = None
    response_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    last_checked_at: datetime

class AIMonitoringResponse(BaseModel):
    total_queries: int
    high_confidence_pct: float
    medium_confidence_pct: float
    low_confidence_pct: float
    fallback_rate_pct: float
    avg_latency_ms: int
    token_usage_est: int
    recent_low_confidence: List[Dict[str, Any]] = []

class SystemHealthResponse(BaseModel):
    backend_api: str
    database: str
    redis: str
    vector_store: str
    ai_provider: str
    storage: str
    background_jobs_queue: int
    overall_status: str
