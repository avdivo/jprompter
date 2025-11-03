document.addEventListener('DOMContentLoaded', function() {
    // --- Логика для переключателей ---
    const segmentedControls = document.querySelectorAll('[data-segmented-control]');

    // --- Функции для управления спойлерами ---
    function collapseAllSpoilers() {
        const allDetails = document.querySelectorAll('details');
        allDetails.forEach(detail => {
            detail.removeAttribute('open');
        });
    }

    function expandAllSpoilers() {
        const allDetails = document.querySelectorAll('details');
        allDetails.forEach(detail => {
            detail.setAttribute('open', '');
        });
    }

    // --- Переменная для отслеживания состояния спойлеров ---
    let spoilersExpanded = true;

    // --- Обработчик для кнопки "Показать/скрыть спойлеры" ---
    const spoilerToggleBtn = document.getElementById('spoiler-toggle-btn');
    if (spoilerToggleBtn) {
        spoilerToggleBtn.addEventListener('click', function() {
            if (spoilersExpanded) {
                collapseAllSpoilers();
                this.title = 'Развернуть все спойлеры';
                this.querySelector('i').className = 'fa-solid fa-expand icon'; // Иконка развертывания
            } else {
                expandAllSpoilers();
                this.title = 'Свернуть все спойлеры';
                this.querySelector('i').className = 'fa-solid fa-compress icon'; // Иконка свертывания
            }
            spoilersExpanded = !spoilersExpanded;
        });
    }

    // --- Вспомогательная функция для обновления UI при переключении вида ---
    function updateUIForView(isFormatView) {
        const transformBtn = document.getElementById('transform-btn');
        const spoilerBtn = document.getElementById('spoiler-toggle-btn');
        const formatSelector = document.getElementById('format-selector');

        if (isFormatView) {
            // Режим "Формат"
            if (transformBtn) {
                transformBtn.title = 'Переделать в текст';
                const icon = transformBtn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-file-alt icon'; // Иконка файла
            }
            if (spoilerBtn) spoilerBtn.disabled = false; // Активируем кнопку спойлеров
            if (formatSelector) {
                formatSelector.querySelectorAll('.segmented-control-btn').forEach(btn => {
                    btn.disabled = false; // Активируем кнопки форматов
                });
            }
        } else {
            // Режим "Текст"
            if (transformBtn) {
                transformBtn.title = 'Форматировать';
                const icon = transformBtn.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-list icon'; // Иконка списка
            }
            if (spoilerBtn) spoilerBtn.disabled = true; // Деактивируем кнопку спойлеров
            if (formatSelector) {
                formatSelector.querySelectorAll('.segmented-control-btn').forEach(btn => {
                    btn.disabled = true; // Деактивируем кнопки форматов
                });
            }
        }
    }

    segmentedControls.forEach(control => {
        // Специальная логика для переключателя вида "Формат/Текст"
        if (control.id === 'view-switcher') {
            control.addEventListener('click', function(event) {
                const targetButton = event.target.closest('.segmented-control-btn');
                if (!targetButton || targetButton.classList.contains('active')) return;

                // Управление активным состоянием кнопки
                control.querySelectorAll('.segmented-control-btn').forEach(btn => btn.classList.remove('active'));
                targetButton.classList.add('active');

                // Переключение видимости форм
                const viewToShow = targetButton.dataset.view;
                document.querySelectorAll('.form-view').forEach(view => {
                    view.classList.remove('active');
                });
                document.getElementById(`form-view-${viewToShow}`).classList.add('active');

                // Обновляем UI в зависимости от выбранного вида
                updateUIForView(viewToShow === 'format');
            });
        } else {
            // Общая логика для всех остальных переключателей
            control.addEventListener('click', function(event) {
                const targetButton = event.target.closest('.segmented-control-btn');
                if (!targetButton || targetButton.classList.contains('active')) return;

                control.querySelectorAll('.segmented-control-btn').forEach(btn => btn.classList.remove('active'));
                targetButton.classList.add('active');
            });
        }
    });

    // Инициализируем состояние UI при загрузке страницы (предполагаем, что активен "Формат")
    document.addEventListener('DOMContentLoaded', function() {
        updateUIForView(true);
    });

    // --- Логика для мобильного меню ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const controlPanel = document.getElementById('control-panel');

    menuToggle.addEventListener('click', function() {
        controlPanel.classList.toggle('mobile-menu-open');

        // Обновляем иконку в зависимости от состояния меню
        const icon = menuToggle.querySelector('i');
        if (controlPanel.classList.contains('mobile-menu-open')) {
            icon.className = 'fa-solid fa-xmark'; // Закрытие меню
        } else {
            icon.className = 'fa-solid fa-bars'; // Открытие меню
        }
    });

    // Возвращаем иконку в исходное состояние при загрузке страницы
    document.addEventListener('DOMContentLoaded', function() {
        const icon = menuToggle.querySelector('i');
        icon.className = 'fa-solid fa-bars';
    });

    // Функция для установки высоты textarea в режиме "Текст"
    function setTextareaHeight() {
        const textView = document.getElementById('form-view-text');
        const textarea = document.getElementById('prompt-full-text');

        if (textView && textView.classList.contains('active') && textarea) {
            // В режиме "Текст" textarea занимает всю высоту экрана
            textarea.style.height = 'calc(100vh - 100px)';
        } else if (textarea) {
            // В других режимах возвращаем обычную высоту
            textarea.style.height = 'calc(100vh - 200px)';
        }
    }

    // Вызываем функцию при загрузке страницы
    document.addEventListener('DOMContentLoaded', setTextareaHeight);

    // Вызываем функцию при изменении размера окна
    window.addEventListener('resize', setTextareaHeight);

    // Вызываем функцию при переключении режимов
    const viewSwitcher = document.getElementById('view-switcher');
    if (viewSwitcher) {
        viewSwitcher.addEventListener('click', function() {
            // Небольшая задержка, чтобы дать время для переключения классов
            setTimeout(setTextareaHeight, 10);
        });
    }
});

// --- Обработчик для кнопки "Копировать" ---
document.addEventListener('DOMContentLoaded', function() {
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            console.log('Кнопка копировать нажата');
            console.log('window.appData:', window.appData);
            // Проверяем, есть ли данные в глобальном хранилище
            if (window.appData && window.appData.template && window.appData.prompt) {
                console.log('Данные найдены, переключаемся на режим Text');
                // Переключаемся на режим "Текст"
                const textViewBtn = document.querySelector('#view-switcher .segmented-control-btn[data-view="text"]');
                if (textViewBtn && !textViewBtn.classList.contains('active')) {
                    textViewBtn.click();
                }

                // Показываем данные в текстовом поле
                const textarea = document.getElementById('prompt-full-text');
                if (textarea) {
                    const dataString = JSON.stringify({
                        template: window.appData.template,
                        prompt: window.appData.prompt
                    }, null, 2);
                    textarea.value = dataString;
                    console.log('Данные установлены в textarea');
                } else {
                    console.log('Textarea не найден');
                }

                // Показываем уведомление
                showNotification('Данные загружены в текстовое поле');
            } else {
                console.log('Данные не найдены в window.appData');
                showNotification('Данные не найдены');
            }
        });
    } else {
        console.log('Кнопка copy-btn не найдена');
    }
});

// --- Глобальный обработчик для закрытия модального окна по клавише Escape ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('media-modal');
        if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            const modalContent = modal.querySelector('#modal-content');
            modalContent.innerHTML = '';
        }
    }
});

// --- Функция для показа уведомления ---
function showNotification(message, duration = 1500) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
}