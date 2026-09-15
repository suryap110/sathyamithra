import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_check_eligibility_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/eligibility/check", json={
            "age": 22,
            "gender": "Female",
            "state": "Tamil Nadu",
            "annual_income": 180000.0,
            "occupation": "Student",
            "is_student": True
        })
    assert response.status_code == 200
    data = response.json()
    assert "total_schemes_evaluated" in data
    assert len(data["matches"]) > 0

@pytest.mark.asyncio
async def test_simulate_eligibility_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/eligibility/simulate", json={
            "current_profile": {
                "annual_income": 400000.0,
                "state": "Tamil Nadu",
                "is_student": True
            },
            "simulated_profile": {
                "annual_income": 180000.0,
                "state": "Tamil Nadu",
                "is_student": True
            }
        })
    assert response.status_code == 200
    data = response.json()
    assert "current_matches_count" in data
    assert "simulated_matches_count" in data
    assert "newly_eligible" in data
