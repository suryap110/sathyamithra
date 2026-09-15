from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.api.auth import get_current_user
from app.models.user import User, UserProfile
from app.models.life_event import LifeEvent
from app.schemas.life_event import (
    LifeEventCreate,
    LifeEventResponse,
    LifeEventAnalysisResponse
)
from app.services.recommendation_engine import get_personalized_recommendations
from app.services.alert_service import create_smart_alert

router = APIRouter()

@router.get("", response_model=List[LifeEventResponse])
async def list_life_events(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LifeEvent).filter(LifeEvent.user_id == current_user.id).order_by(LifeEvent.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=LifeEventResponse, status_code=status.HTTP_201_CREATED)
async def create_life_event(
    event_in: LifeEventCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    event = LifeEvent(
        user_id=current_user.id,
        **event_in.model_dump()
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)

    # Automatically trigger a smart alert
    await create_smart_alert(
        db=db,
        user_id=current_user.id,
        alert_type="LIFE_EVENT_RECOMMENDATION",
        title=f"Life Event Logged: {event.event_type.replace('_', ' ').title()}",
        message="Your profile recommendations have been updated based on your latest life milestone.",
        severity="INFO",
        entity_type="life_event",
        entity_id=event.id,
        action_url="/life-events"
    )

    return event

@router.get("/{event_id}", response_model=LifeEventResponse)
async def get_life_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LifeEvent).filter(LifeEvent.id == event_id, LifeEvent.user_id == current_user.id)
    res = await db.execute(stmt)
    event = res.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Life event not found")
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_life_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LifeEvent).filter(LifeEvent.id == event_id, LifeEvent.user_id == current_user.id)
    res = await db.execute(stmt)
    event = res.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Life event not found")
    
    await db.delete(event)
    await db.commit()
    return None

@router.post("/{event_id}/analyze", response_model=LifeEventAnalysisResponse)
async def analyze_life_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LifeEvent).filter(LifeEvent.id == event_id, LifeEvent.user_id == current_user.id)
    res = await db.execute(stmt)
    event = res.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Life event not found")

    # Map life event type to updated profile attributes & relevant categories
    attr_map = {}
    categories = []
    
    if event.event_type == "COLLEGE_START":
        attr_map["is_student"] = True
        categories = ["Education & Scholarships"]
    elif event.event_type == "GRADUATION":
        attr_map["education_level"] = "Graduate"
        attr_map["employment_status"] = "Unemployed"
        categories = ["Education & Scholarships", "Business & Entrepreneurship"]
    elif event.event_type == "BUSINESS_START":
        attr_map["is_business_owner"] = True
        attr_map["employment_status"] = "Self-Employed"
        categories = ["Business & Entrepreneurship"]
    elif event.event_type == "FARMER_STATUS":
        attr_map["is_farmer"] = True
        categories = ["Agriculture & Farmers"]
    elif event.event_type == "SENIOR_CITIZEN":
        attr_map["is_senior_citizen"] = True
        categories = ["Senior Citizens & Pension", "Healthcare & Wellness"]
    else:
        categories = ["Education & Scholarships", "Healthcare & Wellness"]

    stmt_prof = select(UserProfile).filter(UserProfile.user_id == current_user.id)
    res_prof = await db.execute(stmt_prof)
    user_prof = res_prof.scalars().first()

    # Evaluate recommendations using updated context
    profile_dict = {
        "age": user_prof.age if user_prof and user_prof.age else 25,
        "state": user_prof.state if user_prof and user_prof.state else "Central",
        "gender": user_prof.gender if user_prof and user_prof.gender else "Male",
        "annual_income": user_prof.annual_income if user_prof and user_prof.annual_income else 0.0,
        **attr_map
    }

    recs = await get_personalized_recommendations(db, profile_dict, limit=5)
    matched = [r for r in recs if r.match_percentage >= 50]

    return LifeEventAnalysisResponse(
        event_id=event.id,
        event_type=event.event_type,
        impact_summary=f"Event '{event.event_type}' analyzed. Found {len(matched)} schemes for your updated lifecycle status.",
        updated_profile_attributes=attr_map,
        recommended_categories=categories,
        matched_schemes=matched
    )
