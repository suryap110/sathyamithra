import os
import uuid
from typing import Tuple
from pathlib import Path
from app.storage.base import StorageProvider

# Path traversal prevention & local vault storage
STORAGE_VAULT_DIR = Path(__file__).resolve().parent.parent.parent / "storage_vault"

class LocalStorageProvider(StorageProvider):
    def __init__(self, base_dir: Path = STORAGE_VAULT_DIR):
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _sanitize_key(self, storage_key: str) -> Path:
        # Prevent path traversal vulnerabilities by stripping parent directory components
        clean_key = Path(storage_key).name
        target_path = (self.base_dir / clean_key).resolve()
        if not str(target_path).startswith(str(self.base_dir.resolve())):
            raise ValueError("Invalid storage key path traversal attempt")
        return target_path

    async def save_file(self, file_bytes: bytes, file_name: str, mime_type: str, user_id: str) -> str:
        ext = Path(file_name).suffix.lower()
        if not ext:
            ext = ".bin"
        
        storage_key = f"{user_id}_{uuid.uuid4().hex}{ext}"
        target_path = self._sanitize_key(storage_key)

        with open(target_path, "wb") as f:
            f.write(file_bytes)

        return storage_key

    async def get_file(self, storage_key: str) -> Tuple[bytes, str]:
        target_path = self._sanitize_key(storage_key)
        if not target_path.exists():
            raise FileNotFoundError(f"Storage key {storage_key} not found")

        with open(target_path, "rb") as f:
            content = f.read()

        # Simple MIME extension fallback mapping
        ext = target_path.suffix.lower()
        mime_map = {
            ".pdf": "application/pdf",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png"
        }
        mime_type = mime_map.get(ext, "application/octet-stream")

        return content, mime_type

    async def delete_file(self, storage_key: str) -> bool:
        try:
            target_path = self._sanitize_key(storage_key)
            if target_path.exists():
                target_path.unlink()
                return True
        except Exception:
            pass
        return False

# Global singleton storage provider instance
storage_provider: StorageProvider = LocalStorageProvider()
