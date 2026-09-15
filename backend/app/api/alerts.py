from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.alert import Alert, NotificationPreference
from app.schemas.alert import (
    AlertResponse,
    NotificationPreferenceUpdate,
    NotificationPreferenceResponse
)

router = APIRouter()

@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Alert).filter(Alert.user_id == current_user.id)
    if unread_only:
        stmt = stmt.filter(Alert.read == False)
    stmt = stmt.order_by(Alert.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/unread-count", response_model=Dict[str, int])
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Alert).filter(Alert.user_id == current_user.id, Alert.read == False)
    res = await db.execute(stmt)
    count = len(res.scalars().all())
    return {"unread_count": count}

@router.post("/{alert_id}/read", response_model=AlertResponse)
@router.patch("/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_as_read(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id)
    res = await db.execute(stmt)
    alert = res.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.read = True
    await db.commit()
    await db.refresh(alert)
    return alert

@router.post("/read-all", response_model=Dict[str, str])
async def mark_all_alerts_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Alert).filter(Alert.user_id == current_user.id, Alert.read == False)
    res = await db.execute(stmt)
    alerts = res.scalars().all()
    for a in alerts:
        a.read = True
    await db.commit()
    return {"message": f"Marked {len(alerts)} alerts as read"}

@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id)
    res = await db.execute(stmt)
    alert = res.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    await db.delete(alert)
    await db.commit()
    return None

@router.get("/preferences", response_model=NotificationPreferenceResponse)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(NotificationPreference).filter(NotificationPreference.user_id == current_user.id)
    res = await db.execute(stmt)
    pref = res.scalars().first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return pref

@router.put("/preferences", response_model=NotificationPreferenceResponse)
async def update_notification_preferences(
    pref_in: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(NotificationPreference).filter(NotificationPreference.user_id == current_user.id)
    res = await db.execute(stmt)
    pref = res.scalars().first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    update_data = pref_in.model_dump()
    for key, value in update_data.items():
        setattr(pref, key, value)

    await db.commit()
    await db.refresh(pref)
    return pref
