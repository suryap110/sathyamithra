from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class CommunityAnswerCreate(BaseModel):
    answer: str = Field(..., min_length=5)

class CommunityAnswerResponse(BaseModel):
    id: str
    question_id: str
    user_id: str
    author_name: str
    answer: str
    author_type: str  # CITIZEN, OFFICIAL, AI_GENERATED
    helpful_count: int
    moderation_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class CommunityQuestionCreate(BaseModel):
    title: str = Field(..., min_length=5, example="How to apply for Pudhumai Penn scholarship?")
    question: str = Field(..., min_length=10)
    category: str = Field("General", example="Education")
    state: Optional[str] = Field(None, example="Tamil Nadu")
    district: Optional[str] = Field(None, example="Chennai")

class CommunityQuestionUpdate(BaseModel):
    title: Optional[str] = None
    question: Optional[str] = None
    category: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None

class CommunityQuestionResponse(BaseModel):
    id: str
    user_id: str
    author_name: str
    title: str
    question: str
    category: str
    state: Optional[str] = None
    district: Optional[str] = None
    moderation_status: str
    created_at: datetime
    updated_at: datetime
    answers: List[CommunityAnswerResponse] = []
    answers_count: int = 0
    ai_summary_disclaimer: Optional[str] = None

    class Config:
        from_attributes = True

class CommunityReportCreate(BaseModel):
    reason: str = Field(..., example="Incorrect information")  # Incorrect information, Spam, Harassment, Scam, Misleading information
    details: Optional[str] = None
