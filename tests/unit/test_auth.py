import time
from unittest.mock import patch

import jwt
import pytest

from services.web_app.auth import auth_handler


@pytest.fixture
def mock_bot_config():
    """Фикстура для мока BotConfig."""
    with patch("services.web_app.auth.auth_handler.bot_config") as mock:
        mock.secret_key = b"test-secret-bytes"  # Используем bytes
        mock.bot_token = "test-bot-token"
        yield mock


def test_create_jwt_token(mock_bot_config):
    """Тест создания JWT-токена."""
    user_id = 12345
    token = auth_handler.create_jwt_token(user_id)
    decoded_token = jwt.decode(
        token, mock_bot_config.secret_key, algorithms=["HS256"]
    )
    assert decoded_token["user_id"] == user_id
    assert "exp" in decoded_token


def test_validate_telegram_data_valid(mock_bot_config):
    """Тест валидации корректных данных от Telegram."""
    auth_date = int(time.time())
    user_data = (
        '{"id":12345,"first_name":"Test","last_name":"User","username":"testuser"}'
    )
    data_to_hash = {
        "auth_date": str(auth_date),
        "user": user_data,
    }
    # Сортируем и объединяем для хеширования
    data_check_string = "\n".join(
        [f"{key}={value}" for key, value in sorted(data_to_hash.items())]
    )

    calculated_hash = auth_handler.hmac.new(
        mock_bot_config.secret_key,
        data_check_string.encode(),
        auth_handler.hashlib.sha256,
    ).hexdigest()

    init_data_parts = [
        f"hash={calculated_hash}",
        f"auth_date={auth_date}",
        f"user={auth_handler.urllib.parse.quote(user_data)}",
    ]
    init_data = "&".join(init_data_parts)

    validated_user = auth_handler.validate_telegram_data(init_data)
    assert validated_user["id"] == 12345


def test_validate_telegram_data_invalid_hash(mock_bot_config):
    """Тест валидации данных с неверным хешем."""
    init_data = "user={}&auth_date=123&hash=invalid_hash"
    with pytest.raises(ValueError, match="Invalid hash"):
        auth_handler.validate_telegram_data(init_data)


def test_validate_telegram_data_expired(mock_bot_config):
    """Тест валидации просроченных данных."""
    auth_date = int(time.time()) - 1000  # 1000 секунд назад
    user_data = "{}"
    data_check_string = f"auth_date={auth_date}\nuser={user_data}"

    calculated_hash = auth_handler.hmac.new(
        mock_bot_config.secret_key,
        data_check_string.encode(),
        auth_handler.hashlib.sha256,
    ).hexdigest()

    init_data = (
        f"user={auth_handler.urllib.parse.quote(user_data)}"
        f"&auth_date={auth_date}&hash={calculated_hash}"
    )

    with pytest.raises(ValueError, match="Auth date expired"):
        auth_handler.validate_telegram_data(init_data)