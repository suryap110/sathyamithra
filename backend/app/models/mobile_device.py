import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class UserDevice(Base):
    __tablename__ = "user_devices"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    device_id = Column(String, nullable=True, index=True)
    platform = Column(String, nullable=False, default="android")  # android, ios, web
    push_token = Column(String, nullable=False, unique=True, index=True)
    app_version = Column(String, default="1.0.0")
    os_version = Column(String, nullable=True)
    locale = Column(String, default="en")
    timezone = Column(String, default="Asia/Kolkata")
    is_active = Column(Boolean, default=True)
    last_seen_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="devices")
