import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_alerts_and_preferences_flow():
    u1 = {"email": "alertuser1@sathyamithra.org", "password": "Password123", "full_name": "Alert User One"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        t1 = (await ac.post("/api/auth/register", json=u1)).json()["access_token"]
        h1 = {"Authorization": f"Bearer {t1}"}

        # 1. Unread count
        res_count = await ac.get("/api/alerts/unread-count", headers=h1)
        assert res_count.status_code == 200
        assert "unread_count" in res_count.json()

        # 2. Preferences
        res_pref = await ac.get("/api/alerts/preferences", headers=h1)
        assert res_pref.status_code == 200
        assert res_pref.json()["scheme_alerts"] == "ALL"

        # 3. Update Preferences
        update_payload = {"scheme_alerts": "IMPORTANT_ONLY", "document_alerts": "ALL"}
        res_up = await ac.put("/api/alerts/preferences", json=update_payload, headers=h1)
        assert res_up.status_code == 200
        assert res_up.json()["scheme_alerts"] == "IMPORTANT_ONLY"
