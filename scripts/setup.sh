#!/bin/bash
set -euo pipefail

# --- Проверки ---
if [ "$EUID" -ne 0 ]; then
  echo "[-] Скрипт требует прав root (запустите через sudo)."
  exit 1
fi

if ! command -v lsb_release &> /dev/null; then
  apt-get update && apt-get install -y lsb-release
fi

OS=$(lsb_release -si)
if [ "$OS" != "Ubuntu" ]; then
  echo "[-] Поддерживается только Ubuntu. Обнаружено: $OS"
  exit 1
fi

CODENAME=$(lsb_release -cs)
ARCH=$(dpkg --print-architecture)

LOG_FILE="/var/log/docker-install.log"
exec > >(tee -a "$LOG_FILE") 2>&1
echo "=== Начало установки: $(date) ==="

echo "[+] Устанавливаю: git, pip, Docker 28.5.2..."

# --- 1. Базовые пакеты ---
apt-get update
apt-get install -y \
  apt-transport-https ca-certificates curl gnupg lsb-release sudo git python3-pip

# --- 2. Docker GPG-ключ ---
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
fi

# --- 3. Репозиторий Docker (jammy вместо noble) ---
CODENAME="jammy"
ARCH=$(dpkg --print-architecture)

echo "deb [arch=$ARCH signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $CODENAME stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update

# --- 4. Установка Docker 27.3.1 ---
DOCKER_VERSION="5:27.3.1-1~ubuntu.22.04~jammy"

apt-get install -y \
  "docker-ce=$DOCKER_VERSION" \
  "docker-ce-cli=$DOCKER_VERSION" \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

# Проверка версии
if ! docker --version | grep -q "27\.3\.1"; then
  echo "[-] Ошибка: Docker 27.3.1 не установлен (получена версия: $(docker --version))"
  exit 1
fi

# --- 5. Запуск Docker ---
systemctl enable --now docker

# --- 6. Создание пользователя deploy ---
DEPLOY_USER="deploy"
if ! id "$DEPLOY_USER" &>/dev/null; then
  echo "[+] Создаю пользователя $DEPLOY_USER..."
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
  usermod -aG sudo "$DEPLOY_USER"
  usermod -aG docker "$DEPLOY_USER"
  echo "[✓] Пользователь $DEPLOY_USER создан и добавлен в группы sudo и docker."
else
  echo "[i] Пользователь $DEPLOY_USER уже существует."
fi

# --- 7. SSH-ключи для deploy (если нужно) ---
DEPLOY_HOME="/home/$DEPLOY_USER"
mkdir -p "$DEPLOY_HOME/.ssh"
chmod 700 "$DEPLOY_HOME/.ssh"
touch "$DEPLOY_HOME/.ssh/authorized_keys"
chmod 600 "$DEPLOY_HOME/.ssh/authorized_keys"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh"

echo "[✓] Установка завершена!"
echo "Лог: $LOG_FILE"

# --- 8. Запрос публичного SSH-ключа ---
echo
read -p "[?] Введите публичный SSH-ключ для пользователя $DEPLOY_USER (или оставьте пустым): " PUBKEY
if [ -n "$PUBKEY" ]; then
  echo "$PUBKEY" >> "$DEPLOY_HOME/.ssh/authorized_keys"
  chown "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_HOME/.ssh/authorized_keys"
  echo "[✓] Публичный ключ добавлен для $DEPLOY_USER."
else
  echo "[i] Публичный ключ не введён, доступ по SSH не настроен."
fi

# --- 9. Запрос репозитория GitHub ---
echo
read -p "[?] Введите адрес GitHub-репозитория для клонирования (или оставьте пустым): " REPO_URL
if [ -n "$REPO_URL" ]; then
  PROJECT_DIR="/home/$DEPLOY_USER/project"
  echo "[+] Клонирую репозиторий $REPO_URL в $PROJECT_DIR..."
  sudo -u "$DEPLOY_USER" git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR" || { echo "[-] Ошибка: не удалось войти в папку проекта."; exit 1; }
  echo "[+] Запускаю контейнеры..."
  sudo -u "$DEPLOY_USER" docker compose up -d
  echo "[✓] Репозиторий клонирован и контейнеры запущены."
else
  echo "[i] Репозиторий не указан. Установка завершена, контейнеры не запускались."
fi

echo "=== Установка полностью завершена: $(date) ==="
