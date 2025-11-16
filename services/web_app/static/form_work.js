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

/**
 * Рекурсивно обновляет пути и идентификаторы в атрибутах DOM-элементов.
 * Используется при изменении порядка элементов в массиве.
 * @param {HTMLElement} element - Родительский элемент, с которого начинается обход.
 * @param {string} oldPathPart - Часть пути, которую нужно заменить (например, "scene_1").
 * @param {string} newPathPart - Новая часть пути (например, "scene_2").
 * @param {number} newIndex - Новый индекс для data-id.
 */
function newPath(element, oldPathPart, newPathPart, newIndex, isTopLevel = true, depth = 0) {
    const logPrefix = '  '.repeat(depth);
    if (isTopLevel) {
        logToTextarea(`-- Начало: newPath для элемента ${element.tagName} (old: ${oldPathPart}, new: ${newPathPart}, index: ${newIndex}) --`);
    }
    const attributesToUpdate = ['data-path', 'id', 'data-target', 'data-parent', 'for'];

    // Обновляем атрибуты самого элемента
    attributesToUpdate.forEach(attr => {
        if (element.hasAttribute(attr)) {
            const oldValue = element.getAttribute(attr);
            if (oldValue && oldValue.includes(oldPathPart)) {
                const newValue = oldValue.replace(new RegExp(oldPathPart.replace('.', '\\.'), 'g'), newPathPart);
                element.setAttribute(attr, newValue);
                logToTextarea(`${logPrefix}Обновлен атрибут ${attr}: ${oldValue} -> ${newValue}`);
            }
        }
    });

    // Обновляем data-id и title только для элемента верхнего уровня
    if (isTopLevel) {
        if (element.hasAttribute('data-id')) {
            const oldDataId = element.getAttribute('data-id');
            element.setAttribute('data-id', newIndex);
            logToTextarea(`${logPrefix}Обновлен data-id: ${oldDataId} -> ${newIndex}`);
        }

        const titleElement = element.querySelector('[data-role="title"]');
        // Проверяем, что titleElement принадлежит текущему элементу, а не вложенному
        if (titleElement && titleElement.closest('[data-path]') === element) {
            const text = titleElement.textContent.trim();
            const baseName = text.replace(/\s+\d+$/, ''); // Удаляем старый номер
            titleElement.textContent = `${baseName} ${newIndex}`;
            logToTextarea(`${logPrefix}Обновлен заголовок (data-role="title"): ${text} -> ${titleElement.textContent}`);
        }
    }


    // Рекурсивно обходим дочерние элементы
    element.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            // Старая проверка, которая была слишком агрессивной, удалена.
            // Предыдущий фикс с isTopLevel делает ее ненужной.
            newPath(child, oldPathPart, newPathPart, newIndex, false, depth + 1);
        }
    });
    if (isTopLevel) {
        logToTextarea(`-- Конец: newPath для элемента ${element.tagName} --`);
    }
}

/**
 * Сдвигает элементы массива "вниз" (увеличивает их индекс), начиная с указанного элемента.
 * Используется, например, при добавлении нового элемента перед существующим.
 * @param {HTMLElement} container - Контейнер, содержащий элементы массива.
 * @param {number} startIndexInDOM - Индекс элемента в DOM-структуре контейнера, с которого начинается сдвиг (0-based).
 */
