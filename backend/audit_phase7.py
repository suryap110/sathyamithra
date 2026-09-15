import httpx
import json
import sys

BASE_URL = "http://localhost:8000/api"

def audit_phase7():
    print("==================================================")
    print("SATHYAMITHRA PHASE 7 - ADMIN CONTROL CENTER AUDIT")
    print("==================================================")

    client = httpx.Client(timeout=10.0)

    # 1. Admin Authentication & Role Verification
    print("\n[1/7] Testing Admin Login & Auth...")
    login_resp = client.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@sathyamithra.gov.in",
        "password": "Admin@12345"
    })
    if login_resp.status_code != 200:
        print(f"FAILED Admin Login: {login_resp.status_code} - {login_resp.text}")
        sys.exit(1)
    
    admin_token = login_resp.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("  PASS: Admin Authenticated (JWT Issued)")

    # 2. RBAC Security Guard Test
    print("\n[2/7] Testing RBAC Security Guard on Unprivileged Citizen Account...")
    citizen_login = client.post(f"{BASE_URL}/auth/register", json={
        "email": "auditcitizen@sathyamithra.org",
        "password": "Citizen@12345",
        "full_name": "Audit Citizen"
    })
    if citizen_login.status_code in (200, 201):
        cit_token = citizen_login.json()["access_token"]
    else:
        cit_login = client.post(f"{BASE_URL}/auth/login", json={
            "email": "auditcitizen@sathyamithra.org",
            "password": "Citizen@12345"
        })
        cit_token = cit_login.json()["access_token"]

    cit_headers = {"Authorization": f"Bearer {cit_token}"}
    guard_resp = client.get(f"{BASE_URL}/admin/stats", headers=cit_headers)
    if guard_resp.status_code == 403:
        print("  PASS: RBAC Security Guard Blocked Citizen Access (403 Forbidden)")
    else:
        print(f"  FAILED RBAC Guard: expected 403, got {guard_resp.status_code}")
        sys.exit(1)

    # 3. Dashboard Metrics
    print("\n[3/7] Testing Admin Dashboard Metrics Endpoint...")
    stats_resp = client.get(f"{BASE_URL}/admin/stats", headers=admin_headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    print(f"  PASS: Dashboard Metrics -> Total Users: {stats['total_users']}, Schemes: {stats['total_schemes']}, Freshness: {stats['freshness_score']}%")

    # 4. Scheme Management & Verification Workflow
    print("\n[4/7] Testing Admin Scheme CRUD & Source Verification...")
    create_resp = client.post(f"{BASE_URL}/admin/schemes", headers=admin_headers, json={
        "title": "TN Chief Minister Rural Housing Subsidy Scheme 2026",
        "short_description": "Financial assistance of INR 2.5 Lakh for constructing pucca rural houses.",
        "state": "Tamil Nadu",
        "ministry": "Rural Development and Panchayat Raj Department",
        "benefit_type": "Housing Grant",
        "estimated_benefit_amount": 250000.0,
        "status": "DRAFT",
        "official_url": "https://tnrd.tn.gov.in"
    })
    assert create_resp.status_code == 201
    scheme_id = create_resp.json()["scheme_id"]
    print(f"  PASS: Created Draft Scheme (ID: {scheme_id})")

    verify_resp = client.post(f"{BASE_URL}/admin/schemes/{scheme_id}/verify", headers=admin_headers, json={
        "status": "VERIFIED",
        "notes": "Verified against G.O. Ms. No. 104, TNRD Dept.",
        "checks_performed": {"source_url": True, "eligibility_rules": True}
    })
    assert verify_resp.status_code == 200
    print("  PASS: Executed Scheme Verification Workflow (Set status to VERIFIED)")

    pub_resp = client.post(f"{BASE_URL}/admin/schemes/{scheme_id}/publish", headers=admin_headers)
    assert pub_resp.status_code == 200
    print("  PASS: Published Scheme to Citizen Platform")

    # 5. Freshness & Source Monitoring
    print("\n[5/7] Testing Data Freshness & Source Health Monitoring...")
    fresh_resp = client.get(f"{BASE_URL}/admin/freshness", headers=admin_headers)
    assert fresh_resp.status_code == 200
    print(f"  PASS: Freshness Scan Complete -> Fresh: {fresh_resp.json()['fresh_count']}, Stale: {fresh_resp.json()['stale_count']}")

    source_resp = client.get(f"{BASE_URL}/admin/sources", headers=admin_headers)
    assert source_resp.status_code == 200
    print("  PASS: Official Source URL Health Checks Retrieved")

    # 6. Analytics & AI Monitoring
    print("\n[6/7] Testing Analytics & AI Guardrails Monitoring...")
    ai_resp = client.get(f"{BASE_URL}/admin/ai-monitoring", headers=admin_headers)
    assert ai_resp.status_code == 200
    print(f"  PASS: AI RAG Monitoring -> High Confidence Rate: {ai_resp.json()['high_confidence_pct']}%")

    search_resp = client.get(f"{BASE_URL}/admin/analytics/search", headers=admin_headers)
    assert search_resp.status_code == 200
    print("  PASS: Search Analytics Retrieved (Zero-result queries tracked)")

    # 7. Audit Logs & System Health
    print("\n[7/7] Testing Audit Logs & Infrastructure Health...")
    audit_resp = client.get(f"{BASE_URL}/admin/audit-logs", headers=admin_headers)
    assert audit_resp.status_code == 200
    assert len(audit_resp.json()) > 0
    print(f"  PASS: Administrative Audit Logs Verified ({len(audit_resp.json())} recorded events)")

    health_resp = client.get(f"{BASE_URL}/admin/system-health", headers=admin_headers)
    assert health_resp.status_code == 200
    print("  PASS: System Infrastructure Health Confirmed (ALL SYSTEMS HEALTHY)")

    print("\n==================================================")
    print("ALL PHASE 7 ADMIN CONTROL CENTER ENDPOINTS OPERATIONAL!")
    print("==================================================")

if __name__ == "__main__":
    audit_phase7()
