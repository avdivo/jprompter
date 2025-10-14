import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(AsyncAttrs, DeclarativeBase):
    """
    Базовая модель для всех таблиц.
    """

    pass


class User(Base):
    """
    Модель пользователя.
    """

    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, index=True
    )
    username: Mapped[str] = mapped_column(String, nullable=True)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String, nullable=True)
    language_code: Mapped[str] = mapped_column(String(5), nullable=True)
    is_bot: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    extra: Mapped[dict] = mapped_column(JSONB, nullable=True)
    fsm_data: Mapped[dict] = mapped_column(JSONB, nullable=True)

    def __init__(self, **kw):
        super().__init__(**kw)
        if self.is_active is None:
            self.is_active = True
        if self.is_bot is None:
            self.is_bot = False
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    prompts: Mapped[list["PromptChat"]] = relationship(
        "PromptChat", back_populates="user"
    )


class PromptChat(Base):
    """
    Модель составного сообщения (промпта) в чате.
    """

    __tablename__ = "prompt_chat"

    prompt_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, index=True
    )
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.user_id")
    )
    message: Mapped[dict] = mapped_column(JSONB)
    prompt_group: Mapped[int] = mapped_column(BigInteger, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="prompts")


class PromptGroup(Base):
    """
     Модель составного сообщения (промпта) в группе.
    """

    __tablename__ = "prompt_group"

    prompt_id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, index=True
    )
    chat_id: Mapped[int] = mapped_column(BigInteger)
    message_thread_id: Mapped[int] = mapped_column(BigInteger)
    message: Mapped[dict] = mapped_column(JSONB)
