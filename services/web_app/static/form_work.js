/**
 * Рекурсивно обновляет пути в атрибутах дочерних элементов.
 * @param {HTMLElement} element - Родительский элемент, с которого начинается обход.
 * @param {string} oldPathPart - Часть пути, которую нужно заменить (например, "scene_1").
 * @param {string} newPathPart - Новая часть пути (например, "scene_2").
 * @param {number} newIndex - Новый индекс для data-id.
 */
function newPath(element, oldPathPart, newPathPart, newIndex) {
    const attributesToUpdate = ['data-path', 'id', 'data-target', 'data-parent', 'for'];

    // Обновляем атрибуты самого элемента
    attributesToUpdate.forEach(attr => {
        if (element.hasAttribute(attr)) {
            const oldValue = element.getAttribute(attr);
            if (oldValue && oldValue.includes(oldPathPart)) {
                element.setAttribute(attr, oldValue.replace(new RegExp(oldPathPart.replace('.', '\\.'), 'g'), newPathPart));
            }
        }
    });

    if (element.hasAttribute('data-id')) {
        element.setAttribute('data-id', newIndex);
    }

    const titleElement = element.querySelector('[data-role="title"]');
    if (titleElement && titleElement.closest('[data-path]') === element) {
        const text = titleElement.textContent.trim();
        const baseName = text.replace(/\s+\d+$/, ''); // Удаляем старый номер
        titleElement.textContent = `${baseName} ${newIndex}`;
    }


    // Рекурсивно обходим дочерние элементы
    element.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            // Предотвращаем рекурсию вглубь вложенных массивов
            if (child.hasAttribute('data-path') && child.getAttribute('data-path').includes('_')) {
                return;
            }
            newPath(child, oldPathPart, newPathPart, newIndex);
        }
    });
}


/**
 * Сдвигает элементы массива "вниз" (увеличивает их индекс).
 * @param {HTMLElement} container - Контейнер с элементами.
 * @param {number} startIndex - Индекс элемента, с которого начинается сдвиг.
 */
function shiftUp(container, startIndex) {
    const items = Array.from(container.children);
    for (let i = items.length - 1; i >= startIndex; i--) {
        const item = items[i];
        const oldId = parseInt(item.getAttribute('data-id'));
        const newId = oldId + 1;
        
        const path = item.getAttribute('data-path');
        const basePath = path.substring(0, path.lastIndexOf('_') + 1);
        const oldPathPart = `${basePath}${oldId}`;
        const newPathPart = `${basePath}${newId}`;

        const existingElement = document.getElementById(newPathPart);
        if (existingElement) {
            existingElement.remove();
        }
        
        newPath(item, oldPathPart, newPathPart, newId);
    }
}

/**
 * Сдвигает элементы массива "вверх" (уменьшает их индекс).
 * @param {HTMLElement} container - Контейнер с элементами.
 * @param {number} startIndex - Индекс элемента, с которого начинается сдвиг.
 */
function shiftDown(container, startIndex) {
    const items = Array.from(container.children);
    for (let i = startIndex; i < items.length; i++) {
        const item = items[i];
        const oldId = parseInt(item.getAttribute('data-id'));
        const newId = oldId - 1;

        if (newId < 0) continue;

        const path = item.getAttribute('data-path');
        const basePath = path.substring(0, path.lastIndexOf('_') + 1);
        const oldPathPart = `${basePath}${oldId}`;
        const newPathPart = `${basePath}${newId}`;

        newPath(item, oldPathPart, newPathPart, newId);
    }
}


// --- Функции для кнопок ---

async function clearArray(button) {
    const arrayElement = button.closest('[data-path]');
    if (!arrayElement) return;

    const path = arrayElement.getAttribute('data-path');
    try {
        const newArrayHTML = await createForm(path);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newArrayHTML;
        const newArrayElement = tempDiv.firstElementChild;
        
        arrayElement.parentNode.replaceChild(newArrayElement, arrayElement);
        showNotification('Массив очищен');
    } catch (error) {
        showNotification('Ошибка при очистке массива');
    }
}

