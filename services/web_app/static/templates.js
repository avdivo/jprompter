/**
 * Шаблоны элементов для динамического создания компонентов интерфейса
 * Используются для генерации HTML-элементов в JavaScript
 * Все шаблоны должны быть валидными HTML-фрагментами
 */

// Шаблоны для медиа-галереи
const mediaTemplates = {
    // Шаблон для элемента медиафайла (изображение или видео)
    mediaItem: `
        <div class="media-item" data-type="{{type}}" data-src="{{src}}">
            <img src="{{thumb}}" alt="{{alt}}" class="media-thumb">
            {{playIcon}}
            <button class="btn btn-icon-only remove-btn" title="Удалить">
                <i class="fa-solid fa-trash icon"></i>
            </button>
            <textarea class="media-note" placeholder="Подпись..."></textarea>
        </div>
    `,

    // Иконка воспроизведения для видео
    playIcon: `
        <div class="play-icon">▶</div>
    `,

    // Модальное окно для просмотра медиафайлов
    modal: `
        <div id="media-modal" class="modal hidden">
            <span id="modal-close" class="close">&times;</span>
            <div id="modal-content" class="modal-content"></div>
        </div>
    `,

    // Контейнер для галереи
    gallery: `
        <div class="media-gallery">
            <div class="gallery-controls">
                <input type="file" id="media-upload" accept="image/*,video/*" multiple>
                <label for="media-upload" class="btn btn-primary">
                    <i class="fa-solid fa-plus icon"></i> Выбрать файл
                </label>
            </div>
            <div id="media-container" class="media-container"></div>
        </div>
    `
};

