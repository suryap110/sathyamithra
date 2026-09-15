from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.scheme import Scheme
from app.models.user import User, UserProfile
from app.api.auth import get_current_user
from app.schemas.scheme import SchemeSchema
from app.schemas.eligibility import (
    EligibilityCheckRequest, 
    EligibilityResultResponse, 
    SchemeMatchResponse
)
from app.services.eligibility_engine import evaluate_scheme_eligibility
from app.services.recommendation_engine import get_personalized_recommendations

router = APIRouter(prefix="/eligibility", tags=["Eligibility Engine"])

class SimulationRequest(BaseModel):
    current_profile: Dict[str, Any]
    simulated_profile: Dict[str, Any]

class SimulationResponse(BaseModel):
    current_matches_count: int
    simulated_matches_count: int
    newly_eligible: List[SchemeMatchResponse]
    lost_eligibility: List[SchemeMatchResponse]
    net_potential_benefit_change: float

@router.post("/check", response_model=EligibilityResultResponse)
async def check_eligibility(
    req: EligibilityCheckRequest,
    db: AsyncSession = Depends(get_db)
):
    profile_dict = req.model_dump()
    stmt = select(Scheme).filter(Scheme.is_active == True).options(selectinload(Scheme.eligibility_rules))
    result = await db.execute(stmt)
    all_schemes = result.scalars().all()
    
    matches: List[SchemeMatchResponse] = []
    for scheme in all_schemes:
        match_res = evaluate_scheme_eligibility(scheme, profile_dict)
        matches.append(match_res)
        
    matches.sort(key=lambda x: x.match_percentage, reverse=True)
    return EligibilityResultResponse(
        total_schemes_evaluated=len(all_schemes),
        matches=matches
    )

@router.post("/recommend", response_model=List[SchemeMatchResponse])
async def recommend_schemes_for_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserProfile).filter(UserProfile.user_id == current_user.id))
    profile = result.scalars().first()
    
    profile_dict = {}
    if profile:
        profile_dict = {
            "age": profile.age,
            "gender": profile.gender,
            "state": profile.state,
            "annual_income": profile.annual_income,
            "occupation": profile.occupation,
            "is_student": profile.is_student,
            "is_farmer": profile.is_farmer,
            "is_disabled": profile.is_disabled,
            "social_category": profile.social_category
        }
        
    recommendations = await get_personalized_recommendations(db, profile_dict, limit=20)
    return recommendations

@router.post("/simulate", response_model=SimulationResponse)
async def simulate_eligibility_changes(
    req: SimulationRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Scheme).filter(Scheme.is_active == True).options(selectinload(Scheme.eligibility_rules))
    result = await db.execute(stmt)
    all_schemes = result.scalars().all()
    
    current_matches_map: Dict[str, SchemeMatchResponse] = {}
    simulated_matches_map: Dict[str, SchemeMatchResponse] = {}
    
    for scheme in all_schemes:
        c_res = evaluate_scheme_eligibility(scheme, req.current_profile)
        s_res = evaluate_scheme_eligibility(scheme, req.simulated_profile)
        
        if c_res.match_percentage >= 70:
            current_matches_map[scheme.id] = c_res
        if s_res.match_percentage >= 70:
            simulated_matches_map[scheme.id] = s_res

    newly_eligible: List[SchemeMatchResponse] = []
    lost_eligibility: List[SchemeMatchResponse] = []
    
    for s_id, s_res in simulated_matches_map.items():
        if s_id not in current_matches_map:
            newly_eligible.append(s_res)
            
    for c_id, c_res in current_matches_map.items():
        if c_id not in simulated_matches_map:
            lost_eligibility.append(c_res)
            
    cur_total_benefit = sum(m.scheme.estimated_benefit_amount or 0 for m in current_matches_map.values())
    sim_total_benefit = sum(m.scheme.estimated_benefit_amount or 0 for m in simulated_matches_map.values())
    
    return SimulationResponse(
        current_matches_count=len(current_matches_map),
        simulated_matches_count=len(simulated_matches_map),
        newly_eligible=newly_eligible,
        lost_eligibility=lost_eligibility,
        net_potential_benefit_change=sim_total_benefit - cur_total_benefit
    )
