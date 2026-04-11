from fastapi import APIRouter, HTTPException, status

from app.models.schemas import MockInterviewRequest
from app.services.llm_service import llm_service

router = APIRouter(prefix="/interview")


@router.post("/generate-questions")
async def generate_interview_questions(payload: MockInterviewRequest) -> dict:
    try:
        return await llm_service.generate_interview_questions(
            context=payload.context,
            count=payload.count,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