// Шаблоны для форм
const formTemplates = {
    // Поле только для чтения
    readonly: `
        <div class="form-field">
            <label for="{{data-path}}">{{_label}}</label>
            <input type="text" class="form-control" data-path="{{data-path}}" id="{{data-path}}" data-type="readonly" value="{{_default}}" readonly>
        </div>
    `,

    // Текстовое поле
    text: `
        <div class="form-field">
            <label for="{{data-path}}">{{_label}}</label>
            <input type="text" class="form-control" data-path="{{data-path}}" id="{{data-path}}" data-type="text" value="{{_default}}" placeholder="{{_label}}">
        </div>
    `,

    // Цифровое поле
    number: `
        <div class="form-field">
            <label for="{{data-path}}">{{_label}}</label>
            <input type="number" class="form-control" data-path="{{data-path}}" id="{{data-path}}" data-type="number" value="{{_default}}" placeholder="{{_label}}">
        </div>
    `,

    // Многострочное текстовое поле
    textarea: `
        <div class="form-field">
            <label for="{{data-path}}">{{_label}}</label>
            <textarea class="form-control" data-path="{{data-path}}" id="{{data-path}}" data-type="textarea" placeholder="{{_label}}">{{_default}}</textarea>
        </div>
    `,

    // Поле для выбора цвета
    color: `
        <div class="form-field">
            <label for="{{data-path}}">{{_label}}</label>
            <input type="color" class="form-control" data-path="{{data-path}}" id="{{data-path}}" data-type="color" value="{{_default}}" placeholder="{{_label}}">
        </div>
    `,

    // Выпадающий список
    select: `
        <div class="form-field">
            <label for="{{data-path}}">{{_label}}</label>
            <select class="form-control" data-path="{{data-path}}" id="{{data-path}}" data-type="select">
                {{options}}
            </select>
        </div>
    `,

    // Опция для select
    selectOption: `
        <option value="{{_value}}" {{selected}}>{{_label}}</option>
    `,

    // Множественный выбор
    checkbox: `
        <div class="form-field">
            <label>{{_label}}</label>
            <div class="form-control checkbox-group">
                {{options}}
            </div>
        </div>
    `,

    // Опция для checkbox
    checkboxOption: `
        <label>
            <input type="checkbox" value="{{_value}}" data-path="{{data-path}}" id="{{data-path}}" data-type="checkbox" class="checkbox-input" {{checked}}>
            {{_label}}
        </label>
    `,

    // Блок со спойлером
    boxSpoiler: `
        <details class="form-field" data-path="{{data-path}}" id="{{data-path}}" data-type="box">
            <summary>
                {{_label}}
            </summary>
            <div class="content">
                {{content}}
            </div>
        </details>
    `,

    // Блок с заголовком
    boxTitle: `
        <div class="scene-block form-field" data-path="{{data-path}}" id="{{data-path}}" data-type="box">
            <div class="header-row">
                <h3>{{_label}}</h3>
            </div>
            <div class="content">
                {{content}}
            </div>
        </div>
    `,

    // Массив со спойлером
    arraySpoiler: `
        <details class="form-field" data-path="{{data-path}}" id="{{data-path}}" data-type="array">
            <summary>
                {{_label}}
                <div class="header-buttons">
                    <button class="btn btn-icon-only" data-parent="{{data-path}}" data-target="{{_obj}}" title="Очистить">
                        <i class="fa-solid fa-broom add-icon"></i>
                    </button>
                    <button class="btn btn-icon-only add-item-btn" data-parent="{{data-path}}" data-target="{{_obj}}" title="Добавить">
                        <i class="fa-solid fa-plus add-btn-icon"></i>
                    </button>
                </div>
            </summary>
            <div id="{{_obj}}" class="content">
                {{content}}
            </div>
        </details>
    `,

    // Массив с заголовком
    arrayTitle: `
        <div class="scene-block form-field" data-path="{{data-path}}" id="{{data-path}}" data-type="array">
            <div class="header-row">
                <h3>{{_label}}</h3>
                <div class="header-buttons">
                    <button class="btn btn-icon-only" data-parent="{{data-path}}" data-target="{{_obj}}" title="Очистить">
                        <i class="fa-solid fa-broom add-icon"></i>
                    </button>
                    <button class="btn btn-icon-only add-item-btn" data-parent="{{data-path}}" data-target="{{_obj}}" title="Добавить">
                        <i class="fa-solid fa-plus add-btn-icon"></i>
                    </button>
                </div>
            </div>
            <div id="{{_obj}}" class="content">
                {{content}}
            </div>
        </div>
    `,

    // Объект массива со спойлером
    objectSpoiler: `
        <details class="form-field" data-path="{{data-path}}_{{data-id}}" data-type="object" data-parent="{{_obj}}" data-id="{{data-id}}">
            <summary>
                <span>{{_label}} {{data-id}}</span>
                <div class="header-buttons">
                    <button class="btn btn-icon-only" data-parent="{{data-path}}_{{data-id}}" title="Очистить">
                        <i class="fa-solid fa-broom add-icon"></i>
                    </button>
                    <button class="btn btn-icon-only" data-parent="{{data-path}}_{{data-id}}" title="Удалить">
                        <i class="fa-solid fa-trash del-icon"></i>
                    </button>
                </div>
            </summary>
            <div class="content">
                {{content}}
            </div>
        </details>
    `,

    // Объект массива с заголовком
    objectTitle: `
        <div class="scene-block form-field" data-path="{{data-path}}_{{data-id}}" data-type="object" data-parent="{{_obj}}" data-id="{{data-id}}">
            <div class="header-row">
                <h3>{{_label}} {{data-id}}</h3>
                <div class="header-buttons">
                    <button class="btn btn-icon-only" data-parent="{{data-path}}_{{data-id}}" title="Очистить">
                        <i class="fa-solid fa-broom add-icon"></i>
                    </button>
                    <button class="btn btn-icon-only" data-parent="{{data-path}}_{{data-id}}" title="Удалить">
                        <i class="fa-solid fa-trash del-icon"></i>
                    </button>
                </div>
            </div>
            <div class="content">
                {{content}}
            </div>
        </div>
    `
};

// Функция для генерации HTML опций select из JSON
function generateSelectOptions(optionsJson, defaultValue = '') {
    return optionsJson.map(option => {
        const selected = option._value === defaultValue ? 'selected' : '';
        return `<option value="${option._value}" ${selected}>${option._label}</option>`;
    }).join('');
}

// Функция для генерации HTML чекбоксов из JSON
function generateCheckboxOptions(optionsJson, defaultValues = [], dataPath) {
    return optionsJson.map(option => {
        const checked = defaultValues.includes(option._value) ? 'checked' : '';
        return `<label><input type="checkbox" value="${option._value}" data-path="${dataPath}" data-type="checkbox" class="checkbox-input" ${checked}>${option._label}</label>`;
    }).join('');
}

// Функция для замены плейсхолдеров в шаблонах
function renderTemplate(templateName, data) {
    // Обработка select
    if (templateName === 'select' && data._options) {
        data.options = generateSelectOptions(data._options, data._default || '');
    }
    
    // Обработка checkbox
    if (templateName === 'checkbox' && data._options) {
        data.options = generateCheckboxOptions(data._options, data._default || [], data['data-path']);
    }
    
    const template = formTemplates[templateName];
    if (!template) throw new Error(`Template ${templateName} not found`);
    return template.replace(/\{\{([-\w]+)\}\}/g, (match, key) => {
        return data[key] || '';
    });
}

// Экспорт шаблонов для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mediaTemplates, renderTemplate };
}
