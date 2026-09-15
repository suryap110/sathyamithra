from abc import ABC, abstractmethod
from typing import Dict, Any, List

class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, context: List[Dict[str, Any]], language: str = "en") -> str:
        pass

class STTProvider(ABC):
    @abstractmethod
    async def speech_to_text(self, audio_data: bytes, language: str = "en") -> str:
        pass

class TTSProvider(ABC):
    @abstractmethod
    async def text_to_speech(self, text: str, language: str = "en") -> str:
        pass
