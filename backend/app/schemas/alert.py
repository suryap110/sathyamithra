from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class AlertCreate(BaseModel):
    user_id: str
    type: str  # NEW_SCHEME, SCHEME_UPDATED, SCHEME_DEADLINE, DOCUMENT_EXPIRING, DOCUMENT_EXPIRED, APPLICATION_STATUS_CHANGED, ELIGIBILITY_CHANGED, LIFE_EVENT_RECOMMENDATION, LOCAL_SCHEME, SYSTEM_NOTIFICATION
    title: str
    message: str
    severity: Optional[str] = "INFO"  # INFO, WARNING, ACTION_REQUIRED
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    action_url: Optional[str] = None

class AlertResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    severity: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    read: bool
    action_url: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class NotificationPreferenceBase(BaseModel):
    scheme_alerts: str = "ALL"  # ALL, IMPORTANT_ONLY, OFF
    application_alerts: str = "ALL"
    document_alerts: str = "ALL"
    life_event_alerts: str = "ALL"
    local_alerts: str = "ALL"
    ai_recommendations: str = "ALL"

class NotificationPreferenceUpdate(NotificationPreferenceBase):
    pass

class NotificationPreferenceResponse(NotificationPreferenceBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
