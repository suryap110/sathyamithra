from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.models.scheme import Scheme
from app.services.eligibility_engine import evaluate_scheme_eligibility
from app.schemas.eligibility import SchemeMatchResponse

async def get_personalized_recommendations(db: AsyncSession, profile_dict: Dict[str, Any], limit: int = 10) -> List[SchemeMatchResponse]:
    stmt = (
        select(Scheme)
        .filter(Scheme.is_active == True)
        .options(selectinload(Scheme.eligibility_rules))
    )
    result = await db.execute(stmt)
    schemes = result.scalars().all()
    
    evaluated: List[SchemeMatchResponse] = []
    for scheme in schemes:
        match_resp = evaluate_scheme_eligibility(scheme, profile_dict)
        evaluated.append(match_resp)
        
    # Rank by match percentage descending, then benefit amount descending
    evaluated.sort(
        key=lambda x: (
            x.match_percentage, 
            x.scheme.estimated_benefit_amount or 0
        ), 
        reverse=True
    )
    
    return evaluated[:limit]
