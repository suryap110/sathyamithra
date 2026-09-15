import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_community_qna_and_reporting():
    u1 = {"email": "commuser1@sathyamithra.org", "password": "Password123", "full_name": "Comm User One"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        t1 = (await ac.post("/api/auth/register", json=u1)).json()["access_token"]
        h1 = {"Authorization": f"Bearer {t1}"}

        # 1. Post a question
        q_payload = {
            "title": "What documents are needed for Pudhumai Penn scholarship?",
            "question": "I studied in a TN government school from class 6 to 12. What certificates must I submit?",
            "category": "Education",
            "state": "Tamil Nadu",
            "district": "Chennai"
        }
        res_q = await ac.post("/api/community/questions", json=q_payload, headers=h1)
        assert res_q.status_code == 201
        q_id = res_q.json()["id"]

        # 2. List questions
        res_list = await ac.get("/api/community/questions?state=Tamil Nadu")
        assert res_list.status_code == 200
        assert len(res_list.json()) >= 1

        # 3. Post an answer
        a_payload = {"answer": "You need your Aadhaar card and School Bonafide Certificate."}
        res_a = await ac.post(f"/api/community/questions/{q_id}/answers", json=a_payload, headers=h1)
        assert res_a.status_code == 201
        a_id = res_a.json()["id"]

        # 4. Report answer
        rep_payload = {"reason": "Incorrect information", "details": "Optional note"}
        res_rep = await ac.post(f"/api/community/answers/{a_id}/report", json=rep_payload, headers=h1)
        assert res_rep.status_code == 201
