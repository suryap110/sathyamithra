import asyncio
import httpx
import uuid

async def audit_all_phases():
    print("=== STARTING SATHYAMITHRA FULL 6-PHASE INTEGRATION AUDIT ===")
    
    async with httpx.AsyncClient(base_url="http://localhost:8000/api") as client:
        # Phase 1: Health & Auth
        h_res = await client.get("/health")
        print(f"[Phase 1] Health Check: {h_res.status_code} - {h_res.json()}")
        assert h_res.status_code == 200

        user_email = f"audit_{uuid.uuid4().hex[:6]}@sathyamithra.org"
        user_pass = "Password123!"
        
        # Register user
        reg_res = await client.post("/auth/register", json={
            "email": user_email,
            "password": user_pass,
            "full_name": "Audit Citizen User"
        })
        assert reg_res.status_code == 201
        token = reg_res.json()["access_token"]
        print(f"[Phase 1] Register & Token Issue: SUCCESS (201)")

        # Login user
        log_res = await client.post("/auth/login", json={"email": user_email, "password": user_pass})
        assert log_res.status_code == 200
        print(f"[Phase 1] Login & Authentication: SUCCESS (200)")

        headers = {"Authorization": f"Bearer {token}"}

        # Phase 2: Schemes Discovery & Categories
        sch_res = await client.get("/schemes")
        print(f"[Phase 2] List Schemes: {sch_res.status_code} - Found {len(sch_res.json())} schemes")
        assert sch_res.status_code == 200
        first_scheme_id = sch_res.json()[0]["id"]

        cat_res = await client.get("/schemes/categories")
        print(f"[Phase 2] Categories: {cat_res.status_code} - Found {len(cat_res.json())} categories")
        assert cat_res.status_code == 200

        detail_res = await client.get(f"/schemes/{first_scheme_id}")
        print(f"[Phase 2] Scheme Detail: {detail_res.status_code} - Title: {detail_res.json()['title']}")
        assert detail_res.status_code == 200

        # Phase 3: Profile & Eligibility Engine
        prof_res = await client.get("/users/profile", headers=headers)
        print(f"[Phase 3] User Profile: {prof_res.status_code} - Completion: {prof_res.json().get('completion_percentage')}%")
        assert prof_res.status_code == 200

        elig_res = await client.post("/eligibility/check", json={
            "age": 22,
            "gender": "Female",
            "state": "Tamil Nadu",
            "annual_income": 120000.0,
            "occupation": "Student",
            "is_student": True
        })
        print(f"[Phase 3] Eligibility Engine: {elig_res.status_code} - Matched {len(elig_res.json()['matches'])} schemes")
        assert elig_res.status_code == 200

        sim_res = await client.post("/eligibility/simulate", json={
            "current_profile": {"annual_income": 180000.0, "is_farmer": False},
            "simulated_profile": {"annual_income": 50000.0, "is_farmer": True}
        })
        print(f"[Phase 3] What-If Simulator: {sim_res.status_code} - Net Benefit Change: INR {sim_res.json()['net_potential_benefit_change']}")
        assert sim_res.status_code == 200

        # Phase 4: AI Assistant & RAG
        chat_en = await client.post("/assistant/chat", json={"message": "Am I eligible for scholarships?", "language": "en"})
        print(f"[Phase 4] AI Assistant Chat (EN): {chat_en.status_code} - Confidence: {chat_en.json()['confidence']}")
        assert chat_en.status_code == 200

        chat_ta = await client.post("/assistant/chat", json={"message": "புதுமைப் பெண் திட்டத்திற்கு என்ன சான்றிதழ் தேவை?", "language": "ta"})
        print(f"[Phase 4] AI Assistant Chat (TA): {chat_ta.status_code}")
        assert chat_ta.status_code == 200

        # Phase 5: Document Vault & Application Tracker
        docs_res = await client.get("/documents", headers=headers)
        print(f"[Phase 5] Document Vault List: {docs_res.status_code} - Count: {len(docs_res.json())}")
        assert docs_res.status_code == 200

        apps_res = await client.get("/applications", headers=headers)
        print(f"[Phase 5] Application Tracker List: {apps_res.status_code} - Count: {len(apps_res.json())}")
        assert apps_res.status_code == 200

        # Phase 6: Family, Life Events, Smart Alerts, Community, Locations
        fam_res = await client.get("/family/members", headers=headers)
        print(f"[Phase 6] Family Members: {fam_res.status_code} - Count: {len(fam_res.json())}")
        assert fam_res.status_code == 200

        fam_plan = await client.get("/family/benefits", headers=headers)
        print(f"[Phase 6] Family Benefit Planner: {fam_plan.status_code} - Estimate: INR {fam_plan.json()['total_potential_benefit_estimate']}")
        assert fam_plan.status_code == 200

        life_res = await client.get("/life-events", headers=headers)
        print(f"[Phase 6] Life Events: {life_res.status_code} - Count: {len(life_res.json())}")
        assert life_res.status_code == 200

        alert_res = await client.get("/alerts", headers=headers)
        print(f"[Phase 6] Smart Alerts: {alert_res.status_code} - Count: {len(alert_res.json())}")
        assert alert_res.status_code == 200

        comm_res = await client.get("/community/questions")
        print(f"[Phase 6] Community Q&A: {comm_res.status_code} - Questions: {len(comm_res.json())}")
        assert comm_res.status_code == 200

        loc_res = await client.post("/locations/search", json={"state": "Tamil Nadu", "district": "Chennai"})
        print(f"[Phase 6] Hyperlocal Locations Search: {loc_res.status_code} - Found {len(loc_res.json()['support_centers'])} support centers")
        assert loc_res.status_code == 200

    print("\n=== ALL 6 PHASES PASSED 100% CLEANLY WITH ZERO ERRORS ===")

if __name__ == "__main__":
    asyncio.run(audit_all_phases())
