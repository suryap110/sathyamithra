from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class SchemeCategorySchema(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon_name: Optional[str] = "Briefcase"

    model_config = ConfigDict(from_attributes=True)

class SchemeBenefitSchema(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    amount_inr: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class SchemeDocumentSchema(BaseModel):
    id: str
    document_type: str
    is_mandatory: bool = True
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SchemeStepSchema(BaseModel):
    id: str
    step_number: int
    title: str
    description: Optional[str] = None
    action_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SchemeFAQSchema(BaseModel):
    id: str
    question: str
    answer: str

    model_config = ConfigDict(from_attributes=True)

class SchemeEligibilityRuleSchema(BaseModel):
    id: str
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_income: Optional[float] = None
    target_gender: Optional[str] = "All"
    required_occupations: Optional[List[str]] = []
    required_states: Optional[List[str]] = []
    rule_explanation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SchemeSchema(BaseModel):
    id: str
    title: str
    short_description: str
    detailed_description: Optional[str] = None
    category_id: Optional[str] = None
    category: Optional[SchemeCategorySchema] = None
    state: str
    ministry: Optional[str] = None
    benefit_type: Optional[str] = None
    estimated_benefit_amount: Optional[float] = None
    benefit_summary: Optional[str] = None
    application_mode: Optional[str] = "Online"
    official_url: Optional[str] = None
    processing_timeline_days: Optional[int] = 30
    is_verified: bool = True
    last_verified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SchemeDetailSchema(SchemeSchema):
    category: Optional[SchemeCategorySchema] = None
    eligibility_rules: List[SchemeEligibilityRuleSchema] = []
    benefits: List[SchemeBenefitSchema] = []
    required_documents: List[SchemeDocumentSchema] = []
    application_steps: List[SchemeStepSchema] = []
    faqs: List[SchemeFAQSchema] = []

class SchemeCreate(BaseModel):
    title: str
    short_description: str
    detailed_description: Optional[str] = None
    state: str = "Central"
    ministry: Optional[str] = None
    benefit_type: Optional[str] = None
    estimated_benefit_amount: Optional[float] = None
    benefit_summary: Optional[str] = None
    application_mode: str = "Online"
    official_url: Optional[str] = None

class SchemeReportCreate(BaseModel):
    reason: str
    details: Optional[str] = None
