from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import interview, quiz
from app.core.config import settings
from app.core.database import close_mongo_connection, connect_to_mongo


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    try:
        yield
    finally:
        await close_mongo_connection()


app = FastAPI(
    title="E-Learning Backend",
    version="0.1.0",
    lifespan=lifespan,
)

allow_credentials = "*" not in settings.allowed_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router, prefix=settings.api_v1_prefix, tags=["quiz"])
app.include_router(
    interview.router,
    prefix=settings.api_v1_prefix,
    tags=["interview"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
