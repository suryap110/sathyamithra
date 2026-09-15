import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_family_member_crud_and_security():
    u1 = {"email": "famuser1@sathyamithra.org", "password": "Password123", "full_name": "Fam User One"}
    u2 = {"email": "famuser2@sathyamithra.org", "password": "Password123", "full_name": "Fam User Two"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        t1 = (await ac.post("/api/auth/register", json=u1)).json()["access_token"]
        t2 = (await ac.post("/api/auth/register", json=u2)).json()["access_token"]

        h1 = {"Authorization": f"Bearer {t1}"}
        h2 = {"Authorization": f"Bearer {t2}"}

        # 1. Create family member for User 1
        payload = {
            "name": "Father Test",
            "relationship": "Parent",
            "age": 52,
            "occupation": "Farmer",
            "employment_status": "Self-Employed",
            "annual_income": 180000.0,
            "is_farmer": True,
            "state": "Tamil Nadu",
            "district": "Chennai"
        }
        res_create = await ac.post("/api/family/members", json=payload, headers=h1)
        assert res_create.status_code == 201
        member = res_create.json()
        member_id = member["id"]

        # 2. List family members for User 1
        res_list = await ac.get("/api/family/members", headers=h1)
        assert res_list.status_code == 200
        assert len(res_list.json()) == 1

        # 3. Security Isolation: User 2 cannot access User 1's family member
        res_unauth = await ac.get(f"/api/family/members/{member_id}", headers=h2)
        assert res_unauth.status_code == 404

        # 4. Family recommendations for User 1
        res_recs = await ac.get("/api/family/recommendations", headers=h1)
        assert res_recs.status_code == 200
        assert "family_summary" in res_recs.json()

        # 5. Family Benefit Planner for User 1
        res_planner = await ac.get("/api/family/benefits", headers=h1)
        assert res_planner.status_code == 200
        assert "total_potential_benefit_estimate" in res_planner.json()

        # 6. Delete family member
        res_del = await ac.delete(f"/api/family/members/{member_id}", headers=h1)
        assert res_del.status_code == 204
