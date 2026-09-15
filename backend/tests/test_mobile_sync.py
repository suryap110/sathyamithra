import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_mobile_device_registration():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        user_reg = await ac.post("/api/auth/register", json={
            "email": "mobileuser1@sathyamithra.org",
            "password": "MobileUser@12345",
            "full_name": "Mobile Citizen 1"
        })
        assert user_reg.status_code == 201
        token = user_reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        dev_res = await ac.post("/api/devices/register", headers=headers, json={
            "push_token": "ExponentPushToken[AbCdEf12345]",
            "platform": "android",
            "device_id": "emulator-5554",
            "app_version": "1.0.0",
            "locale": "ta"
        })
        assert dev_res.status_code == 200
        assert dev_res.json()["push_token"] == "ExponentPushToken[AbCdEf12345]"

        unreg_res = await ac.delete("/api/devices/ExponentPushToken[AbCdEf12345]", headers=headers)
        assert unreg_res.status_code == 200

@pytest.mark.asyncio
async def test_mobile_offline_sync():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        user_reg = await ac.post("/api/auth/register", json={
            "email": "mobileuser2@sathyamithra.org",
            "password": "MobileUser@12345",
            "full_name": "Mobile Citizen 2"
        })
        assert user_reg.status_code == 201
        token = user_reg.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        sync_res = await ac.post("/api/sync", headers=headers, json={
            "last_sync_at": "2026-09-08T10:00:00Z",
            "operations": [
                {
                    "id": "op-1",
                    "action": "UPDATE_PROFILE",
                    "payload": {"age": 28, "occupation": "Farmer", "state": "Tamil Nadu"},
                    "timestamp": "2026-09-08T12:00:00Z"
                },
                {
                    "id": "op-2",
                    "action": "SAVE_SCHEME",
                    "payload": {"scheme_id": "s1"},
                    "timestamp": "2026-09-08T12:05:00Z"
                }
            ]
        })
        assert sync_res.status_code == 200
        data = sync_res.json()
        assert data["status"] == "success"
        assert "op-1" in data["accepted_operations"]
        assert "op-2" in data["accepted_operations"]
