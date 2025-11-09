/**
 * Создает HTML-форму или ее часть на основе глобального шаблона.
 *
 * @param {string} [path=''] - Путь к элементу для создания (например, 'scenes.scene_3').
 *   Если путь не указан, функция строит всю форму с начальными индексами.
 * @returns {string} Сгенерированный HTML-код.
 */
function createForm(path = '') {
    const template = window.appData?.template;
    if (!template) {
        throw new Error('Шаблон не найден в window.appData');
    }

    // Если путь указан, строим только этот элемент
    if (path) {
        const templateNode = getElementByPath(template, path);
        if (!templateNode) {
            console.error(`Элемент для пути '${path}' не найден в шаблоне.`);
            return '';
        }
        return buildElementRecursively(path, templateNode);
    }

    // Если путь не указан, строим всю форму
    let fullFormHtml = '';
    const topLevelKeys = Object.keys(template).filter(key => !key.startsWith('_'));

    for (const key of topLevelKeys) {
        const templateNode = template[key];
        fullFormHtml += buildElementRecursively(key, templateNode);
    }

    return fullFormHtml;
}

/**
 * Рекурсивно строит HTML-элемент и его дочерние элементы.
 *
 * @param {string} formPath - Полный путь для элемента формы (с индексами).
 * @param {object} templateNode - Узел из шаблона, соответствующий элементу.
 * @returns {string} Сгенерированный HTML для данного элемента и его содержимого.
 */
function buildElementRecursively(formPath, templateNode) {
    if (!templateNode || typeof templateNode !== 'object') {
        return '';
    }

    const type = templateNode._type;
    const isContainer = ['box', 'object', 'array'].includes(type);

    // Базовый случай: простой элемент, не являющийся контейнером.
    if (!isContainer) {
        return createElement(formPath);
    }

    // Рекурсивный случай: для контейнеров строим внутреннее содержимое.
    let innerContent = '';
    const childKeys = Object.keys(templateNode).filter(key => !key.startsWith('_'));

    if (type === 'array') {
        // Для массива создаем первый элемент (с индексом _1) по его шаблону.
        const objectTemplateKey = childKeys[0];
        if (objectTemplateKey) {
            const objectTemplateNode = templateNode[objectTemplateKey];
            const firstItemPath = `${formPath}.${objectTemplateKey}_1`;
            innerContent += buildElementRecursively(firstItemPath, objectTemplateNode);
        }
    } else { // Для 'box' или 'object'
        // Итерируемся по всем дочерним ключам и строим их рекурсивно.
        for (const key of childKeys) {
            const childTemplateNode = templateNode[key];
            const childPath = `${formPath}.${key}`;
            innerContent += buildElementRecursively(childPath, childTemplateNode);
        }
    }

    // Создаем сам контейнер с уже сгенерированным внутренним содержимым.
    return createElement(formPath, innerContent);
}

// Экспорт для возможного использования в модульной среде (например, для тестов)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createForm, buildElementRecursively };
}
