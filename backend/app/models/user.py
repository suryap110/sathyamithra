import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="USER", nullable=False)  # USER, ADMIN, SUPPORT_AGENT
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    
    # Phase 6 relationships
    family_members = relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")
    life_events = relationship("LifeEvent", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    notification_preference = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    community_questions = relationship("CommunityQuestion", back_populates="user", cascade="all, delete-orphan")
    community_answers = relationship("CommunityAnswer", back_populates="user", cascade="all, delete-orphan")
    community_reports = relationship("CommunityReport", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Demographic fields
    age = Column(Integer, nullable=True)
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)  # Male, Female, Transgender, Other
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    taluk = Column(String, nullable=True)
    village_city = Column(String, nullable=True)
    residence_type = Column(String, default="Urban")  # Rural, Urban
    annual_income = Column(Float, nullable=True)
    education_level = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    employment_status = Column(String, nullable=True)  # Employed, Unemployed, Self-Employed, Student
    marital_status = Column(String, nullable=True)
    family_members_count = Column(Integer, default=1)
    social_category = Column(String, nullable=True)  # General, OBC, SC, ST, EWS
    is_disabled = Column(Boolean, default=False)
    disability_percentage = Column(Integer, nullable=True)
    is_student = Column(Boolean, default=False)
    is_farmer = Column(Boolean, default=False)
    is_business_owner = Column(Boolean, default=False)
    housing_status = Column(String, nullable=True)  # Own, Rented, Homeless
    land_ownership_acres = Column(Float, default=0.0)
    is_migrant_worker = Column(Boolean, default=False)
    is_parent = Column(Boolean, default=False)
    is_senior_citizen = Column(Boolean, default=False)
    
    completion_percentage = Column(Integer, default=20)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")
