from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.scheme import Scheme, SchemeCategory, SchemeReport
from app.schemas.scheme import SchemeSchema, SchemeDetailSchema, SchemeCategorySchema, SchemeReportCreate

router = APIRouter(prefix="/schemes", tags=["Schemes"])

@router.get("", response_model=List[SchemeSchema])
async def list_schemes(
    state: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    ministry: Optional[str] = Query(None),
    benefit_type: Optional[str] = Query(None),
    application_mode: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Scheme).filter(Scheme.is_active == True)
    
    if state and state != "All":
        stmt = stmt.filter((Scheme.state.ilike(state)) | (Scheme.state == "Central"))
    if category_id:
        stmt = stmt.filter(Scheme.category_id == category_id)
    if ministry:
        stmt = stmt.filter(Scheme.ministry.ilike(f"%{ministry}%"))
    if benefit_type:
        stmt = stmt.filter(Scheme.benefit_type.ilike(f"%{benefit_type}%"))
    if application_mode and application_mode != "All":
        stmt = stmt.filter(Scheme.application_mode == application_mode)
    if search:
        search_fmt = f"%{search}%"
        stmt = stmt.filter(
            Scheme.title.ilike(search_fmt) | 
            Scheme.short_description.ilike(search_fmt) |
            Scheme.ministry.ilike(search_fmt) |
            Scheme.benefit_summary.ilike(search_fmt)
        )
    
    stmt = stmt.offset(offset).limit(limit)
    result = await db.execute(stmt)
    schemes = result.scalars().all()
    return schemes

@router.get("/categories", response_model=List[SchemeCategorySchema])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SchemeCategory))
    categories = result.scalars().all()
    return categories

@router.get("/states", response_model=List[str])
async def list_states(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Scheme.state).distinct())
    states = [s for s in result.scalars().all() if s]
    if "Central" not in states:
        states.insert(0, "Central")
    return sorted(list(set(states)))

@router.get("/{scheme_id}", response_model=SchemeDetailSchema)
async def get_scheme_detail(scheme_id: str, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Scheme)
        .filter(Scheme.id == scheme_id)
        .options(
            selectinload(Scheme.category),
            selectinload(Scheme.eligibility_rules),
            selectinload(Scheme.benefits),
            selectinload(Scheme.required_documents),
            selectinload(Scheme.application_steps),
            selectinload(Scheme.faqs),
        )
    )
    result = await db.execute(stmt)
    scheme = result.scalars().first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")
    return scheme

@router.post("/{scheme_id}/report", status_code=status.HTTP_201_CREATED)
async def report_scheme(
    scheme_id: str,
    report_in: SchemeReportCreate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Scheme).filter(Scheme.id == scheme_id))
    scheme = result.scalars().first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")
        
    report = SchemeReport(
        scheme_id=scheme_id,
        reason=report_in.reason,
        details=report_in.details
    )
    db.add(report)
    await db.commit()
    return {"status": "reported", "message": "Thank you for helping keep Sathyamithra accurate."}