function shiftUp(container, startIndexInDOM) {
    logToTextarea(`--- Начало: shiftUp для контейнера ${container.id}, startIndexInDOM: ${startIndexInDOM} ---`);
    const items = Array.from(container.children);
    for (let i = items.length - 1; i >= startIndexInDOM; i--) {
        const item = items[i];
        const oldDataId = parseInt(item.getAttribute('data-id'));
        const newDataId = oldDataId + 1;
        logToTextarea(`  Обработка элемента с data-id: ${oldDataId}. Новый data-id: ${newDataId}`);
        
        const path = item.getAttribute('data-path'); // e.g., "scenes.scene_1"
        const lastDotIndex = path.lastIndexOf('.');
        const basePath = path.substring(0, lastDotIndex + 1); // e.g., "scenes."
        const itemBaseName = path.substring(lastDotIndex + 1, path.lastIndexOf('_')); // e.g., "scene"

        const oldPathPart = `${itemBaseName}_${oldDataId}`; // e.g., "scene_1"
        const newPathPart = `${itemBaseName}_${newDataId}`; // e.g., "scene_2"

        // Проверяем, существует ли уже элемент с новым путем/ID.
        // Это может произойти, если мы сдвигаем элементы, и новый ID совпадает с ID уже существующего элемента.
        // В таком случае, старый элемент с этим ID нужно удалить, чтобы избежать дублирования ID.
        const existingElementWithNewPath = document.getElementById(`${basePath}${newPathPart}`);
        if (existingElementWithNewPath) {
            logToTextarea(`  Обнаружен существующий элемент с новым путем (${basePath}${newPathPart}). Удаляем его.`);
            existingElementWithNewPath.remove();
        }
        
        newPath(item, oldPathPart, newPathPart, newDataId);
        logToTextarea(`  Элемент с data-id ${oldDataId} успешно сдвинут.`);
    }
    logToTextarea(`--- Конец: shiftUp ---`);
}

/**
 * Сдвигает элементы массива "вверх" (уменьшает их индекс), начиная с указанного элемента.
 * Используется, например, при удалении элемента.
 * @param {HTMLElement} container - Контейнер, содержащий элементы массива.
 * @param {number} startIndexInDOM - Индекс элемента в DOM-структуре контейнера, с которого начинается сдвиг (0-based).
 */
