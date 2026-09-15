from typing import Dict, Any, List
from app.models.scheme import Scheme
from app.schemas.eligibility import SchemeMatchResponse, EligibilityReason

def evaluate_scheme_eligibility(scheme: Scheme, profile: Dict[str, Any]) -> SchemeMatchResponse:
    match_score = 100
    reasons: List[EligibilityReason] = []
    warnings: List[str] = []
    
    # Extract user traits
    user_age = profile.get("age")
    user_state = profile.get("state")
    user_income = profile.get("annual_income")
    user_gender = profile.get("gender")
    user_occupation = profile.get("occupation")
    is_student = profile.get("is_student", False)
    is_farmer = profile.get("is_farmer", False)
    is_disabled = profile.get("is_disabled", False)
    social_cat = profile.get("social_category")

    # 1. State Coverage Check
    if scheme.state != "Central" and user_state:
        if scheme.state.lower() == user_state.lower():
            reasons.append(EligibilityReason(
                criterion="State Coverage",
                matched=True,
                details=f"Scheme specifically covers residents of {scheme.state}."
            ))
        else:
            match_score -= 40
            reasons.append(EligibilityReason(
                criterion="State Coverage",
                matched=False,
                details=f"Scheme applies to {scheme.state}, but reported state is {user_state}."
            ))
    else:
        reasons.append(EligibilityReason(
            criterion="State Coverage",
            matched=True,
            details="Central Government scheme applicable across all Indian States & Union Territories."
        ))

    # 2. Rule-based checks from scheme.eligibility_rules if available
    rules = scheme.eligibility_rules if hasattr(scheme, "eligibility_rules") and scheme.eligibility_rules else []
    
    for rule in rules:
        # Age check
        if rule.min_age or rule.max_age:
            if user_age is not None:
                if (rule.min_age and user_age < rule.min_age) or (rule.max_age and user_age > rule.max_age):
                    match_score -= 25
                    reasons.append(EligibilityReason(
                        criterion="Age Eligibility",
                        matched=False,
                        details=f"Allowed age: {rule.min_age or 0} - {rule.max_age or 100} years. Your age: {user_age}."
                    ))
                else:
                    reasons.append(EligibilityReason(
                        criterion="Age Eligibility",
                        matched=True,
                        details=f"Your age ({user_age}) falls within the eligible age group ({rule.min_age or 0}-{rule.max_age or 100})."
                    ))

        # Income limit check
        if rule.max_income:
            if user_income is not None:
                if user_income > rule.max_income:
                    match_score -= 30
                    reasons.append(EligibilityReason(
                        criterion="Annual Income Limit",
                        matched=False,
                        details=f"Stated income ceiling: ₹{rule.max_income:,.0f}. Reported household income: ₹{user_income:,.0f}."
                    ))
                else:
                    reasons.append(EligibilityReason(
                        criterion="Annual Income Limit",
                        matched=True,
                        details=f"Reported income (₹{user_income:,.0f}) is below the ₹{rule.max_income:,.0f} maximum ceiling."
                    ))

        # Gender check
        if rule.target_gender and rule.target_gender != "All":
            if user_gender and rule.target_gender.lower() != user_gender.lower():
                match_score -= 40
                reasons.append(EligibilityReason(
                    criterion="Gender Requirement",
                    matched=False,
                    details=f"Scheme specifically targets {rule.target_gender} beneficiaries."
                ))
            elif user_gender:
                reasons.append(EligibilityReason(
                    criterion="Gender Requirement",
                    matched=True,
                    details=f"Gender ({user_gender}) matches scheme criteria."
                ))

        # Farmer check
        if rule.requires_farmer_status:
            user_is_farmer = is_farmer or (user_occupation and "farmer" in user_occupation.lower())
            if not user_is_farmer:
                match_score -= 40
                reasons.append(EligibilityReason(
                    criterion="Farmer / Cultivator Status",
                    matched=False,
                    details="Scheme requires active farmer or landholding cultivator status."
                ))
            else:
                reasons.append(EligibilityReason(
                    criterion="Farmer / Cultivator Status",
                    matched=True,
                    details="Active farmer status satisfies program requirements."
                ))

        # Student check
        if rule.requires_student_status:
            user_is_student = is_student or (user_occupation and "student" in user_occupation.lower())
            if not user_is_student:
                match_score -= 35
                reasons.append(EligibilityReason(
                    criterion="Student Status",
                    matched=False,
                    details="Scheme requires enrolled student or apprentice status."
                ))
            else:
                reasons.append(EligibilityReason(
                    criterion="Student Status",
                    matched=True,
                    details="Enrolled student status satisfies criteria."
                ))

        # Disability check
        if rule.requires_disability:
            if not is_disabled:
                match_score -= 45
                reasons.append(EligibilityReason(
                    criterion="Disability Requirement",
                    matched=False,
                    details="Scheme specifically supports persons with disabilities (PwD)."
                ))
            else:
                reasons.append(EligibilityReason(
                    criterion="Disability Requirement",
                    matched=True,
                    details="Persons with Disabilities (PwD) qualification matched."
                ))

        # Occupation check
        if rule.required_occupations:
            if user_occupation and any(occ.lower() in user_occupation.lower() for occ in rule.required_occupations):
                reasons.append(EligibilityReason(
                    criterion="Occupation / Work Status",
                    matched=True,
                    details=f"Occupation ({user_occupation}) satisfies targeted criteria."
                ))
            else:
                match_score -= 20
                reasons.append(EligibilityReason(
                    criterion="Occupation / Work Status",
                    matched=False,
                    details=f"Targeted occupations: {', '.join(rule.required_occupations)}."
                ))

    # Keyword / Title Heuristic checks
    title_lower = scheme.title.lower()
    desc_lower = scheme.short_description.lower()
    
    if "scholarship" in title_lower or "student" in title_lower:
        if is_student or (user_occupation and "student" in user_occupation.lower()):
            reasons.append(EligibilityReason(
                criterion="Student Status",
                matched=True,
                details="Student status matches education / scholarship program goals."
            ))
        else:
            match_score -= 20
            reasons.append(EligibilityReason(
                criterion="Student Status",
                matched=False,
                details="Scheme targets enrolled students."
            ))
            
    if "kisan" in title_lower or "farmer" in title_lower or "agri" in desc_lower:
        if is_farmer or (user_occupation and "farmer" in user_occupation.lower()):
            reasons.append(EligibilityReason(
                criterion="Farmer / Agriculture Status",
                matched=True,
                details="Farmer status matches agricultural support program."
            ))

    # Document warnings
    if user_income and user_income < 300000:
        warnings.append("Valid Income Certificate will be required at submission.")

    final_score = max(10, min(100, match_score))
    confidence = "High" if final_score >= 80 else ("Medium" if final_score >= 50 else "Low")

    # Serialize scheme without deep recursion issue
    from app.schemas.scheme import SchemeSchema
    scheme_dto = SchemeSchema.model_validate(scheme)

    return SchemeMatchResponse(
        scheme=scheme_dto,
        match_percentage=final_score,
        confidence_level=confidence,
        reasons=reasons,
        warnings=warnings
    )
