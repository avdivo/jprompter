import hashlib
import hmac
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
        self.secret_key = (
            self._generate_secret_key()
        )  # Добавляем генерацию секретного ключа

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

    def _generate_secret_key(self) -> bytes:
        """
        Генерирует секретный ключ для валидации tgWebAppData.
        Args:
            None
        Returns:
            bytes: Секретный ключ.
        """
        return hmac.new(
            "WebAppData".encode(), self.bot_token.encode(), hashlib.sha256
        ).digest()


class AppConfig:
    """
    Класс для загрузки конфигурации веб-приложения.
    Args:
        None
    Returns:
        None
    """

    def __init__(self):
        self.app_path: str = self._load_app_config_str("web_app_path")
        self.api_path: str = self._load_app_config_str("web_app_api_path")
        self.greeting_endpoint = f"{self.api_path}/greeting"
        self.status_endpoint = f"{self.api_path}/status"
        self.button_click_endpoint = f"{self.api_path}/button_click"
        self.jwt_lifetime_days: int = self._load_app_config_int("jwt_lifetime_days")
        self.static_mount_path: str = self._load_app_config_str("static_mount_path")
        self.static_directory: str = self._load_app_config_str("static_directory")
        self.templates_directory: str = self._load_app_config_str("templates_directory")
        self.index_template: str = self._load_app_config_str("index_template")
        self.server_host: str = self._load_app_config_str("server_host")
        self.server_port: int = self._load_app_config_int("server_port")

    def _load_app_config_str(self, key: str) -> str:
        """
        Загружает строковый параметр конфигурации веб-приложения из файла app_config.toml.
        Args:
            key (str): Ключ параметра конфигурации.
        Returns:
            str: Значение параметра конфигурации.
        Raises:
            ValueError: Если параметр конфигурации не найден или имеет неправильный тип.
        """
        try:
            with open("config/app_config.toml", "rb") as f:
                config = tomllib.load(f)
            value = config["app"].get(key)
        except FileNotFoundError:
            raise ValueError("config/app_config.toml not found")
        except KeyError:
            raise ValueError("Section 'app' not found in config/app_config.toml")

        if value is None:
            raise ValueError(f"{key} not found in config/app_config.toml")
        if not isinstance(value, str):
            raise ValueError(f"{key} must be a string")
        return value

    def _load_app_config_int(self, key: str) -> int:
        """
        Загружает числовой параметр конфигурации веб-приложения из файла app_config.toml.
        Args:
            key (str): Ключ параметра конфигурации.
        Returns:
            int: Значение параметра конфигурации.
        Raises:
            ValueError: Если параметр конфигурации не найден или имеет неправильный тип.
        """
        try:
            with open("config/app_config.toml", "rb") as f:
                config = tomllib.load(f)
            value = config["app"].get(key)
        except FileNotFoundError:
            raise ValueError("config/app_config.toml not found")
        except KeyError:
            raise ValueError("Section 'app' not found in config/app_config.toml")

        if value is None:
            raise ValueError(f"{key} not found in config/app_config.toml")
        if not isinstance(value, int):
            raise ValueError(f"{key} must be an integer")
        return value


class DBConfig:
    """
    Класс для загрузки конфигурации базы данных.
    """

    def __init__(self):
        load_dotenv()
        self.driver = "postgresql+asyncpg"
        self.user = os.getenv("POSTGRES_USER")
        self.password = os.getenv("POSTGRES_PASSWORD")
        self.name = os.getenv("POSTGRES_DB")
        self.host = os.getenv("POSTGRES_HOST")
        self.port = os.getenv("POSTGRES_PORT")

        if not all([self.user, self.password, self.name, self.host, self.port]):
            raise ValueError("Не все переменные окружения для базы данных определены.")
