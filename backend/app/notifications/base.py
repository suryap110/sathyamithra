from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class NotificationProvider(ABC):
    @abstractmethod
    async def send_notification(self, user_id: str, title: str, message: str, payload: Optional[Dict[str, Any]] = None) -> bool:
        pass

class LocalNotificationProvider(NotificationProvider):
    """In-app local notification logger and store integration."""
    async def send_notification(self, user_id: str, title: str, message: str, payload: Optional[Dict[str, Any]] = None) -> bool:
        logger.info(f"[LocalNotification] Delivered to user {user_id}: {title} - {message}")
        return True

class MobilePushProvider(NotificationProvider):
    """
    Abstraction for FCM / Expo / Web Push mobile notifications.
    Prepared for future push delivery integration.
    """
    async def send_notification(self, user_id: str, title: str, message: str, payload: Optional[Dict[str, Any]] = None) -> bool:
        logger.info(f"[MobilePushProvider] Prepared payload for push token dispatch: {user_id} - {title}")
        return True
