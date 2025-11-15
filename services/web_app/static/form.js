// services/web_app/static/form.js

document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('context-menu');
    let activeMenuTarget = null;

    // Функция для закрытия контекстного меню
    function closeMenu() {
        if (menu) {
            menu.style.display = 'none';
        }
        activeMenuTarget = null;
    }

    // Обработчик кликов на всем документе
    document.body.addEventListener('click', function (event) {
        const button = event.target.closest('[data-action]');
        if (!button) {
            // Если клик был не по кнопке, но меню открыто, закрываем его
            if (menu && menu.style.display === 'block') {
                const isClickInsideMenu = menu.contains(event.target);
                if (!isClickInsideMenu) {
                    closeMenu();
                }
            }
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const action = button.dataset.action;
        
        // Целевой элемент для действий из контекстного меню - это элемент, для которого меню было открыто
        // Для остальных кнопок - это сама кнопка
        const actionTarget = (menu && menu.style.display === 'block' && activeMenuTarget) ? activeMenuTarget : button;

        switch (action) {
            // --- Кнопки формы ---
            case 'clear-items':
                handleClearItems(actionTarget);
                break;
            case 'add-item':
                handleAddItem(actionTarget);
                break;
            case 'object-menu':
                // Открытие контекстного меню
                const targetElement = button.closest('[data-path]');
                if (targetElement && menu) {
                    activeMenuTarget = targetElement;
                    const rect = button.getBoundingClientRect();
                    menu.style.display = 'block';
                    const menuWidth = menu.offsetWidth;
                    const menuHeight = menu.offsetHeight;
                    
                    let top = rect.bottom;
                    let left = rect.right - menuWidth;
                    const margin = 5; // небольшой отступ от края экрана
                    
                    // Используем visualViewport для учета зума и других искажений
                    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                    const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;

                    // Проверка по вертикали
                    const bottomEdge = viewportHeight - margin;
                    if (top + menuHeight > bottomEdge) {
                        // Если не помещается вниз, пробуем открыть вверх
                        if (rect.top - menuHeight > margin) {
                            top = rect.top - menuHeight;
                        } else {
                            // Если и вверх не помещается, прижимаем к нижнему краю
                            top = bottomEdge - menuHeight;
                        }
                    }

                    // Проверка по горизонтали
                    if (left < margin) {
                        left = margin;
                    }
                    
                    if (left + menuWidth > viewportWidth - margin) {
                        left = viewportWidth - margin - menuWidth;
                    }

                    menu.style.top = `${top + window.scrollY}px`;
                    menu.style.left = `${left + window.scrollX}px`;
                } else {
                    showNotification('Не найден целевой объект для меню', true);
                }
                return; // Не закрываем меню сразу

            // --- Пункты контекстного меню ---
            case 'add':
                handleAdd(actionTarget);
                break;
            case 'clone':
                handleClone(actionTarget);
                break;
            case 'move-up':
                handleMoveUp(actionTarget);
                break;
            case 'move-down':
                handleMoveDown(actionTarget);
                break;
            case 'clear':
                handleClear(actionTarget);
                break;
            case 'delete':
                handleDelete(actionTarget);
                break;
            default:
                showNotification(`Неизвестное действие: ${action}`, true);
        }

        // Закрываем меню после выполнения действия
        if (menu && menu.style.display === 'block') {
            closeMenu();
        }
    });

    // Закрытие меню по клавише Escape
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
});