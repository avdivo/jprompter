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
                    showNotification('Ошибка: кнопка меню должна быть внутри элемента с data-path.', true);
                    return;
                }
                activeMenuTarget = targetElement;

                const rect = triggerBtn.getBoundingClientRect();
                menu.style.display = 'block';
                const menuWidth = menu.offsetWidth;
                const menuHeight = menu.offsetHeight;
                
                let top = rect.bottom;
                let left = rect.right - menuWidth;
                const margin = 5;
                const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

                const bottomEdge = viewportHeight - margin;
                if (top + menuHeight > bottomEdge) {
                    if (rect.top - menuHeight > margin) {
                        top = rect.top - menuHeight;
                    } else {
                        top = bottomEdge - menuHeight;
                    }
                }

                if (left < margin) {
                    left = margin;
                }

                menu.style.top = `${top + window.scrollY}px`;
                menu.style.left = `${left + window.scrollX}px`;
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