function shiftDown(container, startIndexInDOM) {
    logToTextarea(`--- Начало: shiftDown для контейнера ${container.id}, startIndexInDOM: ${startIndexInDOM} ---`);
    const items = Array.from(container.children);
    for (let i = startIndexInDOM; i < items.length; i++) {
        const item = items[i];
        const oldDataId = parseInt(item.getAttribute('data-id'));
        const newDataId = oldDataId - 1;

        if (newDataId < 1) { // Индексы должны быть >= 1
            logToTextarea(`  Пропуск элемента с data-id ${oldDataId}, так как новый data-id (${newDataId}) будет меньше 1.`);
            continue; 
        }
        logToTextarea(`  Обработка элемента с data-id: ${oldDataId}. Новый data-id: ${newDataId}`);

        const path = item.getAttribute('data-path'); // e.g., "scenes.scene_2"
        const lastDotIndex = path.lastIndexOf('.');
        const basePath = path.substring(0, lastDotIndex + 1); // e.g., "scenes."
        const itemBaseName = path.substring(lastDotIndex + 1, path.lastIndexOf('_')); // e.g., "scene"

        const oldPathPart = `${itemBaseName}_${oldDataId}`; // e.g., "scene_2"
        const newPathPart = `${itemBaseName}_${newDataId}`; // e.g., "scene_1"

        newPath(item, oldPathPart, newPathPart, newDataId);
        logToTextarea(`  Элемент с data-id ${oldDataId} успешно сдвинут.`);
    }
    logToTextarea(`--- Конец: shiftDown ---`);
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
 * Обработчик для пункта меню "Добавить перед" (data-action="add").
 * Добавляет новый элемент массива перед активным элементом.
 * @param {HTMLElement} menuItem - Пункт контекстного меню, вызвавший действие.
 */
async function handleAdd(menuItem) {
    logToTextarea('--- Начало: handleAdd (Добавить перед) ---');
    const activeElement = getActiveObject(menuItem);
    if (!activeElement) {
        showNotification('Не удалось найти активный элемент.', true);
        logToTextarea('--- Конец: handleAdd (ошибка) ---');
        return;
    }
    logToTextarea(`Активный элемент найден: ${activeElement.id}`);

    const parentContainer = activeElement.parentNode; // Контейнер, содержащий элементы массива
    if (!parentContainer) {
        showNotification('Не удалось найти родительский контейнер активного элемента.', true);
        logToTextarea('--- Конец: handleAdd (ошибка) ---');
        return;
    }
    logToTextarea(`Родительский контейнер найден: ${parentContainer.id}`);

    const elementIndexInDOM = Array.from(parentContainer.children).indexOf(activeElement);
    logToTextarea(`Индекс активного элемента в DOM: ${elementIndexInDOM}`);

    const currentPath = activeElement.dataset.path; // Путь активного элемента (например, "scenes.scene_1")
    logToTextarea(`Путь активного элемента: ${currentPath}`);

    // Сдвигаем все элементы, начиная с активного, на одну позицию вниз
    logToTextarea('Вызов shiftUp для сдвига элементов...');
    shiftUp(parentContainer, elementIndexInDOM);
    logToTextarea('shiftUp завершен.');

    // Создаем новый элемент с тем же путем, что был у активного элемента до сдвига
    logToTextarea(`Создание нового элемента с путем: ${currentPath}`);
    const newElement = await createAndBuildElement(currentPath);

    if (newElement) {
        logToTextarea('Новый элемент успешно создан. Вставка в DOM...');
        // Вставляем новый элемент на место, где раньше был активный элемент.
        // После shiftUp, элемент, который был на elementIndexInDOM, теперь находится на elementIndexInDOM + 1.
        // Поэтому мы вставляем newElement перед элементом, который сейчас находится на elementIndexInDOM.
        parentContainer.insertBefore(newElement, parentContainer.children[elementIndexInDOM]);
        showNotification('Новый элемент успешно добавлен перед активным.');
        logToTextarea('Новый элемент добавлен в DOM.');
    } else {
        showNotification('Не удалось добавить новый элемент.', true);
        logToTextarea('Ошибка: createAndBuildElement не вернул элемент.');
    }
    logToTextarea('--- Конец: handleAdd ---');
}

/**
 * Обработчик для пункта меню "Клонировать" (data-action="clone").
 * Создает копию активного элемента и вставляет ее после него.
 * @param {HTMLElement} menuItem - Пункт контекстного меню, вызвавший действие.
 */
function handleClone(menuItem) {
    logToTextarea('--- Начало: handleClone (Клонировать) ---');
    const activeElement = getActiveObject(menuItem);
    if (!activeElement) {
        showNotification('Не удалось найти активный элемент для клонирования.', true);
        logToTextarea('--- Конец: handleClone (ошибка) ---');
        return;
    }
    logToTextarea(`Активный элемент для клонирования найден: ${activeElement.id}`);

    const parentContainer = activeElement.parentNode;
    if (!parentContainer) {
        showNotification('Не удалось найти родительский контейнер.', true);
        logToTextarea('--- Конец: handleClone (ошибка) ---');
        return;
    }
    logToTextarea(`Родительский контейнер найден: ${parentContainer.id}`);

    const sourceDataId = parseInt(activeElement.getAttribute('data-id'));
    const sourcePath = activeElement.getAttribute('data-path');
    const elementIndexInDOM = Array.from(parentContainer.children).indexOf(activeElement);
    logToTextarea(`Исходный data-id: ${sourceDataId}, исходный путь: ${sourcePath}, индекс в DOM: ${elementIndexInDOM}`);

    // 1. Сдвигаем все элементы, идущие ПОСЛЕ активного, чтобы освободить место
    // Индекс для сдвига - это индекс следующего элемента
    const shiftStartIndex = elementIndexInDOM + 1;
    if (shiftStartIndex < parentContainer.children.length) {
        logToTextarea(`Вызов shiftUp для сдвига элементов, начиная с индекса ${shiftStartIndex}...`);
        shiftUp(parentContainer, shiftStartIndex);
        logToTextarea('shiftUp завершен.');
    } else {
        logToTextarea('Активный элемент является последним, сдвиг не требуется.');
    }

    // 2. Создаем глубокую копию активного элемента
    const cloneElement = activeElement.cloneNode(true);
    logToTextarea('Создана глубокая копия элемента.');

    // 3. Обновляем пути и ID для клонированного элемента
    const newDataId = sourceDataId + 1;
    logToTextarea(`Новый data-id для клона: ${newDataId}`);

    const lastDotIndex = sourcePath.lastIndexOf('.');
    const basePath = sourcePath.substring(0, lastDotIndex + 1); // e.g., "scenes."
    const itemBaseName = sourcePath.substring(lastDotIndex + 1, sourcePath.lastIndexOf('_')); // e.g., "scene"

    const oldPathPart = `${itemBaseName}_${sourceDataId}`; // e.g., "scene_1"
    const newPathPart = `${itemBaseName}_${newDataId}`;   // e.g., "scene_2"
    logToTextarea(`Старая часть пути: ${oldPathPart}, новая: ${newPathPart}`);

    logToTextarea('Вызов newPath для обновления путей в клоне...');
    newPath(cloneElement, oldPathPart, newPathPart, newDataId);
    logToTextarea('newPath для клона завершен.');

    // 4. Вставляем обновленный клон в DOM после активного элемента
    logToTextarea('Вставка клонированного элемента в DOM...');
    activeElement.after(cloneElement);
    showNotification('Элемент успешно клонирован.');
    logToTextarea('Клон успешно вставлен в DOM.');
    logToTextarea('--- Конец: handleClone ---');
}

/**
 * Обработчик для пункта меню "Выше" (data-action="move-up").
 * Перемещает активный элемент на одну позицию вверх в списке.
 * @param {HTMLElement} menuItem - Пункт контекстного меню, вызвавший действие.
 */
function handleMoveUp(menuItem) {
    logToTextarea('--- Начало: handleMoveUp (Выше) ---');
    const activeElement = getActiveObject(menuItem);
    if (!activeElement) {
        showNotification('Не удалось найти активный элемент.', true);
        logToTextarea('--- Конец: handleMoveUp (ошибка: не найден активный элемент) ---');
        return;
    }

    const activeId = parseInt(activeElement.getAttribute('data-id'));
    if (activeId <= 1) {
        showNotification('Элемент уже находится в самом верху.');
        logToTextarea('--- Конец: handleMoveUp (элемент уже наверху) ---');
        return;
    }

    const parentContainer = activeElement.parentNode;
    const prevId = activeId - 1;
    // Ищем элемент с предыдущим ID внутри того же родительского контейнера
    const prevElement = Array.from(parentContainer.children).find(child => parseInt(child.getAttribute('data-id')) === prevId);


    if (!prevElement) {
        showNotification('Не удалось найти предыдущий элемент для обмена.', true);
        logToTextarea(`--- Конец: handleMoveUp (ошибка: не найден элемент с data-id=${prevId}) ---`);
        return;
    }
    
    logToTextarea(`Перемещение элемента ${activeId} вверх. Обмен с элементом ${prevId}.`);

    // Согласно документации, более простой способ - просто поменять их местами в DOM,
    // а затем обновить пути. Это атомарно и меньше влияет на DOM.
    
    // 1. Запоминаем данные обоих элементов
    const activePath = activeElement.getAttribute('data-path');
    const activeNamePart = activePath.substring(0, activePath.lastIndexOf('_')); // "scenes.scene"
    const activeOldPath = `${activeNamePart}_${activeId}`;
    const activeNewPath = `${activeNamePart}_${prevId}`;

    const prevPath = prevElement.getAttribute('data-path');
    const prevNamePart = prevPath.substring(0, prevPath.lastIndexOf('_')); // "scenes.scene"
    const prevOldPath = `${prevNamePart}_${prevId}`;
    const prevNewPath = `${prevNamePart}_${activeId}`;

    // 2. Меняем элементы местами в DOM
    parentContainer.insertBefore(activeElement, prevElement);
    logToTextarea(`Элементы ${activeId} и ${prevId} поменялись местами в DOM.`);

    // 3. Обновляем пути в АКТИВНОМ элементе, присваивая ему ID ПРЕДЫДУЩЕГО
    logToTextarea(`Обновление бывшего активного элемента (${activeId} -> ${prevId})...`);
    newPath(activeElement, activeOldPath.split('.').pop(), activeNewPath.split('.').pop(), prevId);

    // 4. Обновляем пути в ПРЕДЫДУЩЕМ элементе, присваивая ему ID АКТИВНОГО
    logToTextarea(`Обновление бывшего предыдущего элемента (${prevId} -> ${activeId})...`);
    newPath(prevElement, prevOldPath.split('.').pop(), prevNewPath.split('.').pop(), activeId);

    showNotification('Элемент успешно перемещен вверх.');
    logToTextarea('--- Конец: handleMoveUp ---');
}

/**
 * Обработчик для пункта меню "Ниже" (data-action="move-down").
 * Перемещает активный элемент на одну позицию вниз в списке.
 * @param {HTMLElement} menuItem - Пункт контекстного меню, вызвавший действие.
 */
function handleMoveDown(menuItem) {
    logToTextarea('--- Начало: handleMoveDown (Ниже) ---');
    const activeElement = getActiveObject(menuItem);
    if (!activeElement) {
        showNotification('Не удалось найти активный элемент.', true);
        logToTextarea('--- Конец: handleMoveDown (ошибка: не найден активный элемент) ---');
        return;
    }

    const parentContainer = activeElement.parentNode;
    const activeId = parseInt(activeElement.getAttribute('data-id'));
    const itemCount = parentContainer.children.length;

    if (activeId >= itemCount) {
        showNotification('Элемент уже находится в самом низу.');
        logToTextarea('--- Конец: handleMoveDown (элемент уже внизу) ---');
        return;
    }

    const nextId = activeId + 1;
    const nextElement = Array.from(parentContainer.children).find(child => parseInt(child.getAttribute('data-id')) === nextId);

    if (!nextElement) {
        showNotification('Не удалось найти следующий элемент для обмена.', true);
        logToTextarea(`--- Конец: handleMoveDown (ошибка: не найден элемент с data-id=${nextId}) ---`);
        return;
    }
    
    logToTextarea(`Перемещение элемента ${activeId} вниз. Обмен с элементом ${nextId}.`);

    // 1. Запоминаем данные обоих элементов
    const activePath = activeElement.getAttribute('data-path');
    const activeNamePart = activePath.substring(0, activePath.lastIndexOf('_')); // e.g. "scenes.scene"
    const activeOldPathPart = `${activeNamePart.split('.').pop()}_${activeId}`;
    const activeNewPathPart = `${activeNamePart.split('.').pop()}_${nextId}`;

    const nextPath = nextElement.getAttribute('data-path');
    const nextNamePart = nextPath.substring(0, nextPath.lastIndexOf('_')); // e.g. "scenes.scene"
    const nextOldPathPart = `${nextNamePart.split('.').pop()}_${nextId}`;
    const nextNewPathPart = `${nextNamePart.split('.').pop()}_${activeId}`;

    // 2. Меняем элементы местами в DOM, вставляя следующий элемент перед активным
    parentContainer.insertBefore(nextElement, activeElement);
    logToTextarea(`Элементы ${activeId} и ${nextId} поменялись местами в DOM.`);

    // 3. Обновляем пути в АКТИВНОМ элементе, присваивая ему ID СЛЕДУЮЩЕГО
    logToTextarea(`Обновление бывшего активного элемента (${activeId} -> ${nextId})...`);
    newPath(activeElement, activeOldPathPart, activeNewPathPart, nextId);

    // 4. Обновляем пути в бывшем СЛЕДУЮЩЕМ элементе, присваивая ему ID АКТИВНОГО
    logToTextarea(`Обновление бывшего следующего элемента (${nextId} -> ${activeId})...`);
    newPath(nextElement, nextOldPathPart, nextNewPathPart, activeId);

    showNotification('Элемент успешно перемещен вниз.');
    logToTextarea('--- Конец: handleMoveDown ---');
}

/**
 * Обработчик для пункта меню "Очистить" (data-action="clear").
 * Заменяет содержимое активного элемента его "чистой" версией.
 * @param {HTMLElement} menuItem - Пункт контекстного меню, вызвавший действие.
 */
async function handleClear(menuItem) {
    logToTextarea('--- Начало: handleClear (Очистить) ---');
    const activeElement = getActiveObject(menuItem);
    if (!activeElement) {
        showNotification('Не удалось найти элемент для очистки.', true);
        logToTextarea('--- Конец: handleClear (ошибка: не найден активный элемент) ---');
        return;
    }

    const path = activeElement.dataset.path;
    if (!path) {
        showNotification('Не удалось определить путь элемента для его пересоздания.', true);
        logToTextarea('--- Конец: handleClear (ошибка: отсутствует data-path) ---');
        return;
    }
    
    logToTextarea(`Очистка элемента с путем: ${path}`);

    const newElement = await createAndBuildElement(path);

    if (newElement && activeElement.parentNode) {
        activeElement.parentNode.replaceChild(newElement, activeElement);
        showNotification('Элемент успешно очищен.');
        logToTextarea(`Элемент ${path} был заменен новой версией.`);
    } else {
        showNotification('Не удалось очистить элемент.', true);
        logToTextarea(`Ошибка при замене элемента ${path}.`);
    }
    logToTextarea('--- Конец: handleClear ---');
}

/**
 * Обработчик для пункта меню "Удалить" (data-action="delete").
 * Удаляет активный элемент согласно документации: сдвигает последующие
 * элементы и удаляет последний. Если элемент единственный в контейнере,
 * то вместо удаления он очищается.
 * @param {HTMLElement} menuItem - Пункт контекстного меню, вызвавший действие.
 */
function handleDelete(menuItem) {
    logToTextarea('--- Начало: handleDelete (Удалить) ---');
    const activeElement = getActiveObject(menuItem);
    if (!activeElement) {
        showNotification('Не удалось найти элемент для удаления.', true);
        logToTextarea('--- Конец: handleDelete (ошибка: не найден активный элемент) ---');
        return;
    }
    logToTextarea(`Элемент для удаления найден: ${activeElement.id}`);

    const parentContainer = activeElement.parentNode;
    if (!parentContainer) {
        showNotification('Не удалось найти родительский контейнер.', true);
        logToTextarea('--- Конец: handleDelete (ошибка: не найден родительский контейнер) ---');
        return;
    }
    logToTextarea(`Родительский контейнер найден: ${parentContainer.id}`);

    // НОВОЕ ТРЕБОВАНИЕ: Если элемент единственный в контейнере, то очистить его.
    if (parentContainer.children.length === 1) {
        logToTextarea('Элемент является единственным в контейнере. Вызов handleClear.');
        handleClear(menuItem); // Используем существующую функцию очистки
        logToTextarea('--- Конец: handleDelete (единственный элемент очищен) ---');
        return;
    }

    const items = Array.from(parentContainer.children);
    const elementIndexInDOM = items.indexOf(activeElement);

    // Шаг 1: Удаляем активный элемент, чтобы создать "пробел" для сдвига.
    activeElement.remove();
    logToTextarea('Активный элемент удален из DOM.');

    // Шаг 2: Сдвигаем все элементы, которые были после удаленного
    if (elementIndexInDOM < parentContainer.children.length) {
        logToTextarea(`Вызов shiftDown для сдвига элементов, начиная с индекса ${elementIndexInDOM}...`);
        shiftDown(parentContainer, elementIndexInDOM);
        logToTextarea('shiftDown завершен.');
    } else {
        logToTextarea('Удален последний элемент, сдвиг не требуется.');
    }

    showNotification('Элемент успешно удален.');
    logToTextarea('--- Конец: handleDelete ---');
}
