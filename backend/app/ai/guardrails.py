import re

DISCLAIMER_EN = "Sathyamithra is an assistance and discovery platform. Final eligibility and benefit approvals are determined by the respective government department."
DISCLAIMER_TA = "சத்யமித்ரா என்பது ஒரு வழிகாட்டுதல் தளம் மட்டுமே. இறுதி தகுதி மற்றும் நன்மைகளை சம்பந்தப்பட்ட அரசுத் துறை தீர்மானிக்கிறது."
DISCLAIMER_HI = "सत्यमित्रा एक सहायता और खोज मंच है। अंतिम पात्रता और लाभ की स्वीकृति संबंधित सरकारी विभाग द्वारा तय की जाती है।"

def sanitize_user_input(text: str) -> str:
    # Filter prompt injection attempts
    forbidden_patterns = [
        r"ignore previous instructions",
        r"system prompt",
        r"forget rules",
        r"you are now a",
        r"bypass guardrails"
    ]
    sanitized = text
    for pattern in forbidden_patterns:
        sanitized = re.sub(pattern, "", sanitized, flags=re.IGNORECASE)
    return sanitized.strip()

def get_disclaimer(language: str = "en") -> str:
    if language == "ta":
        return DISCLAIMER_TA
    elif language == "hi":
        return DISCLAIMER_HI
    return DISCLAIMER_EN
