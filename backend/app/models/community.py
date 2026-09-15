import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Index
from sqlalchemy.orm import relationship
from app.database.session import Base

class CommunityQuestion(Base):
    __tablename__ = "community_questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String, nullable=False)
    question = Column(Text, nullable=False)
    category = Column(String, default="General", index=True)
    state = Column(String, nullable=True, index=True)
    district = Column(String, nullable=True)
    
    moderation_status = Column(String, default="VISIBLE", index=True)  # VISIBLE, PENDING_REVIEW, HIDDEN, REMOVED
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="community_questions")
    answers = relationship("CommunityAnswer", back_populates="question", cascade="all, delete-orphan")

class CommunityAnswer(Base):
    __tablename__ = "community_answers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = Column(String, ForeignKey("community_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    answer = Column(Text, nullable=False)
    author_type = Column(String, default="CITIZEN")  # CITIZEN, OFFICIAL, AI_GENERATED
    helpful_count = Column(Integer, default=0)
    moderation_status = Column(String, default="VISIBLE", index=True)  # VISIBLE, PENDING_REVIEW, HIDDEN, REMOVED
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    question = relationship("CommunityQuestion", back_populates="answers")
    user = relationship("User", back_populates="community_answers")

class CommunityReport(Base):
    __tablename__ = "community_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    entity_type = Column(String, nullable=False)  # QUESTION, ANSWER
    entity_id = Column(String, nullable=False, index=True)
    reason = Column(String, nullable=False)  # Incorrect information, Spam, Harassment, Scam, Misleading information
    details = Column(Text, nullable=True)
    status = Column(String, default="PENDING")  # PENDING, RESOLVED, DISMISSED
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="community_reports")
