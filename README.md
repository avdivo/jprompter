# JPrompter

Это проект для управления промптами с использованием Telegram-бота и веб-интерфейса.

## Установка и запуск

### Конфигурация

Для работы проекта требуется файл `.env` в корневой директории. Он используется для обоих режимов запуска.

1.  **Клонируйте репозиторий** (если еще не сделали).
2.  **Создайте файл `.env`**:
    Скопируйте пример ниже. Главное, что `POSTGRES_HOST` должен быть `localhost`. Это значение будет использоваться для локальной разработки и автоматически переопределяться для Docker.

    ```env
    # Содержимое файла .env
    BOT_TOKEN=your_telegram_bot_token
    POSTGRES_USER=avdivo
    POSTGRES_PASSWORD=65536
    POSTGRES_DB=jprompter
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    ```

---

### Способ 1: Запуск с помощью Docker (рекомендуемый)

Этот способ автоматически поднимет и настроит приложение и базу данных.

**Требования:**
*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

**Запуск:**
Выполните одну команду. `docker-compose` использует ваш `.env` файл, но для контейнера с приложением сам заменит `POSTGRES_HOST` на `db`.
```bash
docker-compose up --build
```
Приложение будет доступно по адресу `http://127.0.0.1:8000`.

---

### Способ 2: Локальный запуск (для разработки)

Этот способ позволяет запустить приложение на вашем компьютере, а базу данных — в Docker-контейнере.

**Требования:**
*   Python 3.10+
*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

**Шаги:**

1.  **Запустите базу данных в Docker:**
    Эта команда прочтет `.env` и запустит контейнер с PostgreSQL.
    ```bash
    docker-compose up -d db
    ```

2.  **Создайте и активируйте виртуальное окружение:**
    ```bash
    # Для macOS и Linux
    python3 -m venv .venv
    source .venv/bin/activate
    ```

3.  **Установите зависимости:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Примените миграции и запустите приложение:**
    Ваше локальное приложение прочтет `.env` и подключится к базе данных в контейнере через `localhost`.
    ```bash
    alembic upgrade head
    uvicorn main:app --reload
    ```
    Приложение будет доступно по адресу `http://127.0.0.1:8000`.

---
*Команда для туннелирования (может быть полезна при разработке):*
`lt --port 8000 --subdomain jprompter`
Если при открытии приложения требует пароль - это IP, его можно узнать так: https://loca.lt/mytunnelpassword