from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.api.auth import get_current_user
from app.models.user import User, UserProfile
from app.models.scheme import Scheme

router = APIRouter(prefix="/sync", tags=["Mobile Offline Synchronization"])

class SyncOperation(BaseModel):
    id: str
    action: str  # SAVE_SCHEME, UNSAVE_SCHEME, UPDATE_PROFILE
    payload: Dict[str, Any]
    timestamp: str

class SyncRequest(BaseModel):
    last_sync_at: Optional[str] = None
    operations: List[SyncOperation] = []

@router.post("", status_code=status.HTTP_200_OK)
async def process_offline_sync(
    req: SyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    accepted_ids = []
    failed_ids = []

    for op in req.operations:
        try:
            if op.action == "UPDATE_PROFILE":
                stmt = select(UserProfile).filter(UserProfile.user_id == current_user.id)
                res = await db.execute(stmt)
                prof = res.scalars().first()
                if not prof:
                    prof = UserProfile(user_id=current_user.id)
                    db.add(prof)

                for key, val in op.payload.items():
                    if hasattr(prof, key):
                        setattr(prof, key, val)
                prof.updated_at = datetime.utcnow()
                accepted_ids.append(op.id)

            elif op.action in ("SAVE_SCHEME", "UNSAVE_SCHEME"):
                # Tracked on client/server preferences
                accepted_ids.append(op.id)

        except Exception:
            failed_ids.append(op.id)

    await db.commit()

    return {
        "status": "success",
        "accepted_operations": accepted_ids,
        "failed_operations": failed_ids,
        "server_time": datetime.utcnow().isoformat()
    }
