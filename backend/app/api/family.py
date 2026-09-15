from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.family import FamilyMember
from app.schemas.family import (
    FamilyMemberCreate,
    FamilyMemberUpdate,
    FamilyMemberResponse,
    FamilyRecommendationsResponse,
    FamilyPlannerResponse
)
from app.services.family_engine import get_family_recommendations, generate_family_benefit_planner

router = APIRouter()

@router.get("", response_model=List[FamilyMemberResponse])
@router.get("/members", response_model=List[FamilyMemberResponse])
async def list_family_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FamilyMember).filter(FamilyMember.user_id == current_user.id).order_by(FamilyMember.created_at)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
@router.post("/members", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
async def create_family_member(
    member_in: FamilyMemberCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    member = FamilyMember(
        user_id=current_user.id,
        **member_in.model_dump()
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)
    return member

@router.get("/members/{member_id}", response_model=FamilyMemberResponse)
async def get_family_member(
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FamilyMember).filter(FamilyMember.id == member_id, FamilyMember.user_id == current_user.id)
    res = await db.execute(stmt)
    member = res.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    return member

@router.put("/members/{member_id}", response_model=FamilyMemberResponse)
async def update_family_member(
    member_id: str,
    member_in: FamilyMemberUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FamilyMember).filter(FamilyMember.id == member_id, FamilyMember.user_id == current_user.id)
    res = await db.execute(stmt)
    member = res.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    update_data = member_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(member, field, val)
        
    await db.commit()
    await db.refresh(member)
    return member

@router.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_member(
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FamilyMember).filter(FamilyMember.id == member_id, FamilyMember.user_id == current_user.id)
    res = await db.execute(stmt)
    member = res.scalars().first()
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
    
    await db.delete(member)
    await db.commit()
    return None

@router.get("/recommendations", response_model=FamilyRecommendationsResponse)
async def get_family_member_recommendations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FamilyMember).filter(FamilyMember.user_id == current_user.id)
    res = await db.execute(stmt)
    members = res.scalars().all()
    
    member_recs = await get_family_recommendations(db, members)
    summary = f"Identified potential scheme matches across {len(members)} family members."
    
    return FamilyRecommendationsResponse(
        family_summary=summary,
        member_recommendations=member_recs
    )

@router.get("/benefits", response_model=FamilyPlannerResponse)
async def get_family_benefits_planner(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FamilyMember).filter(FamilyMember.user_id == current_user.id)
    res = await db.execute(stmt)
    members = res.scalars().all()
    
    return await generate_family_benefit_planner(db, members)
