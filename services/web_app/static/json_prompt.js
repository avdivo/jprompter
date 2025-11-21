/**
 * Получает значение из элемента формы на основе его типа.
 * @param {string} path - data-path элемента.
 * @param {object} fieldTemplate - Узел шаблона для этого поля.
 * @returns {*} - Значение поля.
 */
function getValue(path, fieldTemplate) {
    const type = fieldTemplate._type;
    
    if (type === 'checkbox') {
        const checked = [];
        const elements = document.querySelectorAll(`input[data-path="${path}"]:checked`);
        elements.forEach(el => {
            checked.push(el.value);
        });
        return checked.length > 0 ? checked : null;
    }

    const element = document.querySelector(`[data-path="${path}"]`);
    if (!element) {
        return null;
    }

    switch (type) {
        case 'readonly':
        case 'text':
        case 'number':
        case 'textarea':
        case 'color':
        case 'select':
            // Не отправляем значения 'none' для select
            if (type === 'select' && element.value === 'none') {
                return null;
            }
            return element.value !== '' ? element.value : null;
        default:
            return null;
    }
}

/**
 * Рекурсивно обрабатывает узел шаблона и собирает данные из формы.
 * @param {object} templateNode - Текущий узел шаблона для обработки.
 * @param {string} basePath - Базовый путь к текущему узлу.
 * @returns {object|null} - Собранный объект данных или null, если он пуст.
 */
function processNode(templateNode, basePath) {
    const result = {};
    let hasImportantChild = false;
    let importantChildHasValue = false;
    let hasAnyValue = false;

    const childFields = Object.keys(templateNode).filter(key => !key.startsWith('_'));

    // Проверяем, есть ли среди дочерних элементов обязательные
    childFields.forEach(key => {
        if (templateNode[key]._important) {
            hasImportantChild = true;
        }
    });

    for (const key of childFields) {
        const fieldTemplate = templateNode[key];
        const currentPath = basePath ? `${basePath}.${key}` : key;
        const type = fieldTemplate._type;

        let value;

        if (['box', 'object'].includes(type)) {
            value = processNode(fieldTemplate, currentPath);
        } else if (type === 'array') {
            const arrayAsObject = {};
            const objectTemplateKey = Object.keys(fieldTemplate).find(k => !k.startsWith('_'));
            if (objectTemplateKey) {
                const objectTemplate = fieldTemplate[objectTemplateKey];
                let index = 1;
                while (true) {
                    const itemKey = `${objectTemplateKey}_${index}`;
                    const itemPath = `${currentPath}.${itemKey}`;
                    const elementExists = document.querySelector(`[data-path="${itemPath}"]`);
                    
                    if (!elementExists) {
                        break;
                    }
                    
                    const itemValue = processNode(objectTemplate, itemPath);
                    if (itemValue) {
                        arrayAsObject[itemKey] = itemValue;
                    }
                    index++;
                }
            }
            value = Object.keys(arrayAsObject).length > 0 ? arrayAsObject : null;
        } else {
            value = getValue(currentPath, fieldTemplate);
        }

        if (value !== null && (!Array.isArray(value) || value.length > 0)) {
            result[key] = value;
            hasAnyValue = true;
            if (fieldTemplate._important) {
                importantChildHasValue = true;
            }
        }
    }

    // Правила включения полей в выходной документ
    if (hasImportantChild && !importantChildHasValue) {
        return null;
    }

    if (!hasAnyValue) {
        return null;
    }

    return result;
}

/**
 * Главная функция для получения JSON из формы на основе шаблона.
 * @returns {object|null} - Готовый JSON-объект или null, если валидация не пройдена.
 */
function getJsonFromForm() {
    if (!window.appData || !window.appData.template) {
        console.error('Шаблон (window.appData.template) не найден.');
        return null;
    }

    const template = window.appData.template;

    // 1. Проверка обязательных полей в корне шаблона.
    const versionValue = getValue('version', template.version);
    if (!versionValue) {
        alert('Не указана версия шаблона');
        return null;
    }

    const titleValue = getValue('title', template.title);
    if (!titleValue) {
        alert('Не указано название промпта');
        return null;
    }

    // 2. Рекурсивный обход шаблона и сбор данных.
    const result = processNode(template, '');
    
    // Если результат пустой (кроме обязательных полей), то ничего не возвращаем
    if (!result) {
        return null;
    }

    // В корне должны быть title и version, processNode их обработает,
    // но если они единственные, то они будут в result.
    // Если же result пуст, значит что-то пошло не так или форма пуста.
    // Дополнительно проверим, что обязательные корневые поля не были отфильтрованы.
    const finalJson = {
        version: versionValue,
        title: titleValue,
        ...result
    };

    // Удаляем дубликаты, если они есть
    delete finalJson.version;
    delete finalJson.title;

    // Финальная сборка
    const assembledJson = {
        version: versionValue,
        title: titleValue,
        ...result
    };

    // Проверка на наличие обязательного элемента в корне (кроме title/version)
    const rootImportantField = Object.keys(template).find(key => 
        !['version', 'title'].includes(key) && 
        !key.startsWith('_') && 
        template[key]._important
    );

    if (rootImportantField && !assembledJson[rootImportantField]) {
        console.error(`Обязательное корневое поле "${rootImportantField}" отсутствует в итоговом JSON.`);
        // Можно вывести alert или просто вернуть null
        alert(`Обязательное поле "${template[rootImportantField]._label || rootImportantField}" должно быть заполнено.`);
        return null;
    }

    return assembledJson;
}
