from abc import ABC, abstractmethod
from typing import Tuple, Optional

class StorageProvider(ABC):
    @abstractmethod
    async def save_file(self, file_bytes: bytes, file_name: str, mime_type: str, user_id: str) -> str:
        """Saves file bytes and returns an abstract storage_key."""
        pass

    @abstractmethod
    async def get_file(self, storage_key: str) -> Tuple[bytes, str]:
        """Retrieves file bytes and mime_type using storage_key."""
        pass

    @abstractmethod
    async def delete_file(self, storage_key: str) -> bool:
        """Deletes file associated with storage_key."""
        pass
