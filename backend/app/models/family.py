import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship as orm_relationship
from app.database.session import Base

class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    name = Column(String, nullable=False)
    relationship = Column(String, nullable=False)  # Parent, Spouse, Child, Grandparent, Sibling, Other dependent
    age = Column(Integer, nullable=True)
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)  # Male, Female, Transgender, Other
    
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    education_level = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    employment_status = Column(String, nullable=True)  # Employed, Unemployed, Self-Employed, Student, Homemaker, Retired
    annual_income = Column(Float, default=0.0)
    social_category = Column(String, nullable=True)  # General, OBC, SC, ST, EWS
    
    is_student = Column(Boolean, default=False)
    is_farmer = Column(Boolean, default=False)
    is_disabled = Column(Boolean, default=False)
    disability_percentage = Column(Integer, nullable=True)
    is_senior_citizen = Column(Boolean, default=False)
    is_business_owner = Column(Boolean, default=False)
    marital_status = Column(String, nullable=True)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = orm_relationship("User", back_populates="family_members")
    life_events = orm_relationship("LifeEvent", back_populates="family_member", cascade="all, delete-orphan")
