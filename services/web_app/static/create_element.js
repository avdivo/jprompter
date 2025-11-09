/**
 * Функция для создания HTML-элемента на основе пути в шаблоне
 * @param {string} path - Путь к элементу в форме (например, 'scenes_1.title')
 * @param {string} content - Контент для вставки в элемент (если требуется)
 * @param {string|number} dataId - Идентификатор элемента по умолчанию (если не найден в пути)
 * @returns {string} Отформатированный HTML код элемента
 */
function createElement(path, content = '', dataId = 1) {
    // Получаем шаблон из глобального хранилища
    const template = window.appData?.template;
    if (!template) {
        throw new Error('Шаблон не найден в appData');
    }

    // Получаем элемент по пути, очищенному от индексов
    const element = getElementByPath(template, path);
    if (!element) {
        throw new Error(`Элемент по пути '${path}' не найден в шаблоне`);
    }

    // Определяем тип элемента
    const type = element._type;
    if (!type) {
        throw new Error(`Тип элемента не определен для пути '${path}'`);
    }

    // Подготавливаем данные для рендеринга, используя полный путь из формы
    const data = prepareElementData(element, path, content, dataId);

    // Определяем имя шаблона на основе типа
    const templateName = getTemplateName(type, element);

    // Рендерим элемент с помощью renderTemplate
    return renderTemplate(templateName, data);
}

/**
 * Получает элемент из шаблона по пути из формы (очищая индексы _N)
 * @param {object} template - Шаблон
 * @param {string} formPath - Путь из формы (например, 'scenes_1.title')
 * @returns {object|null} Найденный элемент или null
 */
function getElementByPath(template, formPath) {
    const templateKeys = formPath.split('.').map(key => key.replace(/_\d+$/, ''));
    let current = template;

    for (const key of templateKeys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return null;
        }
    }

    return current;
}

/**
 * Подготавливает данные для рендеринга элемента
 * @param {object} element - Элемент из шаблона
 * @param {string} formPath - Полный путь к элементу в форме
 * @param {string} content - Контент
 * @param {string|number} defaultDataId - Идентификатор по умолчанию
 * @returns {object} Данные для renderTemplate
 */
function prepareElementData(element, formPath, content, defaultDataId) {
    let finalDataId = defaultDataId;
    let basePath = formPath; // По умолчанию используем полный путь
    const match = formPath.match(/_(\d+)$/);

    if (match) {
        finalDataId = parseInt(match[1], 10);
        // Если создается сам объект массива, его data-path должен быть базовым,
        // так как renderTemplate добавит к нему индекс.
        if (element._type === 'object') {
            basePath = formPath.substring(0, match.index);
        }
    } else {
        finalDataId = 1; // Если суффикс _N отсутствует, ID равен 1
    }

    const data = {
        'data-path': basePath, // Используем basePath, который был условно изменен
        content: content,
        'data-id': finalDataId
    };

    // Копируем свойства из элемента
    if (element._label) data._label = element._label;
    if (element._default !== undefined) data._default = element._default;
    if (element._options) data._options = element._options;

    // Для блоков, массивов и объектов устанавливаем _label из _spoiler или _title
    if (element._type === 'box' || element._type === 'array' || element._type === 'object') {
        if (element._spoiler) {
            data._label = element._spoiler;
        } else if (element._title) {
            data._label = element._title;
        } else {
            data._label = '';
        }
    }

    // Для массивов, находим имя шаблона объекта
    if (element._type === 'array') {
        const objectTemplateKey = Object.keys(element).find(key => !key.startsWith('_'));
        if (objectTemplateKey) {
            data._obj = objectTemplateKey;
        }
    }

    // Для объектов, если они являются частью массива, находим путь к родительскому массиву
    if (element._type === 'object') {
        const pathParts = formPath.split('.');
        if (pathParts.length > 1) {
            const parentPath = pathParts.slice(0, -1).join('.');
            const parentElement = getElementByPath(window.appData.template, parentPath);
            if (parentElement && parentElement._type === 'array') {
                data._obj = parentPath; // `_obj` здесь используется для `data-parent`
            }
        }
    }

    return data;
}

/**
 * Определяет имя шаблона на основе типа элемента
 * @param {string} type - Тип элемента
 * @param {object} element - Элемент из шаблона
 * @returns {string} Имя шаблона
 */
function getTemplateName(type, element) {
    switch (type) {
        case 'readonly':
        case 'text':
        case 'number':
        case 'textarea':
        case 'color':
            return type;
        case 'select':
            return 'select';
        case 'checkbox':
            return 'checkbox';
        case 'box':
            return element._spoiler ? 'boxSpoiler' : 'boxTitle';
        case 'array':
            return element._spoiler ? 'arraySpoiler' : 'arrayTitle';
        case 'object':
            return element._spoiler ? 'objectSpoiler' : 'objectTitle';
        default:
            throw new Error(`Неизвестный тип элемента: ${type}`);
    }
}

// Экспорт функции для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createElement };
}