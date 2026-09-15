from typing import Optional, List
from pydantic import BaseModel, Field

class LocationSearchRequest(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    type: Optional[str] = None  # GOVT_OFFICE, CSC_CENTER, HELP_CENTER, SCHEME_OFFICE
    scheme_id: Optional[str] = None

class LocationResponse(BaseModel):
    id: str
    name: str
    type: str
    state: str
    district: str
    taluk: Optional[str] = None
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source_url: Optional[str] = None
    verified: bool
    last_verified: str

    class Config:
        from_attributes = True

class HyperlocalDiscoveryResponse(BaseModel):
    location_summary: str
    state: str
    district: str
    support_centers: List[LocationResponse]
    central_schemes_count: int
    state_schemes_count: int
    district_schemes_count: int
