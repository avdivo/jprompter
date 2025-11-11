document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('context-menu');
    const formContainer = document.querySelector('.form-container');
    let activeMenuTarget = null; // Хранит элемент, для которого открыто контекстное меню

    function closeMenu() {
        if (menu) {
            menu.style.display = 'none';
        }
        activeMenuTarget = null;
    }

    if (formContainer) {
        formContainer.addEventListener('click', function (event) {
            const target = event.target;

            // --- 1. Открытие контекстного меню ---
            const triggerBtn = target.closest('.context-menu-btn');
            if (triggerBtn) {
                event.preventDefault();
                event.stopPropagation();
                const targetElement = triggerBtn.closest('[data-path]');
                if (!targetElement) {
                    console.error("Кнопка меню должна быть внутри элемента с 'data-path'.");
                    return;
                }
                activeMenuTarget = targetElement;

                const rect = triggerBtn.getBoundingClientRect();
                menu.style.display = 'block';
                const menuWidth = menu.offsetWidth;
                const menuHeight = menu.offsetHeight;
                
                // --- Улучшенная логика позиционирования ---
                let top = rect.bottom;
                let left = rect.right - menuWidth;
                const margin = 5; // Отступ от краев экрана

                // Используем Visual Viewport API для точной высоты на мобильных
                const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

                // Проверка по вертикали
                const bottomEdge = viewportHeight - margin;
                if (top + menuHeight > bottomEdge) {
                    // Если не помещается снизу, пробуем разместить сверху
                    if (rect.top - menuHeight > margin) {
                        top = rect.top - menuHeight;
                    } else {
                        // Если и сверху не помещается, прижимаем к нижнему краю
                        top = bottomEdge - menuHeight;
                    }
                }

                // Проверка по горизонтали
                if (left < margin) {
                    left = margin;
                }

                menu.style.top = `${top + window.scrollY}px`;
                menu.style.left = `${left + window.scrollX}px`;
                return;
            }

            // --- 2. Действия над списком (из заголовков) ---
            const listActionBtn = target.closest('[data-action="add-item"], [data-action="clear-items"]');
            if (listActionBtn) {
                event.preventDefault();
                event.stopPropagation();
                
                const action = listActionBtn.dataset.action;
                const targetElement = listActionBtn.closest('[data-path]');

                if (targetElement) {
                    const path = targetElement.dataset.path;
                    alert(`Действие над списком: "${action}"
Цель: Элемент с data-path="${path}"`);
                    // Здесь будет логика добавления/очистки элементов списка
                }
                return;
            }

            // --- 3. Действия над элементом (из контекстного меню) ---
            const menuActionBtn = target.closest('#context-menu button[data-action]');
            if (menuActionBtn) {
                event.preventDefault();
                event.stopPropagation();

                if (activeMenuTarget) {
                    const action = menuActionBtn.dataset.action;
                    const path = activeMenuTarget.dataset.path;
                    alert(`Действие из контекстного меню: "${action}"
Цель: Элемент с data-path="${path}"`);
                    // Здесь будет логика для действий с конкретным элементом
                }
                closeMenu();
                return;
            }
        });
    }

    // --- Глобальные обработчики для закрытия меню ---
    document.addEventListener('click', function (event) {
        if (menu && menu.style.display === 'block' && !menu.contains(event.target) && !event.target.closest('.context-menu-btn')) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
});