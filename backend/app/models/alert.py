import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Index
from sqlalchemy.orm import relationship
from app.database.session import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    type = Column(String, nullable=False, index=True)  # NEW_SCHEME, SCHEME_UPDATED, SCHEME_DEADLINE, DOCUMENT_EXPIRING, DOCUMENT_EXPIRED, APPLICATION_STATUS_CHANGED, ELIGIBILITY_CHANGED, LIFE_EVENT_RECOMMENDATION, LOCAL_SCHEME, SYSTEM_NOTIFICATION
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="INFO")  # INFO, WARNING, ACTION_REQUIRED
    
    entity_type = Column(String, nullable=True)  # scheme, document, application, life_event, location
    entity_id = Column(String, nullable=True)
    
    read = Column(Boolean, default=False, index=True)
    action_url = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="alerts")

    __table_args__ = (
        Index("idx_alerts_user_read", "user_id", "read"),
        Index("idx_alerts_user_created", "user_id", "created_at"),
    )

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    scheme_alerts = Column(String, default="ALL")  # ALL, IMPORTANT_ONLY, OFF
    application_alerts = Column(String, default="ALL")
    document_alerts = Column(String, default="ALL")
    life_event_alerts = Column(String, default="ALL")
    local_alerts = Column(String, default="ALL")
    ai_recommendations = Column(String, default="ALL")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="notification_preference")
