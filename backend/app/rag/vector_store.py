import re
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.scheme import Scheme

class SchemeVectorStore:
    def __init__(self):
        self.documents: List[Dict[str, Any]] = []

    def _tokenize(self, text: str) -> set:
        words = re.findall(r'\w+', text.lower())
        return set(words)

    async def index_schemes(self, db: AsyncSession):
        stmt = (
            select(Scheme)
            .filter(Scheme.is_active == True)
            .options(
                selectinload(Scheme.eligibility_rules),
                selectinload(Scheme.benefits),
                selectinload(Scheme.required_documents),
                selectinload(Scheme.application_steps),
                selectinload(Scheme.faqs)
            )
        )
        result = await db.execute(stmt)
        schemes = result.scalars().all()
        
        self.documents = []
        for scheme in schemes:
            docs_text = " ".join([d.document_type for d in (scheme.required_documents or [])])
            steps_text = " ".join([s.title for s in (scheme.application_steps or [])])
            faqs_text = " ".join([f"{f.question} {f.answer}" for f in (scheme.faqs or [])])
            content = f"{scheme.title} {scheme.short_description} {scheme.detailed_description or ''} {scheme.state} {scheme.ministry or ''} {scheme.benefit_summary or ''} {docs_text} {steps_text} {faqs_text}"
            tokens = self._tokenize(content)
            self.documents.append({
                "scheme_id": scheme.id,
                "scheme_name": scheme.title,
                "state": scheme.state,
                "ministry": scheme.ministry or f"{scheme.state} Government",
                "content": content,
                "tokens": tokens,
                "source_url": scheme.official_url or "https://myscheme.gov.in",
                "last_verified": scheme.last_verified_at.strftime("%Y-%m-%d") if scheme.last_verified_at else "2026-09-07",
                "scheme_obj": scheme
            })

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.documents:
            return []
            
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return self.documents[:top_k]

        scored_docs = []
        for doc in self.documents:
            intersection = query_tokens.intersection(doc["tokens"])
            score = len(intersection) / max(1, len(query_tokens))
            
            # Boost exact title phrase matches
            if any(term in doc["content"].lower() for term in query_tokens):
                score += 0.5
                
            scored_docs.append((score, doc))
            
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for score, doc in scored_docs[:top_k]]

scheme_vector_store = SchemeVectorStore()
