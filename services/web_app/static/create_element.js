/**
 * Функция для создания HTML-элемента на основе пути в шаблоне
 * @param {string} path - Путь к элементу в шаблоне (например, 'main.title')
 * @param {string} content - Контент для вставки в элемент (если требуется)
 * @param {string|number} dataId - Идентификатор элемента (по умолчанию 1)
 * @returns {string} Отформатированный HTML код элемента
 */
function createElement(path, content = '', dataId = 1) {
    // Получаем шаблон из глобального хранилища
    const template = window.appData?.template;
    if (!template) {
        throw new Error('Шаблон не найден в appData');
    }

    // Получаем элемент по пути
    const element = getElementByPath(template, path);
    if (!element) {
        throw new Error(`Элемент по пути '${path}' не найден в шаблоне`);
    }

    // Определяем тип элемента
    const type = element._type;
    if (!type) {
        throw new Error(`Тип элемента не определен для пути '${path}'`);
    }

    // Подготавливаем данные для рендеринга
    const data = prepareElementData(element, path, content, dataId);

    // Определяем имя шаблона на основе типа
    const templateName = getTemplateName(type, element);

    // Рендерим элемент с помощью renderTemplate
    return renderTemplate(templateName, data);
}

/**
 * Получает элемент из шаблона по пути
 * @param {object} template - Шаблон
 * @param {string} path - Путь (например, 'main.title')
 * @returns {object|null} Найденный элемент или null
 */
function getElementByPath(template, path) {
    const keys = path.split('.');
    let current = template;

    for (const key of keys) {
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
 * @param {string} path - Путь к элементу
 * @param {string} content - Контент
 * @param {string|number} dataId - Идентификатор
 * @returns {object} Данные для renderTemplate
 */
function prepareElementData(element, path, content, dataId) {
    const data = {
        'data-path': path,
        content: content,
        'data-id': dataId
    };

    // Копируем свойства из элемента
    if (element._label) data._label = element._label;
    if (element._default !== undefined) data._default = element._default;
    if (element._options) data._options = element._options;
    if (element._obj) data._obj = element._obj;

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