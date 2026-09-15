from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.models.location import Location
from app.models.scheme import Scheme
from app.schemas.location import (
    LocationSearchRequest,
    LocationResponse,
    HyperlocalDiscoveryResponse
)

router = APIRouter()

@router.get("", response_model=List[LocationResponse])
@router.get("/centers", response_model=List[LocationResponse])
async def list_locations(
    state: Optional[str] = None,
    district: Optional[str] = None,
    type: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Location)
    if state:
        stmt = stmt.filter(Location.state == state)
    if district:
        stmt = stmt.filter(Location.district == district)
    if type:
        stmt = stmt.filter(Location.type == type)
        
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/{id}", response_model=LocationResponse)
async def get_location(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Location).filter(Location.id == id)
    res = await db.execute(stmt)
    loc = res.scalars().first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc

@router.post("/search", response_model=HyperlocalDiscoveryResponse)
async def search_hyperlocal_support(
    req: LocationSearchRequest,
    db: AsyncSession = Depends(get_db)
):
    state_filter = req.state or "Tamil Nadu"
    district_filter = req.district or "Chennai"

    # Support centers query
    stmt_loc = select(Location).filter(Location.state == state_filter, Location.district == district_filter)
    if req.type:
        stmt_loc = stmt_loc.filter(Location.type == req.type)
        
    res_loc = await db.execute(stmt_loc)
    centers = res_loc.scalars().all()

    # Schemes query
    stmt_central = select(Scheme).filter(Scheme.state == "Central", Scheme.is_active == True)
    res_central = await db.execute(stmt_central)
    central_count = len(res_central.scalars().all())

    stmt_state = select(Scheme).filter(Scheme.state == state_filter, Scheme.is_active == True)
    res_state = await db.execute(stmt_state)
    state_count = len(res_state.scalars().all())

    return HyperlocalDiscoveryResponse(
        location_summary=f"Showing support centers and scheme discovery for {district_filter}, {state_filter}.",
        state=state_filter,
        district=district_filter,
        support_centers=centers,
        central_schemes_count=central_count,
        state_schemes_count=state_count,
        district_schemes_count=len(centers)
    )
