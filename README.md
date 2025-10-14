# JPrompter

Это проект для управления промптами с использованием Telegram-бота и веб-интерфейса.

## Установка и запуск

### 1. Клонирование репозитория

Склонируйте репозиторий с GitHub на ваш локальный компьютер:

```bash
git clone <URL-вашего-репозитория>
cd jprompter
```

### 2. Создание и активация виртуального окружения

Создайте виртуальное окружение для изоляции зависимостей проекта.

**Для macOS и Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Для Windows:**

```bash
python -m venv .venv
.venv\Scripts\activate
```

### 3. Установка зависимостей

Установите все необходимые библиотеки, указанные в файле `requirements.txt`:

```bash
pip install -r requirements.txt
```

### 4. Настройка переменных окружения

Создайте файл `.env` в корне проекта, скопировав содержимое из `.env.example` (если он есть) или создав его с нуля. Заполните его необходимыми данными:

```env
# PostgreSQL
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_db_name
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# PgAdmin
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin_password

# Telegram Bot
BOT_TOKEN=your_telegram_bot_token
```

### 5. Запуск базы данных

Проект использует Docker для запуска базы данных PostgreSQL. Убедитесь, что у вас установлен Docker и Docker Compose.

Запустите контейнеры в фоновом режиме:

```bash
sudo docker-compose up -d
```
*Вам может потребоваться ввести пароль администратора.*

### 6. Применение миграций базы данных

После запуска контейнера с базой данных необходимо создать таблицы. Alembic управляет миграциями.

Примените последнюю миграцию:

```bash
alembic upgrade head
```

### 7. Запуск приложения

Теперь вы можете запустить основное приложение:

```bash
uvicorn main:app --reload
```

Приложение будет доступно по адресу `http://127.0.0.1:8000`.

---
*Старая команда для туннелирования (может быть полезна):*
`lt --port 8000 --subdomain jprompttr`