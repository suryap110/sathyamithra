from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class ApplicationStatusProvider(ABC):
    @abstractmethod
    async def fetch_external_status(self, reference_number: str, portal_url: Optional[str] = None) -> Dict[str, Any]:
        """Fetches application status from external government portal API if integrated."""
        pass

class MockGovernmentPortalProvider(ApplicationStatusProvider):
    async def fetch_external_status(self, reference_number: str, portal_url: Optional[str] = None) -> Dict[str, Any]:
        # Dev / Demo mock provider explicitly labelled as citizen-reported / mock status
        return {
            "reference_number": reference_number,
            "status": "UNDER_REVIEW",
            "is_official_api": False,
            "disclaimer": "Application status is based on citizen updates. Sathyamithra does not access internal department databases without permission."
        }

status_provider: ApplicationStatusProvider = MockGovernmentPortalProvider()
