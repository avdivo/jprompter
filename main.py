"""
Основной файл приложения, настраивающий FastAPI и Telegram-бота.
Использует lifespan события для установки и удаления вебхуков Telegram.
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from config.config import AppConfig, BotConfig
from services.api.endpoints.app import router as app_router
from services.api.endpoints.bot import bot, bot_webhook_endpoint
from services.api.endpoints.health import router as health_router

# Настройка логирования для вывода информации в стандартный вывод
logging.basicConfig(level=logging.INFO, stream=sys.stdout)

# Инициализация конфигурации бота
bot_config = BotConfig()
# Инициализация конфигурации веб-приложения
app_config = AppConfig()

# Настройка шаблонов Jinja2
templates = Jinja2Templates(directory="services/web_app/templates")


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

# Настройка статических файлов
app.mount(
    f"{app_config.app_path}/static",
    StaticFiles(directory="services/web_app/static"),
    name="static",
)

# Добавление маршрута для обработки входящих вебхуков от Telegram
app.add_api_route(bot_config.webhook_path, bot_webhook_endpoint, methods=["POST"])

# Добавление маршрутов для API веб-приложения
app.include_router(health_router, prefix=app_config.api_path)
app.include_router(app_router, prefix=app_config.api_path)


# Маршрут для отображения основной страницы веб-приложения
@app.get(app_config.app_path)
async def web_app_root(request: Request):
    """
    Эндпоинт для отображения основной страницы веб-приложения.
    Args:
        request (Request): Объект запроса FastAPI.
    Returns:
        TemplateResponse: Шаблон Jinja2 для index.html.
    """
    return templates.TemplateResponse("index.html", {"request": request})


if __name__ == "__main__":
    """
    Точка входа для запуска FastAPI приложения с помощью Uvicorn.
    """
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
