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
            transformBtn.title = 'Переделать в текст';
            transformBtn.querySelector('i').className = 'fa-solid fa-file-alt icon'; // Иконка файла
            spoilerBtn.disabled = false; // Активируем кнопку спойлеров
            formatSelector.querySelectorAll('.segmented-control-btn').forEach(btn => {
                btn.disabled = false; // Активируем кнопки форматов
            });
        } else {
            // Режим "Текст"
            transformBtn.title = 'Форматировать';
            transformBtn.querySelector('i').className = 'fa-solid fa-list icon'; // Иконка списка
            spoilerBtn.disabled = true; // Деактивируем кнопку спойлеров
            formatSelector.querySelectorAll('.segmented-control-btn').forEach(btn => {
                btn.disabled = true; // Деактивируем кнопки форматов
            });
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