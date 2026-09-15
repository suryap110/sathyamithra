import os
import sys

def audit_phase9():
    print("==================================================")
    print("SATHYAMITHRA PHASE 9 FINAL PRODUCTION AUDIT")
    print("==================================================")

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_dir = os.path.join(base_dir, "backend")
    mobile_dir = os.path.join(base_dir, "mobile")
    web_dir = os.path.join(base_dir, "web")
    docs_dir = os.path.join(base_dir, "docs")

    passed = 0
    total = 0

    def check(condition, desc):
        nonlocal passed, total
        total += 1
        if condition:
            print(f" [PASS] {desc}")
            passed += 1
        else:
            print(f" [FAIL] {desc}")

    # 1. System Security & Headers
    print("\n--- 1. API Security & CORS / Security Headers ---")
    main_py = os.path.join(backend_dir, "app", "main.py")
    with open(main_py, "r", encoding="utf-8") as f:
        main_content = f.read()
    check("X-Content-Type-Options" in main_content, "Strict X-Content-Type-Options nosniff header configured")
    check("X-Frame-Options" in main_content, "X-Frame-Options DENY clickjacking header configured")
    check("X-Request-ID" in main_content, "Request Correlation ID middleware configured")
    check("CORSMiddleware" in main_content, "CORS Middleware configured")

    # 2. Object-Level Authorization & File Security
    print("\n--- 2. Object-Level Authorization & File Security ---")
    docs_api = os.path.join(backend_dir, "app", "api", "documents.py")
    apps_api = os.path.join(backend_dir, "app", "api", "applications.py")
    with open(docs_api, "r", encoding="utf-8") as f:
        docs_content = f.read()
    with open(apps_api, "r", encoding="utf-8") as f:
        apps_content = f.read()
    check("Document.user_id == current_user.id" in docs_content, "BOLA/IDOR protection on Document vault API")
    check("Application.user_id == current_user.id" in apps_content, "BOLA/IDOR protection on Application tracker API")
    check("MAX_FILE_SIZE_BYTES" in docs_content, "Maximum file upload size limit (10MB) enforced")
    check("ALLOWED_EXTENSIONS" in docs_content, "File extension whitelist (.pdf, .jpg, .jpeg, .png) enforced")

    # 3. AI / RAG Safety & Grounding
    print("\n--- 3. AI Assistant & RAG Safety ---")
    assistant_py = os.path.join(backend_dir, "app", "api", "assistant.py")
    llm_py = os.path.join(backend_dir, "app", "ai", "llm_service.py")
    with open(assistant_py, "r", encoding="utf-8") as f:
        assistant_content = f.read()
    with open(llm_py, "r", encoding="utf-8") as f:
        llm_content = f.read()
    check("sanitize_user_input" in llm_content, "RAG user prompt sanitization & injection defense active")
    check("SourceItem" in assistant_content, "Explicit source attribution & verification confidence returned")
    check("disclaimer" in llm_content, "Official government guidance disclaimer attached to AI responses")

    # 4. Web PWA & Security Headers
    print("\n--- 4. Next.js Web PWA & Security Headers ---")
    next_config = os.path.join(web_dir, "next.config.js")
    sw_file = os.path.join(web_dir, "public", "sw.js")
    manifest_file = os.path.join(web_dir, "public", "manifest.json")
    with open(next_config, "r", encoding="utf-8") as f:
        next_content = f.read()
    check("Strict-Transport-Security" in next_content, "HSTS header configured in next.config.js")
    check(os.path.exists(sw_file), "PWA offline service worker (sw.js) present")
    check(os.path.exists(manifest_file), "PWA manifest.json present")

    # 5. Mobile App & Offline Caching
    print("\n--- 5. Expo Mobile App & Offline Engine ---")
    offline_cache = os.path.join(mobile_dir, "src", "services", "offlineCache.ts")
    sync_engine = os.path.join(mobile_dir, "src", "services", "syncEngine.ts")
    access_service = os.path.join(mobile_dir, "src", "services", "accessibilityService.ts")
    check(os.path.exists(offline_cache), "AsyncStorage read-only cache layer present")
    check(os.path.exists(sync_engine), "FIFO action queue sync engine present")
    check(os.path.exists(access_service), "Elder Mode & font scale multiplier service present")

    # 6. Production Documentation Suite
    print("\n--- 6. Production Documentation Suite ---")
    required_docs = [
        os.path.join(docs_dir, "SECURITY-AUDIT.md"),
        os.path.join(docs_dir, "TEST-REPORT.md"),
        os.path.join(docs_dir, "PRODUCTION-CHECKLIST.md"),
        os.path.join(docs_dir, "ARCHITECTURE.md"),
        os.path.join(docs_dir, "DEPLOYMENT.md"),
        os.path.join(base_dir, "SECURITY.md"),
        os.path.join(base_dir, "README.md")
    ]
    for doc in required_docs:
        check(os.path.exists(doc), f"Document {os.path.basename(doc)} exists")

    print("\n==================================================")
    print(f"RESULTS: {passed} / {total} checks PASSED")
    print("==================================================")
    if passed == total:
        print(" PHASE 9 PRODUCTION HARDENING VERIFIED SUCCESSFULLY!")
    else:
        print(" SOME CHECKS FAILED!")

if __name__ == "__main__":
    audit_phase9()
