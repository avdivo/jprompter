import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from services.web_app.auth.auth_handler import create_jwt_token, validate_telegram_data

router = APIRouter()


class ButtonClickMessage(BaseModel):
    message: str


class InitData(BaseModel):
    initData: str
    message_id: Optional[str] = None
    chat: Optional[str] = None


@router.post("/init")
async def init(data: InitData, response: Response):
    """
    Эндпоинт для получения авторизации (записи JWT токена с cookies).
    Читает шаблон из docs/templates/template-video-1.0.json и возвращает его с пустым промптом.
    Args:
        None
    Returns:
        dict: Шаблон и пользовательские данные.
    """
    try:
        print(data)
        all_data = validate_telegram_data(data.initData)
        # print(f"Все полученные данные: {all_data}")
        # print(f"message_id: {data.message_id}")
        # print(f"chat: {data}")
        user_data = all_data.get("user", {})
        jwt_token = create_jwt_token(user_data["id"])
        response.set_cookie(key="jwt", value=jwt_token, httponly=True)

        # Читаем шаблон из файла
        template_path = (
            Path(__file__).parent.parent.parent.parent
            / "docs"
            / "templates"
            / "template-video-1.0.json"
        )
        with open(template_path, "r", encoding="utf-8") as f:
            template = json.load(f)

        # Создаем пустой промпт (пока заглушка)
        prompt = {}

        return {"template": template, "prompt": prompt}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/greeting")
async def get_greeting():
    """
    Эндпоинт для получения приветственного сообщения.
    Args:
        None
    Returns:
        dict: Словарь с приветственным сообщением.
    """
    return {"message": "Привет от FastAPI!"}


@router.get("/status")
async def get_status():
    """
    Эндпоинт для получения статуса приложения.
    Args:
        None
    Returns:
        dict: Словарь со статусом "Активен".
    """
    return {"status": "Активен"}


@router.post("/button_click")
async def post_button_click(data: ButtonClickMessage):
    """
    Эндпоинт для обработки нажатия кнопки "Ок".
    Args:
        data (ButtonClickMessage): Сообщение от клиента.
    Returns:
        Response: Ответ FastAPI с содержимым "OK" и статусом 200.
    """
    print(f"Получено сообщение от клиента: {data.message}")
    return Response(content="OK", status_code=200)
