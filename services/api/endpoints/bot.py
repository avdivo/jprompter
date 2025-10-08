from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import Update
from fastapi import Request, Response

from config.config import BotConfig
from services.bot.handlers import router

bot_config = BotConfig()
bot = Bot(
    token=bot_config.bot_token, default=DefaultBotProperties(parse_mode=ParseMode.HTML)
)
dp = Dispatcher()
dp.include_router(router)


async def bot_webhook_endpoint(request: Request):
    """
    Эндпоинт для обработки входящих вебхуков от Telegram.
    Args:
        request (Request): Объект запроса FastAPI.
    Returns:
        Response: Ответ FastAPI с содержимым "OK" и статусом 200.
    """
    update = Update.model_validate(await request.json(), context={"bot": bot})
    await dp.feed_update(bot, update)
    return Response(content="OK", status_code=200)
