import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_document_vault_flow_and_security_isolation():
    u1 = {"email": "docuser1@sathyamithra.org", "password": "Password123", "full_name": "Doc User One"}
    u2 = {"email": "docuser2@sathyamithra.org", "password": "Password123", "full_name": "Doc User Two"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Register User 1 and User 2
        t1 = (await ac.post("/api/auth/register", json=u1)).json()["access_token"]
        t2 = (await ac.post("/api/auth/register", json=u2)).json()["access_token"]

        h1 = {"Authorization": f"Bearer {t1}"}
        h2 = {"Authorization": f"Bearer {t2}"}

        # 1. User 1 uploads a valid PDF document
        file_content = b"%PDF-1.4 Fake PDF Content for Aadhaar Card test"
        files = {"file": ("aadhaar_test.pdf", file_content, "application/pdf")}
        data = {"document_type": "Aadhaar"}

        upload_resp = await ac.post("/api/documents/upload", headers=h1, data=data, files=files)
        assert upload_resp.status_code == 201
        doc_data = upload_resp.json()
        doc_id = doc_data["id"]
        assert doc_data["document_type"] == "Aadhaar"
        assert doc_data["file_name"] == "aadhaar_test.pdf"

        # 2. List documents for User 1
        list_resp = await ac.get("/api/documents", headers=h1)
        assert list_resp.status_code == 200
        assert len(list_resp.json()) == 1

        # 3. Stream document file for User 1
        stream_resp = await ac.get(f"/api/documents/{doc_id}/file", headers=h1)
        assert stream_resp.status_code == 200
        assert stream_resp.content == file_content

        # 4. SECURITY ISOLATION TEST: User 2 MUST NOT be able to access User 1's document
        unauth_meta = await ac.get(f"/api/documents/{doc_id}", headers=h2)
        assert unauth_meta.status_code == 404

        unauth_stream = await ac.get(f"/api/documents/{doc_id}/file", headers=h2)
        assert unauth_stream.status_code == 404

        unauth_del = await ac.delete(f"/api/documents/{doc_id}", headers=h2)
        assert unauth_del.status_code == 404

        # 5. User 1 deletes their document
        del_resp = await ac.delete(f"/api/documents/{doc_id}", headers=h1)
        assert del_resp.status_code == 200

        # Verify deletion
        list_resp_after = await ac.get("/api/documents", headers=h1)
        assert len(list_resp_after.json()) == 0

@pytest.mark.asyncio
async def test_document_upload_validation_errors():
    user = {"email": "valuser@sathyamithra.org", "password": "Password123", "full_name": "Validation User"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = (await ac.post("/api/auth/register", json=user)).json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Invalid document type
        files = {"file": ("test.pdf", b"%PDF-1.4 test", "application/pdf")}
        bad_type_resp = await ac.post("/api/documents/upload", headers=headers, data={"document_type": "FakeType"}, files=files)
        assert bad_type_resp.status_code == 400

        # Invalid file extension
        bad_ext_files = {"file": ("malicious.exe", b"binary data", "application/x-msdownload")}
        bad_ext_resp = await ac.post("/api/documents/upload", headers=headers, data={"document_type": "Aadhaar"}, files=bad_ext_files)
        assert bad_ext_resp.status_code == 400
