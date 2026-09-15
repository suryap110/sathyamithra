from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models.document import Document
from app.models.scheme import Scheme, SchemeDocument

def check_document_expiry(doc: Document) -> Dict[str, bool]:
    """Calculates if a document is expiring soon (within 30 days) or expired."""
    if not doc.expiry_date:
        return {"is_expiring_soon": False, "is_expired": False}
    
    now = datetime.utcnow()
    is_expired = doc.expiry_date < now
    is_expiring_soon = not is_expired and doc.expiry_date <= (now + timedelta(days=30))
    
    return {
        "is_expiring_soon": is_expiring_soon,
        "is_expired": is_expired
    }

def match_documents(user_docs: List[Document], scheme_required_docs: List[SchemeDocument]) -> Dict[str, Any]:
    """Matches user documents against scheme requirements and returns readiness metrics."""
    # Map user documents by document_type (case-insensitive)
    user_doc_map = {}
    for d in user_docs:
        doc_type_key = d.document_type.strip().lower()
        # Keep newest or verified document
        if doc_type_key not in user_doc_map or d.verification_status == "VERIFIED":
            user_doc_map[doc_type_key] = d

    items = []
    total_required = len(scheme_required_docs)
    total_available = 0
    total_missing = 0

    for req_doc in scheme_required_docs:
        req_type_key = req_doc.document_type.strip().lower()
        matched_user_doc = user_doc_map.get(req_type_key)

        if matched_user_doc:
            expiry_info = check_document_expiry(matched_user_doc)
            if expiry_info["is_expired"]:
                status = "EXPIRING"
            elif matched_user_doc.verification_status == "REQUIRES_REVIEW":
                status = "NEEDS_REVIEW"
            else:
                status = "MATCHED"
                total_available += 1
            
            items.append({
                "required_document_type": req_doc.document_type,
                "description": req_doc.description,
                "is_mandatory": req_doc.is_mandatory,
                "status": status,
                "user_document": matched_user_doc
            })
        else:
            total_missing += 1
            items.append({
                "required_document_type": req_doc.document_type,
                "description": req_doc.description,
                "is_mandatory": req_doc.is_mandatory,
                "status": "MISSING",
                "user_document": None
            })

    readiness_percentage = int((total_available / max(1, total_required)) * 100) if total_required > 0 else 100

    return {
        "readiness_percentage": readiness_percentage,
        "total_required": total_required,
        "total_available": total_available,
        "total_missing": total_missing,
        "items": items
    }
