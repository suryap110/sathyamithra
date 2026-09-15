from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.family import FamilyMember
from app.services.recommendation_engine import get_personalized_recommendations
from app.schemas.family import FamilyMemberRecommendation, BenefitItem, FamilyPlannerResponse

def family_member_to_profile(member: FamilyMember) -> Dict[str, Any]:
    """Convert FamilyMember ORM model to eligibility profile dictionary."""
    return {
        "age": member.age,
        "date_of_birth": member.date_of_birth,
        "gender": member.gender,
        "state": member.state or "Central",
        "district": member.district,
        "education_level": member.education_level,
        "occupation": member.occupation,
        "employment_status": member.employment_status,
        "annual_income": member.annual_income or 0.0,
        "social_category": member.social_category or "General",
        "is_student": member.is_student or False,
        "is_farmer": member.is_farmer or False,
        "is_disabled": member.is_disabled or False,
        "disability_percentage": member.disability_percentage,
        "is_senior_citizen": member.is_senior_citizen or False,
        "is_business_owner": member.is_business_owner or False,
        "marital_status": member.marital_status,
    }

async def get_family_recommendations(db: AsyncSession, family_members: List[FamilyMember]) -> List[FamilyMemberRecommendation]:
    results: List[FamilyMemberRecommendation] = []
    
    for member in family_members:
        profile_dict = family_member_to_profile(member)
        recs = await get_personalized_recommendations(db, profile_dict, limit=5)
        # Filter for match_percentage >= 50%
        matched = [r for r in recs if r.match_percentage >= 50]
        results.append(
            FamilyMemberRecommendation(
                member_id=member.id,
                member_name=member.name,
                relationship=member.relationship,
                matches_count=len(matched),
                matches=matched
            )
        )
    return results

async def generate_family_benefit_planner(db: AsyncSession, family_members: List[FamilyMember]) -> FamilyPlannerResponse:
    benefit_items: List[BenefitItem] = []
    total_benefit = 0.0
    optimization_notes: List[str] = []
    
    member_schemes_map: Dict[str, List[str]] = {}
    
    for member in family_members:
        profile_dict = family_member_to_profile(member)
        recs = await get_personalized_recommendations(db, profile_dict, limit=3)
        matched = [r for r in recs if r.match_percentage >= 60]
        
        member_schemes_map[member.name] = [m.scheme.title for m in matched]
        
        for m in matched:
            amount = m.scheme.estimated_benefit_amount or 0.0
            total_benefit += amount
            benefit_items.append(
                BenefitItem(
                    member_name=member.name,
                    relationship=member.relationship,
                    scheme_id=m.scheme.id,
                    scheme_title=m.scheme.title,
                    estimated_benefit=f"₹{amount:,.0f}" if amount > 0 else "Non-Monetary Benefit",
                    status=f"{m.match_percentage}% Match",
                    disclaimer="Estimated benefit • Subject to department approval"
                )
            )

    # Overlap optimization check
    if len(family_members) > 1:
        optimization_notes.append(f"{len(family_members)} family members evaluated for overlapping welfare programs.")
        optimization_notes.append("Benefit compatibility across multiple family members should be verified directly with the government department.")
    else:
        optimization_notes.append("Add more family members to discover multi-beneficiary household schemes.")

    return FamilyPlannerResponse(
        total_potential_benefit_estimate=total_benefit,
        items=benefit_items,
        optimization_notes=optimization_notes
    )
