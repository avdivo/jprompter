// services/web_app/static/form_work.js

/**
 * Находит ближайший родительский элемент с атрибутом data-path.
 * @param {HTMLElement} element - Начальный элемент.
 * @returns {HTMLElement|null} - Найденный элемент или null.
 */
function getActiveObject(element) {
    if (!element) return null;
    return element.closest('[data-path]');
}

/**
 * @param {HTMLElement} button 
 */
async function handleClearItems(button) {
    const arrayElement = getActiveObject(button);
    if (!arrayElement) {
        showNotification('Не удалось найти массив для очистки.', true);
        return;
    }

    const path = arrayElement.dataset.path;
    if (!path) {
        showNotification('Не удалось определить путь к массиву.', true);
        return;
    }

    try {
        const newArrayHTML = createForm(path);
        if (!newArrayHTML) {
            showNotification('Не удалось создать новый массив.', true);
            return;
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newArrayHTML;
        const newArrayElement = tempDiv.firstElementChild;

        if (newArrayElement) {
            arrayElement.parentNode.replaceChild(newArrayElement, arrayElement);
            showNotification('Массив успешно очищен.');
        } else {
            showNotification('Произошла ошибка при обновлении формы.', true);
        }
    } catch (error) {
        console.error('Ошибка при очистке массива:', error);
        showNotification('Произошла ошибка при очистке массива.', true);
    }
}

/**
 * @param {HTMLElement} button 
 */
function handleAddItem(button) {
    const activeObject = getActiveObject(button);
    const path = activeObject ? activeObject.dataset.path : 'не найден';
    showNotification(`Действие: Добавить в массив, Путь: ${path}`);
}

/**
 * @param {HTMLElement} menuItem 
 */
function handleAdd(menuItem) {
    const activeObject = getActiveObject(menuItem);
    const path = activeObject ? activeObject.dataset.path : 'не найден';
    showNotification(`Действие: Добавить перед, Путь: ${path}`);
}

/**
 * @param {HTMLElement} menuItem 
 */
function handleClone(menuItem) {
    const activeObject = getActiveObject(menuItem);
    const path = activeObject ? activeObject.dataset.path : 'не найден';
    showNotification(`Действие: Клонировать, Путь: ${path}`);
}

/**
 * @param {HTMLElement} menuItem 
 */
function handleMoveUp(menuItem) {
    const activeObject = getActiveObject(menuItem);
    const path = activeObject ? activeObject.dataset.path : 'не найден';
    showNotification(`Действие: Выше, Путь: ${path}`);
}

/**
 * @param {HTMLElement} menuItem 
 */
function handleMoveDown(menuItem) {
    const activeObject = getActiveObject(menuItem);
    const path = activeObject ? activeObject.dataset.path : 'не найден';
    showNotification(`Действие: Ниже, Путь: ${path}`);
}

/**
 * @param {HTMLElement} menuItem 
 */
function handleClear(menuItem) {
    const activeObject = getActiveObject(menuItem);
    const path = activeObject ? activeObject.dataset.path : 'не найден';
    showNotification(`Действие: Очистить, Путь: ${path}`);
}

/**
 * @param {HTMLElement} menuItem 
 */
function handleDelete(menuItem) {
    const activeObject = getActiveObject(menuItem);
    const path = activeObject ? activeObject.dataset.path : 'не найден';
    showNotification(`Действие: Удалить, Путь: ${path}`);
}
