from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    global _client, _database

    if _client is not None:
        return

    _client = AsyncIOMotorClient(settings.mongodb_url)
    await _client.admin.command("ping")
    _database = _client[settings.mongodb_db_name]


async def close_mongo_connection() -> None:
    global _client, _database

    if _client is not None:
        _client.close()

    _client = None
    _database = None


def get_database() -> AsyncIOMotorDatabase:
    if _database is None:
        raise RuntimeError("Database is not initialized. Call connect_to_mongo() first.")
    return _database
