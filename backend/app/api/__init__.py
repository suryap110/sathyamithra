from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.schemes import router as schemes_router
from app.api.eligibility import router as eligibility_router
from app.api.assistant import router as assistant_router
from app.api.documents import router as documents_router
from app.api.applications import router as applications_router
from app.api.family import router as family_router
from app.api.life_events import router as life_events_router
from app.api.alerts import router as alerts_router
from app.api.community import router as community_router
from app.api.locations import router as locations_router
from app.api.admin import router as admin_router
from app.api.devices import router as devices_router
from app.api.sync import router as sync_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(schemes_router)
api_router.include_router(eligibility_router)
api_router.include_router(assistant_router)
api_router.include_router(documents_router)
api_router.include_router(applications_router)
api_router.include_router(family_router, prefix="/family", tags=["Family"])
api_router.include_router(life_events_router, prefix="/life-events", tags=["Life Events"])
api_router.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(community_router, prefix="/community", tags=["Community"])
api_router.include_router(locations_router, prefix="/locations", tags=["Locations"])
api_router.include_router(admin_router)
api_router.include_router(devices_router)
api_router.include_router(sync_router)
