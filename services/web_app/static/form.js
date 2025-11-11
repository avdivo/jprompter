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
                
                let left = rect.right - menuWidth;
                let top = rect.bottom;

                if (top + menuHeight > window.innerHeight) { top = rect.top - menuHeight; }
                if (top < 0) { top = 5; }
                if (left < 0) { left = 5; }

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