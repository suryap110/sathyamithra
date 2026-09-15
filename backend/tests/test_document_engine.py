from datetime import datetime, timedelta
from app.models.document import Document
from app.models.scheme import SchemeDocument
from app.services.document_engine import check_document_expiry, match_documents

def test_check_document_expiry_logic():
    # Document without expiry date
    d1 = Document(document_type="Aadhaar", file_name="aadhaar.pdf", storage_key="k1")
    exp1 = check_document_expiry(d1)
    assert exp1["is_expiring_soon"] is False
    assert exp1["is_expired"] is False

    # Expired document
    d2 = Document(document_type="Income Certificate", file_name="inc.pdf", storage_key="k2", expiry_date=datetime.utcnow() - timedelta(days=10))
    exp2 = check_document_expiry(d2)
    assert exp2["is_expired"] is True

    # Document expiring in 15 days
    d3 = Document(document_type="Income Certificate", file_name="inc2.pdf", storage_key="k3", expiry_date=datetime.utcnow() + timedelta(days=15))
    exp3 = check_document_expiry(d3)
    assert exp3["is_expiring_soon"] is True
    assert exp3["is_expired"] is False

def test_match_documents_readiness_score():
    req_docs = [
        SchemeDocument(document_type="Aadhaar", is_mandatory=True),
        SchemeDocument(document_type="Income Certificate", is_mandatory=True),
        SchemeDocument(document_type="Residence Certificate", is_mandatory=False)
    ]

    # User has Aadhaar and Income Certificate
    user_docs = [
        Document(document_type="Aadhaar", file_name="a.pdf", storage_key="k1", verification_status="VERIFIED"),
        Document(document_type="Income Certificate", file_name="b.pdf", storage_key="k2", verification_status="VERIFIED")
    ]

    result = match_documents(user_docs, req_docs)
    assert result["total_required"] == 3
    assert result["total_available"] == 2
    assert result["total_missing"] == 1
    assert result["readiness_percentage"] == 66  # 2/3 = 66%
