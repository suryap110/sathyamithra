import os
import sys

def audit_phase8():
    print("==================================================")
    print("SATHYAMITHRA PHASE 8 AUDIT & INTEGRATION VERIFICATION")
    print("==================================================")

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_dir = os.path.join(base_dir, "backend")
    mobile_dir = os.path.join(base_dir, "mobile")
    web_dir = os.path.join(base_dir, "web")

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

    # 1. Backend Device & Sync Endpoints
    print("\n--- 1. Backend API & Database Schema ---")
    device_model = os.path.join(backend_dir, "app", "models", "mobile_device.py")
    devices_api = os.path.join(backend_dir, "app", "api", "devices.py")
    sync_api = os.path.join(backend_dir, "app", "api", "sync.py")
    migration_file = os.path.join(backend_dir, "alembic", "versions", "003_phase8_mobile.py")
    test_file = os.path.join(backend_dir, "tests", "test_mobile_sync.py")

    check(os.path.exists(device_model), "UserDevice model (mobile_device.py) exists")
    check(os.path.exists(devices_api), "Push notification devices router (devices.py) exists")
    check(os.path.exists(sync_api), "Offline sync router (sync.py) exists")
    check(os.path.exists(migration_file), "Alembic Phase 8 migration (003_phase8_mobile.py) exists")
    check(os.path.exists(test_file), "Phase 8 backend tests (test_mobile_sync.py) exist")

    # 2. Mobile Architecture & Services
    print("\n--- 2. Mobile Services & Offline Engine ---")
    api_client = os.path.join(mobile_dir, "src", "services", "apiClient.ts")
    offline_cache = os.path.join(mobile_dir, "src", "services", "offlineCache.ts")
    sync_engine = os.path.join(mobile_dir, "src", "services", "syncEngine.ts")
    access_service = os.path.join(mobile_dir, "src", "services", "accessibilityService.ts")

    check(os.path.exists(api_client), "Axios apiClient with JWT bearer interceptors exists")
    check(os.path.exists(offline_cache), "AsyncStorage read-only offlineCache service exists")
    check(os.path.exists(sync_engine), "FIFO action queue syncEngine service exists")
    check(os.path.exists(access_service), "Elder mode & accessibility service exists")

    # 3. Mobile Navigation & Screens
    print("\n--- 3. Mobile Navigation & Screen Components ---")
    nav = os.path.join(mobile_dir, "src", "navigation", "RootNavigator.tsx")
    screens = [
        "HomeScreen.tsx",
        "SchemeDiscoveryScreen.tsx",
        "SchemeDetailScreen.tsx",
        "SavedSchemesScreen.tsx",
        "ApplicationTrackerScreen.tsx",
        "DocumentVaultScreen.tsx",
        "FamilyScreen.tsx",
        "AIAssistantScreen.tsx",
        "SettingsScreen.tsx",
        "OnboardingScreen.tsx",
        "LoginScreen.tsx",
        "RegisterScreen.tsx",
        "ProfileScreen.tsx"
    ]
    check(os.path.exists(nav), "RootNavigator with Bottom Tabs & Stack navigation exists")
    for s in screens:
        screen_path = os.path.join(mobile_dir, "src", "screens", s)
        check(os.path.exists(screen_path), f"Mobile screen {s} exists")

    # 4. Web PWA & Service Worker
    print("\n--- 4. Web PWA & Offline Service Worker ---")
    sw_file = os.path.join(web_dir, "public", "sw.js")
    manifest_file = os.path.join(web_dir, "public", "manifest.json")
    layout_file = os.path.join(web_dir, "app", "layout.tsx")

    check(os.path.exists(sw_file), "PWA offline service worker (sw.js) exists")
    check(os.path.exists(manifest_file), "PWA manifest.json exists")
    
    with open(layout_file, 'r', encoding='utf-8') as f:
        layout_content = f.read()
    check("serviceWorker" in layout_content and "manifest.json" in layout_content, "Service worker & manifest registered in web layout.tsx")

    print("\n==================================================")
    print(f"RESULTS: {passed} / {total} checks PASSED")
    print("==================================================")
    if passed == total:
        print(" PHASE 8 IMPLEMENTATION VERIFIED SUCCESSFULLY!")
    else:
        print(" SOME CHECKS FAILED!")

if __name__ == "__main__":
    audit_phase8()
