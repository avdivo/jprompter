from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Эндпоинт для проверки работоспособности сервиса.
    Args:
        None
    Returns:
        dict: Словарь со статусом "Ok".
    """
    return {"status": "Ok"}
