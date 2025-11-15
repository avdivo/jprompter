# JPrompter Project

## Project Overview

This project, "JPrompter," is a web application with a Telegram bot interface for managing prompts. It is built with Python and the FastAPI framework. The database is PostgreSQL, and it uses SQLAlchemy for the ORM and Alembic for database migrations. The frontend is rendered using Jinja2 templates. The application is designed to be run with Docker.

## Building and Running the Project

### Prerequisites

*   Python 3
*   Docker and Docker Compose

### Setup and Execution

1.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Configure Environment:**
    Create a `.env` file in the root directory with the necessary environment variables for the database and Telegram bot.

3.  **Start the Database:**
    ```bash
    sudo docker-compose up -d
    ```

4.  **Apply Database Migrations:**
    ```bash
    alembic upgrade head
    ```

5.  **Run the Application:**
    ```bash
    uvicorn main:app --reload
    ```
    The application will be available at `http://127.0.0.1:8000`.

## Development Conventions

*   **Web Framework:** The project uses [FastAPI](https://fastapi.tiangolo.com/), a modern, fast (high-performance) web framework for building APIs with Python 3 based on standard Python type hints.
*   **Telegram Bot:** The Telegram bot is built using the [aiogram](https://docs.aiogram.dev/en/latest/) library.
*   **Database:** The project uses PostgreSQL as its database, with [SQLAlchemy](https://www.sqlalchemy.org/) as the ORM and [Alembic](https://alembic.sqlalchemy.org/en/latest/) for handling database migrations.
*   **Testing:** The project has a `tests` directory and uses `pytest`, as indicated by the `pytest.ini` file.
*   **Containerization:** The project is set up to use Docker and Docker Compose for development and deployment, as seen in the `Dockerfile` and `docker-compose.yml` files.
