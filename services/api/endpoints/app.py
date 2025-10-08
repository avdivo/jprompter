from fastapi import APIRouter, Response
from pydantic import BaseModel

router = APIRouter()


class ButtonClickMessage(BaseModel):
    message: str


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
