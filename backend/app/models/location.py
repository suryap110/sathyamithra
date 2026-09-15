import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float, Text, Index
from app.database.session import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False, index=True)  # GOVT_OFFICE, CSC_CENTER, HELP_CENTER, SCHEME_OFFICE
    
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)
    taluk = Column(String, nullable=True)
    address = Column(Text, nullable=False)
    
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    source_url = Column(String, nullable=True)
    verified = Column(Boolean, default=True)
    last_verified = Column(String, default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))

    __table_args__ = (
        Index("idx_locations_state_district", "state", "district"),
    )
