from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.mobile_device import UserDevice

router = APIRouter(prefix="/devices", tags=["Mobile Devices & Push Notifications"])

class DeviceRegisterRequest(BaseModel):
    push_token: str
    platform: str = "android"  # android, ios, web
    device_id: Optional[str] = None
    app_version: Optional[str] = "1.0.0"
    os_version: Optional[str] = None
    locale: Optional[str] = "en"
    timezone: Optional[str] = "Asia/Kolkata"

@router.post("/register", status_code=status.HTTP_200_OK)
async def register_device_token(
    req: DeviceRegisterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserDevice).filter(UserDevice.push_token == req.push_token)
    res = await db.execute(stmt)
    device = res.scalars().first()

    if device:
        device.user_id = current_user.id
        device.platform = req.platform
        device.device_id = req.device_id
        device.app_version = req.app_version
        device.os_version = req.os_version
        device.locale = req.locale
        device.is_active = True
        device.last_seen_at = datetime.utcnow()
    else:
        device = UserDevice(
            user_id=current_user.id,
            push_token=req.push_token,
            platform=req.platform,
            device_id=req.device_id,
            app_version=req.app_version,
            os_version=req.os_version,
            locale=req.locale,
            timezone=req.timezone,
            is_active=True
        )
        db.add(device)

    await db.commit()
    return {"message": "Device push token registered successfully", "push_token": req.push_token}

@router.delete("/{token}", status_code=status.HTTP_200_OK)
async def unregister_device_token(
    token: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UserDevice).filter(UserDevice.push_token == token, UserDevice.user_id == current_user.id)
    res = await db.execute(stmt)
    device = res.scalars().first()
    if device:
        device.is_active = False
        await db.commit()
    return {"message": "Device token deactivated"}
