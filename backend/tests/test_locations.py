import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_locations_search():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        search_payload = {
            "state": "Tamil Nadu",
            "district": "Chennai"
        }
        res = await ac.post("/api/locations/search", json=search_payload)
        assert res.status_code == 200
        data = res.json()
        assert "support_centers" in data
        assert data["state"] == "Tamil Nadu"
        assert data["district"] == "Chennai"
