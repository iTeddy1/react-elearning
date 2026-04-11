import json
import logging
import os
from typing import Any

from fastapi import HTTPException
from openai import AsyncOpenAI, OpenAIError
from pydantic import ValidationError

from app.core.config import settings
from app.core.llm_config import QUIZ_CONFIG
from app.models.schemas import MockInterviewResponse, QuizGenerateRequest, QuizGenerateResponse

logger = logging.getLogger(__name__)


class LLMService:
    """Wrapper for OpenRouter via OpenAI-compatible API."""

    def __init__(self) -> None:
        self.client = AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
            default_headers={
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "React ELearning App",
            },
        )
        self.model_name = os.getenv(
            "OPENROUTER_MODEL",
            "openai/gpt-oss-120b:free",
        )

    async def generate_quiz(self, payload: QuizGenerateRequest) -> dict[str, Any]:
        focus_area = payload.focus_area or "General concepts"
        user_prompt = QUIZ_CONFIG["user_prompt_template"].format(
            num_questions=payload.num_questions,
            difficulty=payload.difficulty,
            technology=payload.technology,
            topic=payload.topic,
            focus_area=focus_area,
            language=payload.language,
        )

        try:
            response = await self.client.chat.completions.create(
                model=QUIZ_CONFIG["default_model"],
                messages=[
                    {"role": "system", "content": QUIZ_CONFIG["system_prompt"]},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=QUIZ_CONFIG["temperature"],
                response_format={"type": "json_object"},
            ) 

            if not response.choices:
                raise ValueError("Model returned no choices")

            raw_content = response.choices[0].message.content
            if raw_content is None or not raw_content.strip():
                raise ValueError("Model returned empty content")

            parsed = json.loads(raw_content)
            if not isinstance(parsed, dict):
                raise ValueError("Expected a JSON object at top-level")

            validated = QuizGenerateResponse.model_validate(parsed)
            return validated.model_dump(by_alias=True)
        except (OpenAIError, json.JSONDecodeError, ValidationError, ValueError) as exc:
            logger.exception("Quiz generation failed")
            raise HTTPException(status_code=502, detail=f"Quiz generation failed: {exc}") from exc

    async def generate_interview_questions(self, context: str, count: int) -> dict[str, Any]:
        system_prompt = (
            "You are a backend JSON generator for mock interview questions. "
            "Return ONLY valid JSON. Do not include markdown formatting, code blocks, "
            "comments, or explanatory text. Output raw JSON only."
        )
        user_prompt = (
            "Generate mock interview questions using this context: "
            f"{context}. "
            f"Number of questions: {count}. "
            "Return this exact JSON structure: "
            '{"questions":[{"question":"string","category":"string","expectedTopics":["string"]}]}. '
            "Rules: questions length must equal the requested count."
        )

        try:
            content = await self._chat_json(system_prompt=system_prompt, user_prompt=user_prompt)
            parsed = self._parse_json(content)
            validated = MockInterviewResponse.model_validate(parsed)
            return validated.model_dump(by_alias=True)
        except ValueError as exc:
            logger.exception("Interview JSON parsing/validation failed")
            raise ValueError(
                f"Invalid JSON from OpenRouter model for interview generation: {exc}"
            ) from exc
        except OpenAIError as exc:
            logger.exception("Interview generation call to OpenRouter failed")
            raise RuntimeError("Unable to reach OpenRouter LLM for interview generation") from exc

    async def _chat_json(self, system_prompt: str, user_prompt: str) -> str:
        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            response_format={"type": "json_object"},
        )

        if not response.choices:
            raise ValueError("Model returned no choices")

        content = response.choices[0].message.content
        if content is None or not content.strip():
            raise ValueError("Model returned empty content")

        return content

    @staticmethod
    def _parse_json(raw_content: str) -> dict[str, Any]:
        try:
            parsed = json.loads(raw_content)
        except json.JSONDecodeError as exc:
            raise ValueError("Response was not valid JSON") from exc

        if not isinstance(parsed, dict):
            raise ValueError("Expected a JSON object at top-level")

        return parsed


llm_service = LLMService()
