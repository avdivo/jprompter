document.addEventListener('DOMContentLoaded', async () => {
    const greetingMessageElement = document.getElementById('greeting-message');
    const statusMessageElement = document.getElementById('status-message');
    const okButton = document.getElementById('ok-button');

    // Получение приветственного сообщения
    try {
        const greetingResponse = await fetch('/web_app/api/greeting');
        const greetingData = await greetingResponse.json();
        greetingMessageElement.textContent = greetingData.message;
    } catch (error) {
        console.error('Ошибка при получении приветствия:', error);
        greetingMessageElement.textContent = 'Не удалось загрузить приветствие.';
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
        try {
            const response = await fetch('/web_app/api/button_click', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: 'Все хорошо' }),
            });
            if (response.ok) {
                console.log('Сообщение "Все хорошо" успешно отправлено.');
            } else {
                console.error('Ошибка при отправке сообщения:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка сети при отправке сообщения:', error);
        }
    });
});