from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.database.session import get_db
from app.models.user import User
from app.models.document import Document
from app.models.scheme import Scheme
from app.api.auth import get_current_user
from app.storage.local_storage import storage_provider
from app.schemas.document import (
    DocumentSchema, 
    DocumentUpdateSchema, 
    DocumentReadinessResponse, 
    ALLOWED_DOCUMENT_TYPES,
    DocumentMatchItem
)
from app.services.document_engine import match_documents, check_document_expiry
from app.core.events import dispatch_event

router = APIRouter(prefix="/documents", tags=["Document Vault"])

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/jpg"}
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

class ReadinessRequest(BaseModel):
    scheme_id: str

@router.get("", response_model=List[DocumentSchema])
async def list_user_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).filter(Document.user_id == current_user.id).order_by(Document.uploaded_at.desc())
    result = await db.execute(stmt)
    docs = result.scalars().all()
    
    response_list = []
    for d in docs:
        d_schema = DocumentSchema.model_validate(d)
        exp_info = check_document_expiry(d)
        d_schema.is_expiring_soon = exp_info["is_expiring_soon"]
        d_schema.is_expired = exp_info["is_expired"]
        response_list.append(d_schema)
        
    return response_list

@router.post("/upload", response_model=DocumentSchema, status_code=status.HTTP_201_CREATED)
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if document_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type '{document_type}'. Must be one of {ALLOWED_DOCUMENT_TYPES}"
        )

    # File extension check
    file_name = file.filename or "uploaded_file.pdf"
    ext = f".{file_name.split('.')[-1].lower()}" if "." in file_name else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed: .pdf, .jpg, .jpeg, .png"
        )

    # Content type & size check
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 10 MB."
        )

    mime_type = file.content_type or "application/pdf"
    if mime_type not in ALLOWED_MIME_TYPES and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{mime_type}'."
        )

    # Save to storage provider abstraction
    storage_key = await storage_provider.save_file(
        file_bytes=file_bytes,
        file_name=file_name,
        mime_type=mime_type,
        user_id=current_user.id
    )

    doc = Document(
        user_id=current_user.id,
        document_type=document_type,
        file_name=file_name,
        storage_key=storage_key,
        mime_type=mime_type,
        file_size=len(file_bytes),
        verification_status="VERIFIED"  # AI/System uploaded verification status
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    dispatch_event("DOCUMENT_UPLOADED", {"user_id": current_user.id, "document_id": doc.id, "type": document_type})

    d_schema = DocumentSchema.model_validate(doc)
    return d_schema

@router.get("/{document_id}", response_model=DocumentSchema)
async def get_document_metadata(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).filter(Document.id == document_id, Document.user_id == current_user.id)
    result = await db.execute(stmt)
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or unauthorized")

    d_schema = DocumentSchema.model_validate(doc)
    exp_info = check_document_expiry(doc)
    d_schema.is_expiring_soon = exp_info["is_expiring_soon"]
    d_schema.is_expired = exp_info["is_expired"]
    return d_schema

@router.get("/{document_id}/file")
async def stream_document_file(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).filter(Document.id == document_id, Document.user_id == current_user.id)
    result = await db.execute(stmt)
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or unauthorized")

    try:
        content, mime_type = await storage_provider.get_file(doc.storage_key)
        return Response(content=content, media_type=mime_type)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"File stream error: {str(e)}")

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).filter(Document.id == document_id, Document.user_id == current_user.id)
    result = await db.execute(stmt)
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or unauthorized")

    # Delete file from storage vault
    await storage_provider.delete_file(doc.storage_key)

    await db.delete(doc)
    await db.commit()
    return {"status": "deleted", "id": document_id}

@router.put("/{document_id}", response_model=DocumentSchema)
async def update_document_metadata(
    document_id: str,
    payload: DocumentUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).filter(Document.id == document_id, Document.user_id == current_user.id)
    result = await db.execute(stmt)
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or unauthorized")

    if payload.document_type:
        doc.document_type = payload.document_type
    if payload.issue_date:
        doc.issue_date = payload.issue_date
    if payload.expiry_date:
        doc.expiry_date = payload.expiry_date
    if payload.verification_notes:
        doc.verification_notes = payload.verification_notes

    await db.commit()
    await db.refresh(doc)
    return DocumentSchema.model_validate(doc)

@router.post("/{document_id}/replace", response_model=DocumentSchema)
async def replace_document_file(
    document_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Document).filter(Document.id == document_id, Document.user_id == current_user.id)
    result = await db.execute(stmt)
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found or unauthorized")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds 10MB limit.")

    # Delete old file
    await storage_provider.delete_file(doc.storage_key)

    # Save new file
    file_name = file.filename or doc.file_name
    new_storage_key = await storage_provider.save_file(
        file_bytes=file_bytes,
        file_name=file_name,
        mime_type=file.content_type or doc.mime_type,
        user_id=current_user.id
    )

    doc.file_name = file_name
    doc.storage_key = new_storage_key
    doc.file_size = len(file_bytes)
    doc.verification_status = "VERIFIED"

    await db.commit()
    await db.refresh(doc)
    return DocumentSchema.model_validate(doc)

@router.post("/readiness", response_model=DocumentReadinessResponse)
async def check_scheme_document_readiness(
    req: ReadinessRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch Scheme and required documents
    s_stmt = select(Scheme).filter(Scheme.id == req.scheme_id)
    s_res = await db.execute(s_stmt)
    scheme = s_res.scalars().first()
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    # Fetch scheme required documents
    from sqlalchemy.orm import selectinload
    stmt = select(Scheme).filter(Scheme.id == req.scheme_id).options(selectinload(Scheme.required_documents))
    scheme_with_docs = (await db.execute(stmt)).scalars().first()

    # Fetch User Documents
    u_stmt = select(Document).filter(Document.user_id == current_user.id)
    user_docs = (await db.execute(u_stmt)).scalars().all()

    req_docs = scheme_with_docs.required_documents if scheme_with_docs else []
    match_result = match_documents(user_docs, req_docs)

    items_dto = []
    for item in match_result["items"]:
        u_doc_schema = DocumentSchema.model_validate(item["user_document"]) if item["user_document"] else None
        items_dto.append(DocumentMatchItem(
            required_document_type=item["required_document_type"],
            description=item["description"],
            is_mandatory=item["is_mandatory"],
            status=item["status"],
            user_document=u_doc_schema
        ))

    return DocumentReadinessResponse(
        scheme_id=scheme.id,
        scheme_title=scheme.title,
        readiness_percentage=match_result["readiness_percentage"],
        total_required=match_result["total_required"],
        total_available=match_result["total_available"],
        total_missing=match_result["total_missing"],
        items=items_dto
    )
