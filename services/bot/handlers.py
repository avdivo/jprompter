from aiogram import Router, types
from aiogram.filters import CommandStart

router = Router()


@router.message(CommandStart())
async def command_start_handler(message: types.Message) -> None:
    """
    This handler receives messages with `/start` command
    """
    user_name = message.from_user.full_name if message.from_user else "Guest"
    await message.answer(f"Hello, {user_name}!")


@router.message()
async def echo_handler(message: types.Message) -> None:
    """
    Handler will forward all your messages back to you
    """
    try:
        await message.send_copy(chat_id=message.chat.id)
    except TypeError:
        # But not all the types is supported to be copied so need to handle it
        await message.answer("Nice try!")
