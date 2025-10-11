document.addEventListener('DOMContentLoaded', async () => {
    const greetingMessageElement = document.getElementById('greeting-message');
    const statusMessageElement = document.getElementById('status-message');
    const okButton = document.getElementById('ok-button');
    const messageIdElement = document.getElementById('message-id');
    let authenticated = false;

    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const messageId = urlParams.get('message_id');
    const chatId = urlParams.get('chat_id');
    messageIdElement.textContent = `Message ID: ${messageId}`;

    const initData = window.Telegram.WebApp.initData;

    try {
        const response = await fetch('/web_app/api/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData: initData, message_id: messageId }),
        });

        if (response.ok) {
            const data = await response.json();

            // Функция для рекурсивного извлечения данных из объекта в текст
            function extractObjectData(obj, indent = '') {
                let text = '';
                for (const key in obj) {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        text += `${indent}${key}:\n`;
                        text += extractObjectData(obj[key], indent + '  ');
                    } else {
                        text += `${indent}${key}: ${obj[key]}\n`;
                    }
                }
                return text;
            }

            if (typeof data.message === 'object' && data.message !== null) {
                // Используем <pre>, чтобы сохранить форматирование текста
                greetingMessageElement.innerHTML = `<pre>${extractObjectData(data.message)}</pre>`;
            } else {
                greetingMessageElement.textContent = data.message;
            }
            
            authenticated = true;
        } else {
            const errorData = await response.json();
            greetingMessageElement.textContent = `Ошибка авторизации: ${errorData.detail}`;
        }
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        greetingMessageElement.textContent = 'Не удалось выполнить авторизацию.';
    }


    // Получение статуса приложения
    try {
        const statusResponse = await fetch('/web_app/api/status');
        const statusData = await statusResponse.json();
        statusMessageElement.textContent = `Статус: ${statusData.status}`;
    } catch (error) {
        console.error('Ошибка при получении статуса:', error);
        statusMessageElement.textContent = 'Не удалось загрузить статус.';
    }

    // Обработчик нажатия кнопки "OK"
    okButton.addEventListener('click', async () => {
        if (authenticated) {
            try {
                const response = await fetch('/web_app/api/button_click', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: 'Все хорошо', chat_id: chatId }),
                });
                if (response.ok) {
                    console.log('Сообщение "Все хорошо" успешно отправлено.');
                } else {
                    console.error('Ошибка при отправке сообщения:', response.statusText);
                }
            } catch (error) {
                console.error('Ошибка сети при отправке сообщения:', error);
            }
        } else {
            console.log("Не аутентифицирован. Сообщение не отправлено.");
        }
    });
});