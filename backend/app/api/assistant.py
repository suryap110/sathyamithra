import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.models.user import User, UserProfile
from app.models.chat import ChatSession, ChatMessage
from app.api.auth import get_current_user, get_current_user_optional
from app.schemas.scheme import SchemeSchema
from app.ai.llm_service import process_assistant_chat

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    language: str = "en"  # en, ta, hi

class SourceItem(BaseModel):
    scheme_name: str
    ministry: str
    state: str
    source_url: str
    last_verified: str
    confidence: str

class ChatResponse(BaseModel):
    answer: str
    language: str
    sources: List[SourceItem]
    related_schemes: List[SchemeSchema]
    confidence: float
    disclaimer: str
    session_id: str

class VoiceRequest(BaseModel):
    audio_base64: Optional[str] = None
    text_prompt: Optional[str] = None
    language: str = "en"

class VoiceResponse(BaseModel):
    recognized_text: str
    response_text: str
    audio_response_url: Optional[str] = None
    language: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    req: ChatRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    profile_dict = {
        "full_name": "Citizen",
        "age": 22,
        "state": "Tamil Nadu",
        "annual_income": 180000.0,
        "occupation": "Student",
        "is_student": True,
        "is_farmer": False,
        "is_disabled": False,
    }

    if current_user:
        profile_dict["full_name"] = current_user.full_name
        result = await db.execute(select(UserProfile).filter(UserProfile.user_id == current_user.id))
        profile = result.scalars().first()
        if profile:
            if profile.age: profile_dict["age"] = profile.age
            if profile.state: profile_dict["state"] = profile.state
            if profile.annual_income: profile_dict["annual_income"] = profile.annual_income
            if profile.occupation: profile_dict["occupation"] = profile.occupation
            profile_dict["is_student"] = profile.is_student or (profile.occupation == "Student")
            profile_dict["is_farmer"] = profile.is_farmer
            profile_dict["is_disabled"] = profile.is_disabled

    # Session Management
    session_id = req.session_id or str(uuid.uuid4())
    
    if current_user:
        if req.session_id:
            s_res = await db.execute(
                select(ChatSession).filter(ChatSession.id == req.session_id, ChatSession.user_id == current_user.id)
            )
            chat_session = s_res.scalars().first()
            if not chat_session:
                chat_session = ChatSession(
                    id=req.session_id,
                    user_id=current_user.id,
                    title=req.message[:30] + "...",
                    language=req.language
                )
                db.add(chat_session)
                await db.commit()
        else:
            chat_session = ChatSession(
                id=session_id,
                user_id=current_user.id,
                title=req.message[:30] + "...",
                language=req.language
            )
            db.add(chat_session)
            await db.commit()

    # Process AI answer via RAG and grounding
    ai_output = await process_assistant_chat(req.message, profile_dict, req.language, db)

    # Save to history if authenticated
    if current_user:
        user_msg = ChatMessage(
            session_id=session_id,
            sender="user",
            content=req.message,
            language=req.language
        )
        assistant_msg = ChatMessage(
            session_id=session_id,
            sender="assistant",
            content=ai_output["answer"],
            sources=ai_output["sources"],
            related_schemes=[s.model_dump(mode="json") for s in ai_output["related_schemes"]],
            confidence=ai_output["confidence"],
            language=req.language
        )
        db.add_all([user_msg, assistant_msg])
        await db.commit()

    return ChatResponse(
        answer=ai_output["answer"],
        language=ai_output["language"],
        sources=[SourceItem(**s) for s in ai_output["sources"]],
        related_schemes=ai_output["related_schemes"],
        confidence=ai_output["confidence"],
        disclaimer=ai_output["disclaimer"],
        session_id=session_id
    )

@router.post("/voice", response_model=VoiceResponse)
async def voice_assistant(
    req: VoiceRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    recognized = req.text_prompt or "What government schemes can I get?"
    
    profile_dict = {"full_name": "Citizen", "state": "Tamil Nadu", "occupation": "Student"}
    if current_user:
        profile_dict["full_name"] = current_user.full_name
        result = await db.execute(select(UserProfile).filter(UserProfile.user_id == current_user.id))
        profile = result.scalars().first()
        if profile and profile.state:
            profile_dict["state"] = profile.state

    ai_out = await process_assistant_chat(recognized, profile_dict, req.language, db)
    
    return VoiceResponse(
        recognized_text=recognized,
        response_text=ai_out["answer"],
        audio_response_url=None,
        language=req.language
    )

@router.get("/sessions")
async def list_user_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.updated_at.desc())
    )
    return result.scalars().all()

@router.get("/sessions/{session_id}")
async def get_session_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .options(selectinload(ChatSession.messages))
    )
    result = await db.execute(stmt)
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or unauthorized")
    return session

@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found or unauthorized")
    await db.delete(session)
    await db.commit()
    return {"status": "deleted"}
