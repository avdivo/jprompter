import hashlib
import hmac
import json
import time
import urllib.parse
from datetime import datetime, timedelta, timezone

import jwt

from config.config import BotConfig

bot_config = BotConfig()


def validate_telegram_data(init_data: str) -> dict:
    """
    Валидирует данные, полученные от Telegram Mini App.
    Args:
        init_data (str): Строка initData из Telegram Mini App.
    Returns:
        dict: Декодированные и валидированные данные пользователя.
    Raises:
        ValueError: Если данные невалидны или срок действия истек.
    """
    data_check_string = []
    data = {}

    # Парсинг init_data
    for item in init_data.split("&"):
        key, value = item.split("=", 1)
        key = urllib.parse.unquote(key)
        value = urllib.parse.unquote(value)
        data[key] = value
        if key != "hash":
            data_check_string.append(f"{key}={value}")

    data_check_string.sort()
    data_check_string = "\n".join(data_check_string)
    print(f"Data check string: {data_check_string}")  # Логирование

    # Вычисление HMAC-SHA256 хеша
    calculated_hash = hmac.new(
        bot_config.secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()
    print(f"Calculated hash: {calculated_hash}")  # Логирование
    print(f"Received hash: {data.get('hash')}")  # Логирование

    # Сравнение хешей
    if calculated_hash != data["hash"]:
        raise ValueError("Invalid hash")

    # Проверка auth_date
    auth_date = int(data["auth_date"])
    if time.time() - auth_date > 900:  # 15 минут
        raise ValueError("Auth date expired")

    return json.loads(data["user"])


def create_jwt_token(user_id: int) -> str:
    """
    Создает JWT-токен для пользователя.
    Args:
        user_id (int): ID пользователя Telegram.
    Returns:
        str: JWT-токен.
    """
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),  # Токен действует 7 дней
    }
    return jwt.encode(payload, bot_config.secret_key, algorithm="HS256")
