from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.rag.vector_store import scheme_vector_store

async def retrieve_relevant_schemes(query: str, db: AsyncSession, top_k: int = 5) -> List[Dict[str, Any]]:
    # Ensure vector store is indexed
    await scheme_vector_store.index_schemes(db)
    return scheme_vector_store.search(query, top_k=top_k)
