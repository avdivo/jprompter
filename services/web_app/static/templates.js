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

// Функция для замены плейсхолдеров в шаблонах
function renderTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || '';
    });
}

// Экспорт шаблонов для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mediaTemplates, renderTemplate };
}
