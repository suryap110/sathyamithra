import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class LifeEvent(Base):
    __tablename__ = "life_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    family_member_id = Column(String, ForeignKey("family_members.id", ondelete="CASCADE"), nullable=True, index=True)
    
    event_type = Column(String, nullable=False)  # COLLEGE_START, GRADUATION, NEW_JOB, JOB_LOSS, BUSINESS_START, MARRIAGE, CHILDBIRTH, SCHOOL_START, MIGRATION, FARMER_STATUS, RETIREMENT, DISABILITY_CERT, SENIOR_CITIZEN, HOUSING_CHANGE, INCOME_CHANGE
    event_date = Column(String, nullable=True)  # YYYY-MM-DD
    description = Column(Text, nullable=True)
    metadata_json = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="life_events")
    family_member = relationship("FamilyMember", back_populates="life_events")
