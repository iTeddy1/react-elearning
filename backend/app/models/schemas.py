from typing import Literal

from pydantic import BaseModel, Field


class QuizGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    technology: str = Field(..., min_length=1, max_length=100)
    difficulty: Literal["Beginner", "Intermediate", "Advanced"] = Field(...)
    num_questions: int = Field(..., alias="numQuestions", ge=1, le=30)
    language: Literal["Vietnamese", "English"] = Field(...)
    focus_area: str = Field(default="", alias="focusArea", max_length=300)

    model_config = {
        "populate_by_name": True,
        "str_strip_whitespace": True,
    }


class MockInterviewRequest(BaseModel):
    context: str = Field(..., min_length=1, max_length=4000)
    count: int = Field(..., ge=1, le=20)

    model_config = {
        "str_strip_whitespace": True,
    }


class QuizItem(BaseModel):
    question: str = Field(..., min_length=1)
    options: list[str] = Field(..., min_length=4, max_length=4)
    correct_answer: int = Field(..., alias="correctAnswer", ge=0, le=3)
    explanation: str = Field(default="", min_length=1)

    model_config = {
        "populate_by_name": True,
        "str_strip_whitespace": True,
    }


class QuizGenerateResponse(BaseModel):
    quiz: list[QuizItem] = Field(..., min_length=1)


class InterviewQuestionItem(BaseModel):
    question: str = Field(..., min_length=1)
    category: str = Field(default="technical", min_length=1)
    expected_topics: list[str] = Field(default_factory=list, alias="expectedTopics")

    model_config = {
        "populate_by_name": True,
        "str_strip_whitespace": True,
    }


class MockInterviewResponse(BaseModel):
    questions: list[InterviewQuestionItem] = Field(..., min_length=1)
