from typing import Dict, Any
import logging

logger = logging.getLogger("sathyamithra.events")

def dispatch_event(event_name: str, payload: Dict[str, Any]):
    """
    Notification-ready event dispatcher for Phase 5.
    Prepares hooks for Phase 6 push notifications and alerts.
    
    Supported Event Types:
    - DOCUMENT_UPLOADED
    - DOCUMENT_EXPIRING
    - DOCUMENT_EXPIRED
    - APPLICATION_CREATED
    - APPLICATION_STATUS_CHANGED
    - DOCUMENTS_PENDING
    - APPLICATION_APPROVED
    - APPLICATION_REJECTED
    - APPLICATION_DISBURSED
    """
    logger.info(f"[EVENT DISPATCHED] {event_name}: user_id={payload.get('user_id')}, details={payload}")
