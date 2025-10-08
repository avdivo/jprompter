import os

from dotenv import load_dotenv


class BotConfig:
    """
    Класс для загрузки конфигурации бота.
    Args:
        None
    Returns:
        None
    """

    def __init__(self):
        load_dotenv()
        self.bot_token = self._load_bot_token()
        self.webhook_path = self._load_webhook_path()
        self.webhook_base_url = self._load_webhook_base_url()
        self.webhook_url = f"{self.webhook_base_url}{self.webhook_path}"

    def _load_bot_token(self) -> str:
        """
        Загружает токен бота из файла конфигурации или переменных окружения.
        Args:
            None
        Returns:
            str: Токен Telegram-бота.
        Raises:
            ValueError: Если токен бота не найден.
        """
        bot_token = os.getenv("BOT_TOKEN")

        if not bot_token:
            raise ValueError("BOT_TOKEN not found in environment variables")
        return bot_token

    def _load_webhook_path(self) -> str:
        """
        Загружает путь вебхука из переменных окружения.
        Args:
            None
        Returns:
            str: Путь вебхука.
        Raises:
            ValueError: Если путь вебхука не найден.
        """
        webhook_path = os.getenv("WEBHOOK_PATH")
        if not webhook_path:
            raise ValueError("WEBHOOK_PATH not found in environment variables")
        return webhook_path

    def _load_webhook_base_url(self) -> str:
        """
        Загружает базовый URL вебхука из переменных окружения.
        Args:
            None
        Returns:
            str: Базовый URL вебхука.
        Raises:
            ValueError: Если базовый URL вебхука не найден.
        """
        webhook_base_url = os.getenv("WEBHOOK_URL")
        if not webhook_base_url:
            raise ValueError("WEBHOOK_URL not found in environment variables")
        return webhook_base_url
