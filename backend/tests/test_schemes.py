import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_list_schemes():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/schemes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

@pytest.mark.asyncio
async def test_filter_schemes_by_state():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/schemes?state=Tamil Nadu")
    assert response.status_code == 200
    data = response.json()
    assert any(s["state"] in ["Tamil Nadu", "Central"] for s in data)

@pytest.mark.asyncio
async def test_list_categories_and_states():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        cat_resp = await ac.get("/api/schemes/categories")
        state_resp = await ac.get("/api/schemes/states")
    
    assert cat_resp.status_code == 200
    assert state_resp.status_code == 200
    assert len(cat_resp.json()) > 0
    assert "Central" in state_resp.json()

@pytest.mark.asyncio
async def test_get_scheme_detail():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        list_resp = await ac.get("/api/schemes")
        first_id = list_resp.json()[0]["id"]

        detail_resp = await ac.get(f"/api/schemes/{first_id}")
    
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == first_id
    assert "title" in detail
    assert "required_documents" in detail
    assert "application_steps" in detail
    assert "faqs" in detail
