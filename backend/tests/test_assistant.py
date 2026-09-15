import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_assistant_chat_flow():
    test_user = {
        "email": "assistantcitizen@sathyamithra.org",
        "password": "SecurePassword123",
        "full_name": "Assistant Citizen"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register user
        reg_resp = await ac.post("/api/auth/register", json=test_user)
        token = reg_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Send English chat query
        chat_resp = await ac.post("/api/assistant/chat", headers=headers, json={
            "message": "What scholarships can I get in Tamil Nadu?",
            "language": "en"
        })
        assert chat_resp.status_code == 200
        data = chat_resp.json()
        assert "answer" in data
        assert "sources" in data
        assert "disclaimer" in data
        assert data["language"] == "en"
        session_id = data["session_id"]

        # Fetch session history
        history_resp = await ac.get(f"/api/assistant/sessions/{session_id}", headers=headers)
        assert history_resp.status_code == 200
        assert len(history_resp.json()["messages"]) >= 2

@pytest.mark.asyncio
async def test_assistant_multilingual_tamil_and_hindi():
    test_user = {
        "email": "multilingualcitizen@sathyamithra.org",
        "password": "SecurePassword123",
        "full_name": "Tamil Citizen"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        reg_resp = await ac.post("/api/auth/register", json=test_user)
        token = reg_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Tamil Query
        ta_resp = await ac.post("/api/assistant/chat", headers=headers, json={
            "message": "எனக்கு என்ன திட்டங்கள் கிடைக்கும்?",
            "language": "ta"
        })
        assert ta_resp.status_code == 200
        assert ta_resp.json()["language"] == "ta"
        assert "சத்யமித்ரா" in ta_resp.json()["disclaimer"] or "வணக்கம்" in ta_resp.json()["answer"]

        # Hindi Query
        hi_resp = await ac.post("/api/assistant/chat", headers=headers, json={
            "message": "मुझे कौन सी सरकारी योजनाएं मिल सकती हैं?",
            "language": "hi"
        })
        assert hi_resp.status_code == 200
        assert hi_resp.json()["language"] == "hi"

@pytest.mark.asyncio
async def test_session_authorization_isolation():
    u1 = {"email": "user1@sathyamithra.org", "password": "Password123", "full_name": "User One"}
    u2 = {"email": "user2@sathyamithra.org", "password": "Password123", "full_name": "User Two"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        t1 = (await ac.post("/api/auth/register", json=u1)).json()["access_token"]
        t2 = (await ac.post("/api/auth/register", json=u2)).json()["access_token"]

        # User 1 creates a chat session
        chat1 = (await ac.post("/api/assistant/chat", headers={"Authorization": f"Bearer {t1}"}, json={
            "message": "Hello from User 1", "language": "en"
        })).json()
        s1_id = chat1["session_id"]

        # User 2 tries to access User 1's chat session -> MUST return 404
        unauth_resp = await ac.get(f"/api/assistant/sessions/{s1_id}", headers={"Authorization": f"Bearer {t2}"})
        assert unauth_resp.status_code == 404
