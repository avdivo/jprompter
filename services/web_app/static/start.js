document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();       // Инициализация
        Telegram.WebApp.expand();      // Растягиваем на весь экран
    }

    // --- Отправка initData на сервер при загрузке страницы ---
    const urlParams = new URLSearchParams(window.location.search);
    const messageId = urlParams.get('message_id');
    const chat = urlParams.get('chat');
    const initData = window.Telegram?.WebApp?.initData;

    // Сохраняем chat, user и message_id в глобальное хранилище сразу
    window.appData = {
        chat: chat,
        user: window.Telegram?.WebApp?.initDataUnsafe?.user || null,
        message_id: messageId
    };

    if (initData) {
        console.log('Отправка запроса на /web_app/api/init');
        fetch('/web_app/api/init', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                initData: initData,
                message_id: messageId
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Ответ от сервера:', data);
            // Добавляем шаблон и промпт в глобальное хранилище
            window.appData.template = data.template;
            window.appData.prompt = data.prompt;
        })
        .catch(error => {
            console.error('Ошибка при отправке initData:', error);
        });
    } else {
        console.log('initData отсутствует');
    }
});
