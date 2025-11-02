from aiogram import F, Router, types
from aiogram.filters import Command, CommandStart

from config.config import BotConfig
from services.bot.keyboards import main_inline_keyboard, web_app_keyboard

router = Router()
bot_config = BotConfig()


@router.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    """
    Этот хендлер обрабатывает команду /start.
    """
    user_name = message.from_user.full_name if message.from_user else "Guest"
    chat_id = message.chat.id
    await message.answer(
        f"Привет, {user_name}! {bot_config.webhook_base_url}",
        reply_markup=web_app_keyboard(
            base_url=bot_config.webhook_base_url, chat_id=chat_id
        ),
    )
    await message.answer(
        "Вот основная клавиатура:", reply_markup=main_inline_keyboard()
    )


@router.message(Command("help"))
async def command_help_handler(message: types.Message) -> None:
    """
    Этот хендлер обрабатывает команду /help.
    """
    await message.answer("Это справочное сообщение. Здесь будет описание команд бота.")


@router.callback_query()
async def inline_button_handler(callback_query: types.CallbackQuery):
    """
    Этот хендлер обрабатывает все нажатия на инлайн-кнопки.
    """
    await callback_query.answer(f"Вы нажали на кнопку с данными: {callback_query.data}")


@router.message(F.text)
async def text_message_handler(message: types.Message):
    """
    Этот хендлер обрабатывает любые текстовые сообщения.
    """
    await message.reply(f"Вы написали: {message.text}")
