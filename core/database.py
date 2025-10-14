from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from config.config import DBConfig

# Загрузка конфигурации из переменных окружения
config = DBConfig()

# Формирование URL для подключения к базе данных
DB_URL = (
    f"{config.driver}://{config.user}:{config.password}@"
    f"{config.host}:{config.port}/{config.name}"
)

# Создание асинхронного движка
async_engine = create_async_engine(DB_URL, echo=True)

# Создание фабрики асинхронных сессий
async_session_factory = async_sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Фабрика для получения асинхронной сессии.
    """
    async with async_session_factory() as session:
        yield session
