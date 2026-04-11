from fastapi import APIRouter, HTTPException, status

from app.models.schemas import QuizGenerateRequest
from app.services.llm_service import llm_service

router = APIRouter(prefix="/quiz")


@router.post("/generate")
async def generate_quiz(payload: QuizGenerateRequest) -> dict:
    try:
        return await llm_service.generate_quiz(payload)
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
