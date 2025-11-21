/**
 * Логика для работы с медиа-галереей
 * Обработка загрузки, просмотра, удаления медиафайлов
 * Управление модальным окном и галереей
 */

class MediaGallery {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.mediaItems = [];
        this.modal = null;
        this.init();
    }

    // Инициализация галереи
    init() {
        // Создаем модальное окно
        this.createModal();

        // Создаем контейнер галереи
        this.createGallery();

        // Настраиваем обработчики событий
        this.setupEventListeners();
    }

    // Создание модального окна
    createModal() {
        const modalHtml = renderMediaTemplate(mediaTemplates.modal, {});
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('media-modal');
    }

    // Создание контейнера галереи
    createGallery() {
        // Галерея уже создана в HTML, просто находим контейнер
        this.mediaContainer = document.getElementById('media-container');
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Загрузка файлов
        const uploadInput = document.getElementById('media-upload');

        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Модальное окно
        if (this.modal) {
            const closeBtn = this.modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal());
            }

            // Закрытие по клику вне модального окна
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });

            // Закрытие по клавише Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                    this.closeModal();
                }
            });
        }

        // Делегирование событий для динамически созданных элементов
        this.container.addEventListener('click', (e) => {
            const target = e.target;

            // Просмотр медиафайла
            if (target.classList.contains('media-thumb') || target.classList.contains('play-icon')) {
                const mediaItem = target.closest('.media-item');
                if (mediaItem) {
                    this.openMedia(mediaItem);
                }
            }

            // Удаление медиафайла
            if (target.closest('.remove-btn')) {
                const mediaItem = target.closest('.media-item');
                if (mediaItem) {
                    this.removeMedia(mediaItem);
                }
            }
        });
    }

    // Обработка загрузки файлов
    handleFileUpload(event) {
        const files = Array.from(event.target.files);

        files.forEach(file => {
            if (this.mediaItems.length >= 10) {
                showNotification('Максимум 10 медиафайлов', 2000);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const mediaData = {
                    file: file,
                    src: e.target.result,
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    name: file.name
                };

                this.addMediaItem(mediaData);
            };
            reader.readAsDataURL(file);
        });

        // Очищаем input
        event.target.value = '';
    }

    // Добавление медиа-элемента в галерею
    addMediaItem(mediaData) {
        const itemData = {
            type: mediaData.type,
            src: mediaData.src,
            thumb: mediaData.src, // Для изображений используем оригинал как превью
            alt: mediaData.name,
            playIcon: mediaData.type === 'video' ? mediaTemplates.playIcon : ''
        };

        const itemHtml = renderMediaTemplate(mediaTemplates.mediaItem, itemData);
        this.mediaContainer.insertAdjacentHTML('beforeend', itemHtml);

        // Сохраняем данные о файле
        const newItem = this.mediaContainer.lastElementChild;
        newItem._mediaData = mediaData;
        this.mediaItems.push(mediaData);

        showNotification('Медиафайл добавлен', 1500);
    }

    // Открытие медиафайла в модальном окне
    openMedia(mediaItem) {
        const type = mediaItem.dataset.type;
        const src = mediaItem.dataset.src;

        let content = '';

        if (type === 'image') {
            content = `<img src="${src}" alt="Просмотр" class="modal-image">`;
        } else if (type === 'video') {
            // Для видео создаем iframe с YouTube или обычный video элемент
            if (src.includes('youtube.com') || src.includes('youtu.be')) {
                const videoId = this.extractYouTubeId(src);
                content = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="modal-video"></iframe>`;
            } else {
                content = `<video src="${src}" controls autoplay class="modal-video"></video>`;
            }
        }

        const modalContent = this.modal.querySelector('#modal-content');
        modalContent.innerHTML = content;
        this.modal.classList.remove('hidden');
    }

    // Закрытие модального окна
    closeModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            const modalContent = this.modal.querySelector('#modal-content');
            modalContent.innerHTML = '';
        }
    }

    // Удаление медиафайла
    removeMedia(mediaItem) {
        const index = Array.from(mediaItem.parentNode.children).indexOf(mediaItem);
        if (index > -1) {
            this.mediaItems.splice(index, 1);
        }
        mediaItem.remove();
        showNotification('Медиафайл удален', 1500);
    }

    // Извлечение ID видео из YouTube URL
    extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length == 11) ? match[2] : null;
    }

    // Получение данных для отправки на сервер
    getMediaData() {
        return this.mediaItems.map((item, index) => ({
            index: index,
            type: item.type,
            name: item.name,
            data: item.src, // base64 или URL
            note: '' // можно получить из textarea
        }));
    }
}

// Инициализация галереи при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('form-view-media')) {
        window.mediaGallery = new MediaGallery('form-view-media');
    }
});