// services/web_app/static/form_work.js

// =================================================================================
// Универсальные (переиспользуемые) функции
// =================================================================================

/**
 * Находит ближайший родительский элемент с атрибутом data-path.
 * Эта функция является основной для определения "активного объекта", с которым
 * работает большинство других функций.
 * @param {HTMLElement} element - Начальный элемент, от которого начинается поиск.
 * @returns {HTMLElement|null} - Найденный элемент или null, если не найден.
 */
function getActiveObject(element) {
    if (!element) return null;
    return element.closest('[data-path]');
}

/**
 * Асинхронно создает DOM-элемент на основе HTML, сгенерированного функцией createForm.
 * Эта функция инкапсулирует в себе:
 * 1. Вызов createForm с обработкой возможных ошибок.
 * 2. Преобразование полученной HTML-строки в полноценный DOM-элемент.
 * 3. Вывод уведомлений в случае ошибок.
 * Это позволяет избежать дублирования кода в функциях-обработчиках (handle*).
 * @param {string} path - Путь к элементу, который необходимо создать (например, 'scenes.scene_1').
 * @returns {Promise<HTMLElement|null>} - Возвращает созданный DOM-элемент или null в случае ошибки.
 */
async function createAndBuildElement(path) {
    logToTextarea(`-- Начало: createAndBuildElement для пути "${path}" --`);
    try {
        const elementHTML = createForm(path);
        logToTextarea('createForm вернул HTML.');
        if (!elementHTML || elementHTML.trim() === '') {
            const errorMsg = 'Ошибка: createForm вернул пустой HTML.';
            logToTextarea(errorMsg);
            showNotification('Не удалось создать элемент формы.', true);
            logToTextarea(`-- Конец: createAndBuildElement (ошибка) --`);
            return null;
        }
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = elementHTML;
        const element = tempDiv.firstElementChild;
        logToTextarea('HTML успешно преобразован в DOM-элемент.');
        logToTextarea(`-- Конец: createAndBuildElement (успех) --`);
        return element;
    } catch (error) {
        const errorMsg = `Критическая ошибка в createForm для пути '${path}': ${error.message}`;
        logToTextarea(errorMsg);
        console.error(`Ошибка при создании элемента для пути '${path}':`, error);
        showNotification('Произошла ошибка при создании элемента.', true);
        logToTextarea(`-- Конец: createAndBuildElement (критическая ошибка) --`);
        return null;
    }
}


// =================================================================================
// Функции-обработчики действий
// =================================================================================

/**
 * Обработчик для кнопки "Очистить массив" (data-action="clear-items").
 * Находит массив, создает его "чистую" копию и заменяет ею старый элемент в DOM.
 * @param {HTMLElement} button - Кнопка, вызвавшая действие.
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

    const newArrayElement = await createAndBuildElement(path);

    if (newArrayElement && arrayElement.parentNode) {
        arrayElement.parentNode.replaceChild(newArrayElement, arrayElement);
        showNotification('Массив успешно очищен.');
    } else {
        showNotification('Не удалось очистить массив.', true);
    }
}

/**
 * Обработчик для кнопки "Добавить" (data-action="add-item").
 * Добавляет новый элемент в конец указанного массива.
 * @param {HTMLElement} button - Кнопка, вызвавшая действие.
 */
async function handleAddItem(button) {
    logToTextarea('--- Начало: handleAddItem ---');
    const containerId = button.dataset.target;
    if (!containerId) {
        const errorMsg = 'Ошибка: Не указан контейнер (data-target) для добавления элемента.';
        logToTextarea(errorMsg);
        showNotification('Не указан контейнер для добавления элемента.', true);
        logToTextarea('--- Конец: handleAddItem (ошибка) ---');
        return;
    }
    logToTextarea(`Найден containerId (data-target): ${containerId}`);

    const container = document.getElementById(containerId);
    if (!container) {
        const errorMsg = `Ошибка: Контейнер с ID "${containerId}" не найден в DOM.`;
        logToTextarea(errorMsg);
        showNotification(`Контейнер с ID "${containerId}" не найден.`, true);
        logToTextarea('--- Конец: handleAddItem (ошибка) ---');
        return;
    }
    logToTextarea(`Контейнер с ID "${containerId}" найден в DOM.`);

    // Родительский элемент-массив, чтобы получить его путь (например, "scenes")
    const arrayElement = getActiveObject(button);
    if (!arrayElement) {
        const errorMsg = 'Ошибка: Не удалось найти родительский массив (элемент с data-path).';
        logToTextarea(errorMsg);
        showNotification('Не удалось найти родительский массив.', true);
        logToTextarea('--- Конец: handleAddItem (ошибка) ---');
        return;
    }
    const arrayPath = arrayElement.dataset.path;
    logToTextarea(`Найден путь родительского массива: ${arrayPath}`);

    // Извлекаем базовое имя объекта. `containerId` может быть 'scenes.scene', 
    // а нам для построения пути нужен только 'scene'.
    const itemBaseName = containerId.includes('.') ? containerId.split('.').pop() : containerId;
    logToTextarea(`Извлечено базовое имя элемента: ${itemBaseName}`);
    
    // Новый индекс = текущее кол-во элементов + 1
    const newIndex = container.children.length + 1;
    logToTextarea(`Подсчитан новый индекс: ${newIndex}`);

    // Собираем полный путь для нового элемента (например, "scenes.scene_2")
    const newPath = `${arrayPath}.${itemBaseName}_${newIndex}`;
    logToTextarea(`Сформирован новый путь для элемента: ${newPath}`);

    const newElement = await createAndBuildElement(newPath);

    if (newElement) {
        logToTextarea('Элемент успешно создан. Добавление в DOM...');
        container.appendChild(newElement);
        showNotification('Новый элемент успешно добавлен.');
        logToTextarea('Элемент добавлен в DOM.');
    } else {
        const errorMsg = 'Ошибка: createAndBuildElement не вернул элемент.';
        logToTextarea(errorMsg);
        showNotification('Не удалось добавить новый элемент.', true);
    }
    logToTextarea('--- Конец: handleAddItem ---');
}


// =================================================================================
// Заглушки для будущих функций
// =================================================================================

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
