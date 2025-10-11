from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel

from services.web_app.auth.auth_handler import create_jwt_token, validate_telegram_data

router = APIRouter()


class ButtonClickMessage(BaseModel):
    message: str


class InitData(BaseModel):
    initData: str
    message_id: str


@router.post("/init")
async def init(data: InitData, response: Response):
    """
    Эндпоинт для получения авторизации (записи JWT токена с cookies).
    Args:
        None
    Returns:
        dict: Вывод сообщения вместо данных.
    """
    try:
        user_data = validate_telegram_data(data.initData)
        jwt_token = create_jwt_token(user_data["id"])
        response.set_cookie(key="jwt", value=jwt_token, httponly=True)
        return {"message": user_data}
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
