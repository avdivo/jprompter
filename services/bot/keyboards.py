from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from config.config import AppConfig

app_config = AppConfig()


def web_app_keyboard(base_url: str, chat_id: int) -> InlineKeyboardMarkup:
    """
    Создает инлайн-клавиатуру с кнопкой для запуска веб-приложения.
    Args:
        None
    Returns:
        InlineKeyboardMarkup: Инлайн-клавиатура с кнопкой веб-приложения.
    """
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Запустить Web App",
                    web_app=WebAppInfo(
                        url=f"{base_url}{app_config.app_path}?chat_id={chat_id}"
                    ),
                )
            ]
        ]
    )
