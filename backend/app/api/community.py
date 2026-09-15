from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.database.session import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.models.community import CommunityQuestion, CommunityAnswer, CommunityReport
from app.schemas.community import (
    CommunityQuestionCreate,
    CommunityQuestionUpdate,
    CommunityQuestionResponse,
    CommunityAnswerCreate,
    CommunityAnswerResponse,
    CommunityReportCreate
)

router = APIRouter()

@router.get("/questions", response_model=List[CommunityQuestionResponse])
async def list_community_questions(
    category: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(CommunityQuestion)
        .filter(CommunityQuestion.moderation_status == "VISIBLE")
        .options(selectinload(CommunityQuestion.answers).selectinload(CommunityAnswer.user), selectinload(CommunityQuestion.user))
    )
    if category:
        stmt = stmt.filter(CommunityQuestion.category == category)
    if state:
        stmt = stmt.filter(CommunityQuestion.state == state)
    if district:
        stmt = stmt.filter(CommunityQuestion.district == district)
        
    stmt = stmt.order_by(CommunityQuestion.created_at.desc())
    res = await db.execute(stmt)
    questions = res.scalars().all()

    response_list = []
    for q in questions:
        answers_resp = [
            CommunityAnswerResponse(
                id=a.id,
                question_id=a.question_id,
                user_id=a.user_id,
                author_name=a.user.full_name if a.user else "Citizen User",
                answer=a.answer,
                author_type=a.author_type,
                helpful_count=a.helpful_count,
                moderation_status=a.moderation_status,
                created_at=a.created_at
            ) for a in q.answers if a.moderation_status == "VISIBLE"
        ]
        response_list.append(
            CommunityQuestionResponse(
                id=q.id,
                user_id=q.user_id,
                author_name=q.user.full_name if q.user else "Anonymous Citizen",
                title=q.title,
                question=q.question,
                category=q.category,
                state=q.state,
                district=q.district,
                moderation_status=q.moderation_status,
                created_at=q.created_at,
                updated_at=q.updated_at,
                answers=answers_resp,
                answers_count=len(answers_resp),
                ai_summary_disclaimer="Several citizens discussed this scheme, but citizen responses are not official government guidance." if len(answers_resp) > 0 else None
            )
        )
    return response_list

@router.post("/questions", response_model=CommunityQuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_community_question(
    q_in: CommunityQuestionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    q = CommunityQuestion(
        user_id=current_user.id,
        **q_in.model_dump()
    )
    db.add(q)
    await db.commit()
    await db.refresh(q)

    return CommunityQuestionResponse(
        id=q.id,
        user_id=q.user_id,
        author_name=current_user.full_name,
        title=q.title,
        question=q.question,
        category=q.category,
        state=q.state,
        district=q.district,
        moderation_status=q.moderation_status,
        created_at=q.created_at,
        updated_at=q.updated_at,
        answers=[],
        answers_count=0,
        ai_summary_disclaimer=None
    )

@router.get("/questions/{id}", response_model=CommunityQuestionResponse)
async def get_community_question(
    id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(CommunityQuestion)
        .filter(CommunityQuestion.id == id)
        .options(selectinload(CommunityQuestion.answers).selectinload(CommunityAnswer.user), selectinload(CommunityQuestion.user))
    )
    res = await db.execute(stmt)
    q = res.scalars().first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    answers_resp = [
        CommunityAnswerResponse(
            id=a.id,
            question_id=a.question_id,
            user_id=a.user_id,
            author_name=a.user.full_name if a.user else "Citizen User",
            answer=a.answer,
            author_type=a.author_type,
            helpful_count=a.helpful_count,
            moderation_status=a.moderation_status,
            created_at=a.created_at
        ) for a in q.answers if a.moderation_status == "VISIBLE"
    ]

    return CommunityQuestionResponse(
        id=q.id,
        user_id=q.user_id,
        author_name=q.user.full_name if q.user else "Anonymous Citizen",
        title=q.title,
        question=q.question,
        category=q.category,
        state=q.state,
        district=q.district,
        moderation_status=q.moderation_status,
        created_at=q.created_at,
        updated_at=q.updated_at,
        answers=answers_resp,
        answers_count=len(answers_resp),
        ai_summary_disclaimer="Several citizens discussed this scheme, but citizen responses are not official government guidance." if len(answers_resp) > 0 else None
    )

@router.post("/questions/{id}/answers", response_model=CommunityAnswerResponse, status_code=status.HTTP_201_CREATED)
async def post_community_answer(
    id: str,
    a_in: CommunityAnswerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CommunityQuestion).filter(CommunityQuestion.id == id)
    res = await db.execute(stmt)
    q = res.scalars().first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    author_type = "OFFICIAL" if current_user.role in ["ADMIN", "SUPPORT_AGENT"] else "CITIZEN"

    answer = CommunityAnswer(
        question_id=q.id,
        user_id=current_user.id,
        answer=a_in.answer,
        author_type=author_type
    )
    db.add(answer)
    await db.commit()
    await db.refresh(answer)

    return CommunityAnswerResponse(
        id=answer.id,
        question_id=answer.question_id,
        user_id=answer.user_id,
        author_name=current_user.full_name,
        answer=answer.answer,
        author_type=answer.author_type,
        helpful_count=answer.helpful_count,
        moderation_status=answer.moderation_status,
        created_at=answer.created_at
    )

@router.post("/questions/{id}/report", status_code=status.HTTP_201_CREATED)
async def report_community_question(
    id: str,
    rep_in: CommunityReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    report = CommunityReport(
        user_id=current_user.id,
        entity_type="QUESTION",
        entity_id=id,
        reason=rep_in.reason,
        details=rep_in.details
    )
    db.add(report)
    await db.commit()
    return {"message": "Question report submitted for moderation review."}

@router.post("/answers/{id}/report", status_code=status.HTTP_201_CREATED)
async def report_community_answer(
    id: str,
    rep_in: CommunityReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    report = CommunityReport(
        user_id=current_user.id,
        entity_type="ANSWER",
        entity_id=id,
        reason=rep_in.reason,
        details=rep_in.details
    )
    db.add(report)
    await db.commit()
    return {"message": "Answer report submitted for moderation review."}

@router.delete("/questions/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_community_question(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CommunityQuestion).filter(CommunityQuestion.id == id)
    res = await db.execute(stmt)
    q = res.scalars().first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    if q.user_id != current_user.id and current_user.role not in ["ADMIN", "SUPPORT_AGENT"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this question")

    await db.delete(q)
    await db.commit()
    return None
