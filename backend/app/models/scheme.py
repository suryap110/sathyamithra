import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class SchemeCategory(Base):
    __tablename__ = "scheme_categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String, default="Briefcase")
    
    schemes = relationship("Scheme", back_populates="category")

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False, index=True)
    short_description = Column(Text, nullable=False)
    detailed_description = Column(Text, nullable=True)
    
    category_id = Column(String, ForeignKey("scheme_categories.id"), nullable=True)
    state = Column(String, default="Central", index=True)  # Central or specific Indian state (e.g. Tamil Nadu)
    ministry = Column(String, nullable=True, index=True)
    
    benefit_type = Column(String, nullable=True)  # Financial, Healthcare, Scholarship, Pension, Subsidy
    estimated_benefit_amount = Column(Float, nullable=True)
    benefit_summary = Column(String, nullable=True)
    
    application_mode = Column(String, default="Online")  # Online, Offline, Both
    official_url = Column(String, nullable=True)
    processing_timeline_days = Column(Integer, default=30)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    last_verified_at = Column(DateTime, default=datetime.utcnow)

    # Phase 7 Admin & Freshness fields
    status = Column(String, default="PUBLISHED", index=True)  # DRAFT, PENDING_REVIEW, VERIFIED, PUBLISHED, UNPUBLISHED, REJECTED, ARCHIVED, STALE
    verification_status = Column(String, default="VERIFIED", index=True)  # UNVERIFIED, PENDING, VERIFIED, FAILED, STALE
    verified_by = Column(String, nullable=True)
    verification_notes = Column(Text, nullable=True)
    next_verification_due_at = Column(DateTime, nullable=True)
    source_checked_at = Column(DateTime, default=datetime.utcnow)
    source_type = Column(String, default="CENTRAL_GOVERNMENT")  # CENTRAL_GOVERNMENT, STATE_GOVERNMENT, MINISTRY, DEPARTMENT, OFFICIAL_PORTAL, OFFICIAL_NOTIFICATION, OFFICIAL_DOCUMENT, OTHER_TRUSTED_SOURCE
    source_name = Column(String, nullable=True)
    quality_score = Column(Float, default=95.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("SchemeCategory", back_populates="schemes")
    eligibility_rules = relationship("SchemeEligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    benefits = relationship("SchemeBenefit", back_populates="scheme", cascade="all, delete-orphan")
    required_documents = relationship("SchemeDocument", back_populates="scheme", cascade="all, delete-orphan")
    application_steps = relationship("SchemeStep", back_populates="scheme", cascade="all, delete-orphan")
    faqs = relationship("SchemeFAQ", back_populates="scheme", cascade="all, delete-orphan")
    reports = relationship("SchemeReport", back_populates="scheme", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="scheme")
    versions = relationship("SchemeVersion", back_populates="scheme", cascade="all, delete-orphan")
    verifications = relationship("SchemeVerification", back_populates="scheme", cascade="all, delete-orphan")
    source_checks = relationship("SchemeSourceCheck", back_populates="scheme", cascade="all, delete-orphan")

class SchemeEligibilityRule(Base):
    __tablename__ = "scheme_eligibility_rules"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    max_income = Column(Float, nullable=True)
    target_gender = Column(String, default="All")  # All, Male, Female, Transgender
    required_occupations = Column(JSON, default=list)  # ["Student", "Farmer", etc.]
    required_states = Column(JSON, default=list)  # ["All"] or ["Tamil Nadu"]
    required_social_categories = Column(JSON, default=list)  # ["General", "OBC", "SC", "ST"]
    requires_disability = Column(Boolean, nullable=True)
    requires_student_status = Column(Boolean, nullable=True)
    requires_farmer_status = Column(Boolean, nullable=True)
    
    rule_explanation = Column(Text, nullable=True)

    scheme = relationship("Scheme", back_populates="eligibility_rules")

class SchemeBenefit(Base):
    __tablename__ = "scheme_benefits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    amount_inr = Column(Float, nullable=True)

    scheme = relationship("Scheme", back_populates="benefits")

class SchemeDocument(Base):
    __tablename__ = "scheme_documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String, nullable=False)  # Aadhaar, Income Certificate, etc.
    is_mandatory = Column(Boolean, default=True)
    description = Column(Text, nullable=True)

    scheme = relationship("Scheme", back_populates="required_documents")

class SchemeStep(Base):
    __tablename__ = "scheme_steps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    step_number = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    action_url = Column(String, nullable=True)

    scheme = relationship("Scheme", back_populates="application_steps")

class SchemeFAQ(Base):
    __tablename__ = "scheme_faqs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)

    scheme = relationship("Scheme", back_populates="faqs")

class SchemeReport(Base):
    __tablename__ = "scheme_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scheme_id = Column(String, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String, nullable=False)  # Outdated, Incorrect link, Changed rules
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scheme = relationship("Scheme", back_populates="reports")
