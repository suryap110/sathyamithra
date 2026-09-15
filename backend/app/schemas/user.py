from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserProfileSchema(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    age: Optional[int] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village_city: Optional[str] = None
    residence_type: Optional[str] = "Urban"
    annual_income: Optional[float] = None
    education_level: Optional[str] = None
    occupation: Optional[str] = None
    employment_status: Optional[str] = None
    marital_status: Optional[str] = None
    family_members_count: Optional[int] = 1
    social_category: Optional[str] = None
    is_disabled: Optional[bool] = False
    disability_percentage: Optional[int] = None
    is_student: Optional[bool] = False
    is_farmer: Optional[bool] = False
    is_business_owner: Optional[bool] = False
    housing_status: Optional[str] = None
    land_ownership_acres: Optional[float] = 0.0
    is_migrant_worker: Optional[bool] = False
    is_parent: Optional[bool] = False
    is_senior_citizen: Optional[bool] = False
    completion_percentage: Optional[int] = 20

    model_config = ConfigDict(from_attributes=True)

class UserProfileUpdate(UserProfileSchema):
    pass
