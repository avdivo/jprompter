from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from core.database import async_session_factory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Зависимость FastAPI для получения асинхронной сессии базы данных.

    Yields:
        AsyncSession: Асинхронная сессия SQLAlchemy.
    """
    async with async_session_factory() as session:
        yield session
