import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_application_tracking_flow_and_security_isolation():
    u1 = {"email": "appuser1@sathyamithra.org", "password": "Password123", "full_name": "App User One"}
    u2 = {"email": "appuser2@sathyamithra.org", "password": "Password123", "full_name": "App User Two"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        t1 = (await ac.post("/api/auth/register", json=u1)).json()["access_token"]
        t2 = (await ac.post("/api/auth/register", json=u2)).json()["access_token"]

        h1 = {"Authorization": f"Bearer {t1}"}
        h2 = {"Authorization": f"Bearer {t2}"}

        # Fetch active scheme ID
        schemes = (await ac.get("/api/schemes")).json()
        assert len(schemes) > 0
        scheme_id = schemes[0]["id"]

        # 1. User 1 creates an application
        create_resp = await ac.post("/api/applications", headers=h1, json={
            "scheme_id": scheme_id,
            "notes": "Testing application creation"
        })
        assert create_resp.status_code == 201
        app_data = create_resp.json()
        app_id = app_data["id"]
        assert app_data["status"] == "DRAFT"
        assert app_data["reference_number"].startswith("SM-2026-")

        # 2. User 1 updates status to SUBMITTED
        update_resp = await ac.post(f"/api/applications/{app_id}/status", headers=h1, json={
            "status": "SUBMITTED",
            "notes": "Submitted online via portal"
        })
        assert update_resp.status_code == 200
        assert update_resp.json()["status"] == "SUBMITTED"

        # 3. Check status timeline for User 1
        timeline_resp = await ac.get(f"/api/applications/{app_id}/timeline", headers=h1)
        assert timeline_resp.status_code == 200
        history = timeline_resp.json()
        assert len(history) >= 2  # DRAFT and SUBMITTED entries

        # 4. SECURITY ISOLATION TEST: User 2 MUST NOT be able to access User 1's application
        unauth_get = await ac.get(f"/api/applications/{app_id}", headers=h2)
        assert unauth_get.status_code == 404

        unauth_timeline = await ac.get(f"/api/applications/{app_id}/timeline", headers=h2)
        assert unauth_timeline.status_code == 404

        unauth_status = await ac.post(f"/api/applications/{app_id}/status", headers=h2, json={"status": "APPROVED"})
        assert unauth_status.status_code == 404

        unauth_del = await ac.delete(f"/api/applications/{app_id}", headers=h2)
        assert unauth_del.status_code == 404

        # 5. User 1 dashboard summary check
        summary_resp = await ac.get("/api/applications", headers=h1)
        assert summary_resp.status_code == 200
        summary_data = summary_resp.json()
        assert summary_data["total_applications"] >= 1
