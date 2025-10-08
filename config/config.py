import os
import tomllib

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
        self.webhook_path = self._load_bot_config("webhook_path")
        self.webhook_base_url = self._load_bot_config("webhook_url")
        self.webhook_url = f"{self.webhook_base_url}{self.webhook_path}"

    def _load_bot_config(self, key: str) -> str:
        """
        Загружает параметр конфигурации бота из файла bot_config.toml.
        Args:
            key (str): Ключ параметра конфигурации.
        Returns:
            str: Значение параметра конфигурации.
        Raises:
            ValueError: Если параметр конфигурации не найден.
        """
        try:
            with open("config/bot_config.toml", "rb") as f:
                config = tomllib.load(f)
            value = config["bot"].get(key)
        except FileNotFoundError:
            raise ValueError("config/bot_config.toml not found")
        except KeyError:
            raise ValueError("Section 'bot' not found in config/bot_config.toml")

        if not value:
            raise ValueError(f"{key} not found in config/bot_config.toml")
        return value

    def _load_bot_token(self) -> str:
        """
        Загружает токен бота из переменных окружения.
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


class AppConfig:
    """
    Класс для загрузки конфигурации веб-приложения.
    Args:
        None
    Returns:
        None
    """

    def __init__(self):
        self.app_path = self._load_app_config("web_app_path")
        self.api_path = self._load_app_config("web_app_api_path")
        self.greeting_endpoint = f"{self.api_path}/greeting"
        self.status_endpoint = f"{self.api_path}/status"
        self.button_click_endpoint = f"{self.api_path}/button_click"

    def _load_app_config(self, key: str) -> str:
        """
        Загружает параметр конфигурации веб-приложения из файла app_config.toml.
        Args:
            key (str): Ключ параметра конфигурации.
        Returns:
            str: Значение параметра конфигурации.
        Raises:
            ValueError: Если параметр конфигурации не найден.
        """
        try:
            with open("config/app_config.toml", "rb") as f:
                config = tomllib.load(f)
            value = config["app"].get(key)
        except FileNotFoundError:
            raise ValueError("config/app_config.toml not found")
        except KeyError:
            raise ValueError("Section 'app' not found in config/app_config.toml")

        if not value:
            raise ValueError(f"{key} not found in config/app_config.toml")
        return value
