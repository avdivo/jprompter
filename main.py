"""
Основной файл приложения, настраивающий FastAPI и Telegram-бота.
Использует lifespan события для установки и удаления вебхуков Telegram.
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI

from config.config import BotConfig
from services.api.endpoints.bot import bot, bot_webhook_endpoint

# Настройка логирования для вывода информации в стандартный вывод
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

# Инициализация конфигурации бота
bot_config = BotConfig()


# Инициализация FastAPI приложения с lifespan событиями
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Контекстный менеджер для управления жизненным циклом FastAPI приложения.
    Устанавливает вебхук Telegram при запуске и удаляет его при завершении работы.
    Args:
        app (FastAPI): Экземпляр FastAPI приложения.
    Returns:
        None
    """
    # Получение информации о текущем вебхуке
    webhook_info = await bot.get_webhook_info()
    # Если URL вебхука изменился, устанавливаем новый
    if webhook_info.url != bot_config.webhook_url:
        await bot.set_webhook(url=bot_config.webhook_url)
    yield
    # Удаление вебхука при завершении работы приложения
    await bot.delete_webhook()


# Создание экземпляра FastAPI приложения с настроенным lifespan
app = FastAPI(lifespan=lifespan)

# Добавление маршрута для обработки входящих вебхуков от Telegram
app.add_api_route(bot_config.webhook_path, bot_webhook_endpoint, methods=["POST"])


if __name__ == "__main__":
    """
    Точка входа для запуска FastAPI приложения с помощью Uvicorn.
    """
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
