from typing import Optional, List
from pydantic import BaseModel
from app.schemas.scheme import SchemeSchema

class EligibilityCheckRequest(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    is_student: Optional[bool] = False
    is_farmer: Optional[bool] = False
    is_disabled: Optional[bool] = False

class EligibilityReason(BaseModel):
    criterion: str
    matched: bool
    details: str

class SchemeMatchResponse(BaseModel):
    scheme: SchemeSchema
    match_percentage: int
    confidence_level: str  # High, Medium, Low
    reasons: List[EligibilityReason]
    warnings: List[str]

class EligibilityResultResponse(BaseModel):
    total_schemes_evaluated: int
    matches: List[SchemeMatchResponse]
