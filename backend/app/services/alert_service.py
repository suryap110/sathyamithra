from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.alert import Alert, NotificationPreference
from app.notifications.base import LocalNotificationProvider

local_notifier = LocalNotificationProvider()

async def create_smart_alert(
    db: AsyncSession,
    user_id: str,
    alert_type: str,
    title: str,
    message: str,
    severity: str = "INFO",
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    action_url: Optional[str] = None
) -> Optional[Alert]:
    # Check Notification Preferences
    stmt_pref = select(NotificationPreference).filter(NotificationPreference.user_id == user_id)
    res_pref = await db.execute(stmt_pref)
    pref = res_pref.scalars().first()
    
    if pref:
        # Check setting based on alert type
        setting = "ALL"
        if "SCHEME" in alert_type:
            setting = pref.scheme_alerts
        elif "APPLICATION" in alert_type:
            setting = pref.application_alerts
        elif "DOCUMENT" in alert_type:
            setting = pref.document_alerts
        elif "LIFE_EVENT" in alert_type:
            setting = pref.life_event_alerts
        elif "LOCAL" in alert_type:
            setting = pref.local_alerts
            
        if setting == "OFF":
            return None
        if setting == "IMPORTANT_ONLY" and severity == "INFO":
            return None

    # Deduplicate existing unread alert with same title & user
    stmt_dup = (
        select(Alert)
        .filter(
            Alert.user_id == user_id,
            Alert.type == alert_type,
            Alert.title == title,
            Alert.read == False
        )
    )
    res_dup = await db.execute(stmt_dup)
    existing = res_dup.scalars().first()
    if existing:
        return existing

    alert = Alert(
        user_id=user_id,
        type=alert_type,
        title=title,
        message=message,
        severity=severity,
        entity_type=entity_type,
        entity_id=entity_id,
        action_url=action_url,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    
    await local_notifier.send_notification(user_id=user_id, title=title, message=message)
    return alert
