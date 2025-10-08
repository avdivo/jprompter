from aiogram import Router, types
from aiogram.filters import CommandStart

from config.config import AppConfig, BotConfig
from services.bot.keyboards import web_app_keyboard

app_config = AppConfig()
bot_config = BotConfig()

router = Router()


@router.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    """
    This handler receives messages with `/start` command
    """
    user_name = message.from_user.full_name if message.from_user else "Guest"
    chat_id = message.chat.id
    await message.answer(
        f"Hello, {user_name}!",
        reply_markup=web_app_keyboard(
            base_url=bot_config.webhook_base_url, chat_id=chat_id
        ),
    )


@router.message()
async def echo_handler(message: types.Message) -> None:
    """
    Handler will forward all your messages back to you
    """
    try:
        await message.send_copy(chat_id=message.chat.id)
    except TypeError:
        # But not all the types is supported to be copied so need to handle it
        await message.answer("Nice try!")
