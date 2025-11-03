from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from config.config import AppConfig

app_config = AppConfig()


def web_app_keyboard(base_url: str, message_id: str, chat: str) -> InlineKeyboardMarkup:
    """
    Создает инлайн-клавиатуру с кнопкой для запуска веб-приложения.
    Args:
        base_url - url приложения
        message_id - id сообщения-промпта
        from - где находится сообщение "chat" или "group"
    Returns:
        InlineKeyboardMarkup: Инлайн-клавиатура с кнопкой веб-приложения.
    """
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="Запустить Web App",
                    web_app=WebAppInfo(
                        url=(
                            f"{base_url}{app_config.app_path}"
                            f"?message_id={message_id}&chat={chat}"
                        )
                    ),
                )
            ]
        ]
    )


def main_inline_keyboard() -> InlineKeyboardMarkup:
    """
    Создает основную инлайн-клавиатуру с кнопками действий.
    """
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Поделиться", callback_data="share"),
                InlineKeyboardButton(text="Комментарии", callback_data="comments"),
                InlineKeyboardButton(text="Отозвать", callback_data="revoke"),
            ],
            [
                InlineKeyboardButton(text="Редактировать", callback_data="edit"),
                InlineKeyboardButton(text="Добавить", callback_data="add"),
                InlineKeyboardButton(text="Удалить", callback_data="delete"),
            ],
        ]
    )
