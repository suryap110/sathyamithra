import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    
    reference_number = Column(String, nullable=True, index=True)  # e.g., SM-2026-00124
    
    # Statuses: DRAFT, DOCUMENTS_PENDING, READY_TO_SUBMIT, SUBMITTED, UNDER_REVIEW, 
    # ADDITIONAL_INFORMATION_REQUIRED, APPROVED, REJECTED, DISBURSED, CLOSED
    status = Column(String, default="DRAFT", index=True)
    
    notes = Column(Text, nullable=True)
    official_application_url = Column(String, nullable=True)
    
    application_date = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    scheme = relationship("Scheme", back_populates="applications")
    status_history = relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan", order_by="ApplicationStatusHistory.created_at.desc()")

class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    
    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    changed_by = Column(String, default="User")  # User or System
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    application = relationship("Application", back_populates="status_history")
