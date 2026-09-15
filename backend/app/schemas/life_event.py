from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field

class LifeEventCreate(BaseModel):
    family_member_id: Optional[str] = None
    event_type: str = Field(..., example="GRADUATION")  # COLLEGE_START, GRADUATION, NEW_JOB, etc.
    event_date: Optional[str] = Field(None, example="2026-06-15")
    description: Optional[str] = Field(None, example="Completed Bachelor's Degree in Computer Science")
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict)

class LifeEventResponse(BaseModel):
    id: str
    user_id: str
    family_member_id: Optional[str] = None
    event_type: str
    event_date: Optional[str] = None
    description: Optional[str] = None
    metadata_json: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class LifeEventAnalysisResponse(BaseModel):
    event_id: str
    event_type: str
    impact_summary: str
    updated_profile_attributes: Dict[str, Any]
    recommended_categories: List[str]
    matched_schemes: List[Any]
