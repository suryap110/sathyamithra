import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    document_type = Column(String, nullable=False, index=True)  
    # Types: Aadhaar, PAN, Income Certificate, Caste Certificate, Residence Certificate, 
    # Community Certificate, Birth Certificate, Bank Passbook, Marksheet, Transfer Certificate, 
    # Disability Certificate, Land Documents, Employment Certificate, Ration Card, Passport, Other
    
    file_name = Column(String, nullable=False)
    storage_key = Column(String, nullable=False)  # Storage key abstraction
    mime_type = Column(String, nullable=False, default="application/pdf")
    file_size = Column(Integer, nullable=False, default=0)
    
    issue_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    
    # Verification status: UPLOADED, PROCESSING, VERIFIED, REQUIRES_REVIEW, REJECTED
    verification_status = Column(String, default="UPLOADED", index=True)
    verification_notes = Column(Text, nullable=True)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="documents")
