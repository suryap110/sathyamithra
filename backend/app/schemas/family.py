from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class FamilyMemberBase(BaseModel):
    name: str = Field(..., example="Ramesh Kumar")
    relationship: str = Field(..., example="Parent")  # Parent, Spouse, Child, Grandparent, Sibling, Other dependent
    age: Optional[int] = Field(None, example=48)
    date_of_birth: Optional[str] = Field(None, example="1978-05-15")
    gender: Optional[str] = Field(None, example="Male")
    state: Optional[str] = Field(None, example="Tamil Nadu")
    district: Optional[str] = Field(None, example="Chennai")
    education_level: Optional[str] = Field(None, example="Secondary")
    occupation: Optional[str] = Field(None, example="Farmer")
    employment_status: Optional[str] = Field(None, example="Self-Employed")
    annual_income: Optional[float] = Field(0.0, example=150000.0)
    social_category: Optional[str] = Field(None, example="OBC")
    is_student: Optional[bool] = False
    is_farmer: Optional[bool] = False
    is_disabled: Optional[bool] = False
    disability_percentage: Optional[int] = None
    is_senior_citizen: Optional[bool] = False
    is_business_owner: Optional[bool] = False
    marital_status: Optional[str] = Field(None, example="Married")
    notes: Optional[str] = None

class FamilyMemberCreate(FamilyMemberBase):
    pass

class FamilyMemberUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    age: Optional[int] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    education_level: Optional[str] = None
    occupation: Optional[str] = None
    employment_status: Optional[str] = None
    annual_income: Optional[float] = None
    social_category: Optional[str] = None
    is_student: Optional[bool] = None
    is_farmer: Optional[bool] = None
    is_disabled: Optional[bool] = None
    disability_percentage: Optional[int] = None
    is_senior_citizen: Optional[bool] = None
    is_business_owner: Optional[bool] = None
    marital_status: Optional[str] = None
    notes: Optional[str] = None

class FamilyMemberResponse(FamilyMemberBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FamilyMemberRecommendation(BaseModel):
    member_id: str
    member_name: str
    relationship: str
    matches_count: int
    matches: List[Any]  # List[SchemeMatchResponse]

class FamilyRecommendationsResponse(BaseModel):
    family_summary: str
    member_recommendations: List[FamilyMemberRecommendation]

class BenefitItem(BaseModel):
    member_name: str
    relationship: str
    scheme_id: str
    scheme_title: str
    estimated_benefit: str
    status: str
    disclaimer: str

class FamilyPlannerResponse(BaseModel):
    total_potential_benefit_estimate: float
    items: List[BenefitItem]
    optimization_notes: List[str]