async function addToArray(button) {
    const singularName = button.getAttribute('data-target');
    if (!singularName) {
        showNotification('Ошибка: не удалось определить тип элемента');
        return;
    }

    const container = document.getElementById(singularName);
    if (!container) {
        showNotification('Ошибка: контейнер не найден');
        return;
    }

    const arrayElement = button.closest('[data-path]');
    if (!arrayElement) {
        showNotification('Ошибка: не найден родительский массив');
        return;
    }
    const arrayPath = arrayElement.getAttribute('data-path');

    // Индексы начинаются с 1, поэтому для нового элемента берем текущее количество + 1
    const newIndex = container.children.length + 1;

    // Собираем полный путь, например, "scenes.scene_2"
    const newPath = `${arrayPath}.${singularName}_${newIndex}`;

    try {
        const newElementHTML = await createForm(newPath);
        if (!newElementHTML || newElementHTML.trim() === '') {
            showNotification('Ошибка: не удалось создать элемент');
            return;
        }
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newElementHTML;
        const newElement = tempDiv.firstElementChild;

        if (newElement) {
            container.appendChild(newElement);
            showNotification('Элемент добавлен');
        } else {
            showNotification('Ошибка: не удалось обработать HTML элемента');
        }
    } catch (error) {
        showNotification('Ошибка при добавлении элемента');
    }
}


// --- Обработчики событий ---

document.addEventListener('DOMContentLoaded', () => {
    const contextMenu = document.getElementById('context-menu');
    let currentElement = null; 

    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;



        if (button.getAttribute('data-action') === 'add-item') {
            addToArray(button);
            return;
        }

        if (button.getAttribute('data-action') === 'clear-array') {
            clearArray(button);
            return;
        }
    });

    contextMenu.addEventListener('click', async (e) => {
        const actionButton = e.target.closest('button[data-action]');
        if (!actionButton || !currentElement) {
            contextMenu.style.display = 'none';
            return;
        }

        const action = actionButton.getAttribute('data-action');
        const parentContainer = document.getElementById(currentElement.dataset.parent);
        const currentIndex = parseInt(currentElement.dataset.id);
        const currentPath = currentElement.dataset.path;
        const items = Array.from(parentContainer.children);
        const elementIndexInNodeList = items.indexOf(currentElement);


        switch (action) {
            case 'add': // Добавить перед
                shiftUp(parentContainer, elementIndexInNodeList);
                const newElementHTML = await createForm(currentPath);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = newElementHTML;
                parentContainer.replaceChild(tempDiv.firstElementChild, currentElement);
                showNotification('Добавлен новый элемент');
                break;

            case 'clone':
                shiftUp(parentContainer, elementIndexInNodeList + 1);
                const clone = currentElement.cloneNode(true);
                const newIndex = currentIndex + 1;
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('_') + 1);
                const newPathPart = `${basePath}${newIndex}`;
                newPath(clone, currentPath, newPathPart, newIndex);
                currentElement.after(clone);
                showNotification('Элемент клонирован');
                break;

            case 'move-up':
                if (elementIndexInNodeList > 0) {
                    const prevElement = items[elementIndexInNodeList - 1];
                    const prevElementPath = prevElement.dataset.path;
                    const prevElementIndex = parseInt(prevElement.dataset.id);

                    parentContainer.insertBefore(currentElement, prevElement);

                    newPath(currentElement, currentPath, prevElementPath, prevElementIndex);
                    newPath(prevElement, prevElementPath, currentPath, currentIndex);
                    showNotification('Перемещено выше');
                } else {
                    showNotification('Элемент уже наверху');
                }
                break;

            case 'move-down':
                if (elementIndexInNodeList < items.length - 1) {
                    const nextElement = items[elementIndexInNodeList + 1];
                    const nextElementPath = nextElement.dataset.path;
                    const nextElementIndex = parseInt(nextElement.dataset.id);

                    parentContainer.insertBefore(nextElement, currentElement);
                    
                    newPath(currentElement, currentPath, nextElementPath, nextElementIndex);
                    newPath(nextElement, nextElementPath, currentPath, currentIndex);
                    showNotification('Перемещено ниже');
                } else {
                    showNotification('Элемент уже внизу');
                }
                break;

            case 'clear':
                const clearedHTML = await createForm(currentPath);
                const tempDivClear = document.createElement('div');
                tempDivClear.innerHTML = clearedHTML;
                parentContainer.replaceChild(tempDivClear.firstElementChild, currentElement);
                showNotification('Содержимое очищено');
                break;

            case 'delete':
                shiftDown(parentContainer, elementIndexInNodeList + 1);
                parentContainer.lastElementChild.remove();
                showNotification('Элемент удален');
                break;
        }
        
        contextMenu.style.display = 'none';
        currentElement = null;
    });

    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target) && !e.target.closest('[data-role="context-menu-trigger"]')) {
            contextMenu.style.display = 'none';
        }
    });
});
