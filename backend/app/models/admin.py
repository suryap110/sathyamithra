import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class SchemeVersion(Base):
    __tablename__ = "scheme_versions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False, default=1)
    changed_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    changed_by_name = Column(String, nullable=True)
    change_summary = Column(String, nullable=False)
    changed_fields = Column(JSON, default=dict)
    snapshot_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    scheme = relationship("Scheme", back_populates="versions")

class SchemeVerification(Base):
    __tablename__ = "scheme_verifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    verified_by_user_id = Column(String, ForeignKey("users.id"), nullable=True)
    verified_by_name = Column(String, nullable=True)
    status = Column(String, nullable=False, default="VERIFIED")  # VERIFIED, REJECTED, STALE, REQUEST_CHANGES
    notes = Column(Text, nullable=True)
    checks_performed = Column(JSON, default=dict)  # {"source_url": true, "eligibility": true, "documents": true, "benefits": true}
    verified_at = Column(DateTime, default=datetime.utcnow, index=True)

    scheme = relationship("Scheme", back_populates="verifications")

class SchemeSourceCheck(Base):
    __tablename__ = "scheme_source_checks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    source_url = Column(String, nullable=False)
    http_status = Column(Integer, nullable=True)
    reachability = Column(String, nullable=False, default="REACHABLE")  # REACHABLE, UNREACHABLE, BLOCKED, TIMEOUT, ERROR
    response_time_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=datetime.utcnow, index=True)

    scheme = relationship("Scheme", back_populates="source_checks")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    actor_name = Column(String, nullable=True)
    actor_role = Column(String, nullable=True, index=True)
    action = Column(String, nullable=False, index=True)  # ADMIN_LOGIN, SCHEME_CREATED, SCHEME_VERIFIED, USER_ROLE_CHANGED, etc.
    entity_type = Column(String, nullable=True, index=True)  # Scheme, User, Community, Settings
    entity_id = Column(String, nullable=True)
    change_summary = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AdminSetting(Base):
    __tablename__ = "admin_settings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, default="General")  # General, Freshness, AI, Moderation, Security
    updated_by = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String, unique=True, nullable=False, index=True)
    enabled = Column(Boolean, default=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    updated_by = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class BackgroundJob(Base):
    __tablename__ = "background_jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_name = Column(String, nullable=False, index=True)  # SOURCE_HEALTH_CHECK, FRESHNESS_SCAN, ANALYTICS_AGGREGATION
    status = Column(String, default="QUEUED", index=True)  # QUEUED, RUNNING, COMPLETED, FAILED, RETRYING
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    attempts = Column(Integer, default=1)
    error_message = Column(Text, nullable=True)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String, nullable=False, index=True)  # SCHEME_VIEWED, SEARCH_PERFORMED, APPLICATION_SUBMITTED, AI_QUERY
    user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
