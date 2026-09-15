import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_admin_login_and_rbac_protection():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Unauthenticated request should fail (401)
        resp = await ac.get("/api/admin/stats")
        assert resp.status_code == 401

        # Login as Admin
        admin_login = await ac.post("/api/auth/login", json={
            "email": "admin@sathyamithra.gov.in",
            "password": "Admin@12345"
        })
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # Admin stats should succeed (200)
        stats_resp = await ac.get("/api/admin/stats", headers=admin_headers)
        assert stats_resp.status_code == 200
        data = stats_resp.json()
        assert "total_schemes" in data
        assert "freshness_score" in data

        # Login as Regular User
        user_reg = await ac.post("/api/auth/register", json={
            "email": "regularcitizen@example.com",
            "password": "User@12345",
            "full_name": "Citizen User"
        })
        user_token = user_reg.json()["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}

        # Regular user accessing admin stats should fail with 403 Forbidden
        user_admin_access = await ac.get("/api/admin/stats", headers=user_headers)
        assert user_admin_access.status_code == 403

@pytest.mark.asyncio
async def test_admin_scheme_crud_and_verification():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post("/api/auth/login", json={
            "email": "admin@sathyamithra.gov.in",
            "password": "Admin@12345"
        })
        headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

        # 1. Create a scheme as admin
        create_res = await ac.post("/api/admin/schemes", headers=headers, json={
            "title": "TN Chief Minister Fellowship Scheme 2026",
            "short_description": "2-year fellowship for young professionals in government governance.",
            "detailed_description": "Provides monthly stipend of ₹75,000 to selected fellows working with departments.",
            "state": "Tamil Nadu",
            "ministry": "Special Initiatives Department",
            "benefit_type": "Fellowship",
            "estimated_benefit_amount": 900000.0,
            "status": "DRAFT",
            "official_url": "https://cmfellowship.tn.gov.in"
        })
        assert create_res.status_code == 201
        scheme_id = create_res.json()["scheme_id"]

        # 2. Verify scheme workflow
        verify_res = await ac.post(f"/api/admin/schemes/{scheme_id}/verify", headers=headers, json={
            "status": "VERIFIED",
            "notes": "Verified against official TN Gazette notification.",
            "checks_performed": {
                "source_url": True,
                "content_accurate": True
            }
        })
        assert verify_res.status_code == 200

        # 3. Publish scheme
        pub_res = await ac.post(f"/api/admin/schemes/{scheme_id}/publish", headers=headers)
        assert pub_res.status_code == 200

        # 4. Check audit log
        audit_res = await ac.get("/api/admin/audit-logs", headers=headers)
        assert audit_res.status_code == 200
        logs = audit_res.json()
        assert len(logs) > 0
