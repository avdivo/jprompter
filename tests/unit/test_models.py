import pytest

from core.models import PromptChat, PromptGroup, User


def test_user_creation():
    """Тест создания пользователя с обязательными и JSON полями."""
    user = User(
        user_id=123456,
        first_name="John",
        last_name="Doe",
        username="johndoe",
        extra={"settings": {"theme": "dark"}},
        fsm_data={"state": "active"},
    )
    assert user.user_id == 123456
    assert user.first_name == "John"
    assert user.extra["settings"]["theme"] == "dark"
    assert user.is_active is True  # Проверка дефолтного значения


def test_prompt_chat_creation():
    """Тест создания PromptChat с JSON-полем."""
    data = {"text": "Hello", "type": "greeting"}
    prompt = PromptChat(prompt_id=1, user_id=123, message=data)
    assert prompt.message == data
    assert prompt.message["type"] == "greeting"


def test_prompt_group_creation():
    """Тест создания PromptGroup."""
    prompt_group = PromptGroup(
        prompt_id=1,
        chat_id=-100123456789,
        message_thread_id=42,
        message={"text": "Group prompt"},
    )
    assert prompt_group.chat_id == -100123456789
    assert prompt_group.message["text"] == "Group prompt"


def test_user_prompt_relationship():
    """Тест связей между моделями User и PromptChat."""
    user = User(user_id=1, first_name="Test")
    prompt1 = PromptChat(prompt_id=1, user_id=1, message={"text": "test1"})
    prompt2 = PromptChat(prompt_id=2, user_id=1, message={"text": "test2"})

    user.prompts = [prompt1, prompt2]

    assert len(user.prompts) == 2
    assert user.prompts[0].message["text"] == "test1"
    assert prompt1.user_id == user.user_id