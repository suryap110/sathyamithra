import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_life_events_flow_and_security():
    u1 = {"email": "lifeuser1@sathyamithra.org", "password": "Password123", "full_name": "Life User One"}
    u2 = {"email": "lifeuser2@sathyamithra.org", "password": "Password123", "full_name": "Life User Two"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        t1 = (await ac.post("/api/auth/register", json=u1)).json()["access_token"]
        t2 = (await ac.post("/api/auth/register", json=u2)).json()["access_token"]

        h1 = {"Authorization": f"Bearer {t1}"}
        h2 = {"Authorization": f"Bearer {t2}"}

        # 1. Create life event for User 1
        payload = {
            "event_type": "GRADUATION",
            "event_date": "2026-06-01",
            "description": "Graduated with B.Tech degree"
        }
        res_create = await ac.post("/api/life-events", json=payload, headers=h1)
        assert res_create.status_code == 201
        event = res_create.json()
        event_id = event["id"]

        # 2. Security Isolation: User 2 cannot access User 1's life event
        res_unauth = await ac.get(f"/api/life-events/{event_id}", headers=h2)
        assert res_unauth.status_code == 404

        # 3. Analyze life event
        res_analyze = await ac.post(f"/api/life-events/{event_id}/analyze", headers=h1)
        assert res_analyze.status_code == 200
        analysis = res_analyze.json()
        assert "impact_summary" in analysis

        # 4. Delete life event
        res_del = await ac.delete(f"/api/life-events/{event_id}", headers=h1)
        assert res_del.status_code == 204
