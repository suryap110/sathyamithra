import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_auth_registration_and_login():
    test_user = {
        "email": "testcitizen@sathyamithra.org",
        "password": "SecurePassword123",
        "full_name": "Test Citizen"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register
        reg_resp = await ac.post("/api/auth/register", json=test_user)
        assert reg_resp.status_code == 201
        data = reg_resp.json()
        assert "access_token" in data
        assert data["email"] == test_user["email"]

        # Login
        login_resp = await ac.post("/api/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"]
        })
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        token = token_data["access_token"]

        # Get Current User
        me_resp = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == test_user["email"]
