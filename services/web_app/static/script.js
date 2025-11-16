// Установите в true для включения режима отладки, который выводит подробные логи в текстовое поле.
// В продакшене следует установить в false или удалить.
window.DEBUG_MODE = true;

/**
 * Записывает отладочное сообщение в текстовое поле в режиме "Текст".
 * Функция активна только если window.DEBUG_MODE === true.
 * @param {string} message - Сообщение для логирования.
 */
function logToTextarea(message) {
    if (!window.DEBUG_MODE) {
        return;
    }

    const textarea = document.getElementById('prompt-full-text');
    if (textarea) {
        const timestamp = new Date().toLocaleTimeString();
        textarea.value += `[${timestamp}] ${message}\n`;
        // Автоматически прокручиваем вниз, чтобы видеть последние логи
        textarea.scrollTop = textarea.scrollHeight;
    }
}

/**
 * Показывает временное уведомление внизу экрана.
 * @param {string} message - Сообщение для отображения.
 * @param {number} [duration=1500] - Длительность отображения в миллисекундах.
 */
function showNotification(message, duration = 1500) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, duration);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // --- Cache DOM elements ---
    const spoilerToggleBtn = document.getElementById('spoiler-toggle-btn');
    const spoilerToggleBtnMobile = document.getElementById('spoiler-toggle-btn-mobile');
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuDropdown = document.getElementById('mobile-menu-dropdown');
    const copyBtn = document.getElementById('copy-btn');
    const copyBtnMobile = document.getElementById('copy-btn-mobile');
    const transformBtn = document.getElementById('transform-btn');
    const transformBtnMobile = document.getElementById('transform-btn-mobile');
    const textView = document.getElementById('form-view-text');
    const textarea = document.getElementById('prompt-full-text');
    const viewSwitcher = document.getElementById('view-switcher');
    const formViews = document.querySelectorAll('.form-view');

    // --- State variables ---
    let spoilersExpanded = false;

    // --- Functions ---

    function collapseAllSpoilers() {
        document.querySelectorAll('details').forEach(detail => detail.removeAttribute('open'));
    }

    function expandAllSpoilers() {
        document.querySelectorAll('details').forEach(detail => detail.setAttribute('open', ''));
    }

    function setSpoilerButtonsToExpand() {
        if (spoilerToggleBtn) {
            spoilerToggleBtn.title = 'Развернуть все спойлеры';
            spoilerToggleBtn.querySelector('i').className = 'fa-solid fa-expand icon';
        }
        if (spoilerToggleBtnMobile) {
            spoilerToggleBtnMobile.innerHTML = '<i class="fa-solid fa-expand icon"></i> Развернуть спойлеры';
        }
    }

    function setSpoilerButtonsToCollapse() {
        if (spoilerToggleBtn) {
            spoilerToggleBtn.title = 'Свернуть все спойлеры';
            spoilerToggleBtn.querySelector('i').className = 'fa-solid fa-compress icon';
        }
        if (spoilerToggleBtnMobile) {
            spoilerToggleBtnMobile.innerHTML = '<i class="fa-solid fa-compress icon"></i> Свернуть спойлеры';
        }
    }

    function toggleSpoilers() {
        if (spoilersExpanded) {
            collapseAllSpoilers();
            setSpoilerButtonsToExpand();
        } else {
            expandAllSpoilers();
            setSpoilerButtonsToCollapse();
        }
        spoilersExpanded = !spoilersExpanded;
    }

    /**
     * Updates the UI state of transform and spoiler buttons based on the active view.
     * @param {string} activeView - The name of the active view ('format', 'text', or 'media').
     */
    function updateControlPanelUI(activeView) {
        const spoilerBtn = document.getElementById('spoiler-toggle-btn');

        // Update Transform Button for both desktop and mobile
        const buttonsToUpdate = [
            { btn: transformBtn, isMobile: false },
            { btn: transformBtnMobile, isMobile: true }
        ];

        buttonsToUpdate.forEach(({ btn, isMobile }) => {
            if (!btn) return;

            switch (activeView) {
                case 'format':
                    btn.disabled = false;
                    btn.title = 'Переделать в текст';
                    if (isMobile) {
                        btn.innerHTML = '<i class="fa-solid fa-file-alt icon"></i> Переделать в текст';
                    } else {
                        btn.querySelector('i').className = 'fa-solid fa-file-alt icon';
                    }
                    break;
                case 'text':
                    btn.disabled = false;
                    btn.title = 'Форматировать';
                    if (isMobile) {
                        btn.innerHTML = '<i class="fa-solid fa-list icon"></i> Форматировать';
                    } else {
                        btn.querySelector('i').className = 'fa-solid fa-list icon';
                    }
                    break;
                case 'media':
                    btn.disabled = true;
                    btn.title = 'Недоступно в режиме медиа';
                    if (isMobile) {
                        btn.innerHTML = '<i class="fa-solid fa-list icon"></i> Форматировать';
                    } else {
                        btn.querySelector('i').className = 'fa-solid fa-list icon';
                    }
                    break;
            }
        });

        // Update Spoiler Button state
        if (spoilerBtn) {
            spoilerBtn.disabled = activeView !== 'format';
        }
    }


    function setTextareaHeight() {
        if (textView && textView.classList.contains('active') && textarea) {
            textarea.style.height = 'calc(100vh - 100px)';
        } else if (textarea) {
            textarea.style.height = 'calc(100vh - 200px)';
        }
    }

    // --- Event Listeners ---

    // Spoiler buttons
    if (spoilerToggleBtn) {
        spoilerToggleBtn.addEventListener('click', toggleSpoilers);
    }
    if (spoilerToggleBtnMobile) {
        spoilerToggleBtnMobile.addEventListener('click', () => {
            toggleSpoilers();
            mobileMenuDropdown.classList.remove('show');
            menuToggle.querySelector('i').className = 'fa-solid fa-bars';
        });
    }

    // View switcher
    if (viewSwitcher) {
        viewSwitcher.addEventListener('click', function(event) {
            const targetButton = event.target.closest('.segmented-control-btn');
            if (!targetButton || targetButton.classList.contains('active')) return;

            viewSwitcher.querySelectorAll('.segmented-control-btn').forEach(btn => btn.classList.remove('active'));
            targetButton.classList.add('active');

            const viewToShow = targetButton.dataset.view;
            formViews.forEach(view => {
                view.classList.toggle('active', view.id === `form-view-${viewToShow}`);
            });
            setTimeout(setTextareaHeight, 10);
        });
    }

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function(event) {
            event.stopPropagation();
            mobileMenuDropdown.classList.toggle('show');
            const icon = menuToggle.querySelector('i');
            icon.className = mobileMenuDropdown.classList.contains('show') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        });
    }

    // Close mobile menu on outside click
    document.addEventListener('click', function(event) {
        if (mobileMenuDropdown && !mobileMenuDropdown.contains(event.target) && menuToggle && !menuToggle.contains(event.target)) {
            mobileMenuDropdown.classList.remove('show');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fa-solid fa-bars';
            }
        }
    });

    // Mobile menu button synchronization
    if (transformBtnMobile) {
        transformBtnMobile.addEventListener('click', () => {
            document.getElementById('transform-btn')?.click();
            mobileMenuDropdown.classList.remove('show');
            menuToggle.querySelector('i').className = 'fa-solid fa-bars';
        });
    }

    if (copyBtnMobile) {
        copyBtnMobile.addEventListener('click', () => {
            document.getElementById('copy-btn')?.click();
            mobileMenuDropdown.classList.remove('show');
            menuToggle.querySelector('i').className = 'fa-solid fa-bars';
        });
    }

    // Copy button logic
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            if (window.appData && window.appData.template && window.appData.prompt && window.appData.prompt_type) {
                const textViewBtn = document.querySelector('#view-switcher .segmented-control-btn[data-view="text"]');
                if (textViewBtn && !textViewBtn.classList.contains('active')) {
                    textViewBtn.click();
                }
                if (textarea) {
                    textarea.value = JSON.stringify({ Данные: window.appData }, null, 2);
                }
                showNotification('Данные загружены в текстовое поле');
            } else {
                showNotification('Данные не найдены');
            }
        });
    }

    // Save button logic
    const saveButtons = document.querySelectorAll('button[title="Сохранить"]');
    const textViewBtn = document.querySelector('#view-switcher .segmented-control-btn[data-view="text"]');

    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (textarea && textViewBtn) {
                const fullHtml = `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
                textarea.value = fullHtml;

                if (!textViewBtn.classList.contains('active')) {
                    textViewBtn.click();
                }
                showNotification('DOM в виде HTML загружен в текстовое поле');
            } else {
                showNotification('Ошибка: не найдено текстовое поле или кнопка вида "Текст"');
            }
        });
    });

    // Window resize
    window.addEventListener('resize', setTextareaHeight);

    // --- Observers ---

    // Observer for view changes
    const viewObserver = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    const activeView = target.id.replace('form-view-', '');
                    updateControlPanelUI(activeView);
                }
            }
        }
    });

    // Start observing all form views
    formViews.forEach(view => {
        viewObserver.observe(view, { attributes: true });
    });


    // --- Initial Page Setup ---
    setTextareaHeight();
    collapseAllSpoilers();
    spoilersExpanded = false;
    setSpoilerButtonsToExpand();
    if (menuToggle) {
        menuToggle.querySelector('i').className = 'fa-solid fa-bars';
    }
    // Set initial UI state based on the default active view
    const initialActiveView = document.querySelector('.form-view.active');
    if (initialActiveView) {
        const activeViewName = initialActiveView.id.replace('form-view-', '');
        updateControlPanelUI(activeViewName);
    } else {
        updateControlPanelUI('format'); // Fallback
    }
});

// --- Global handlers (outside DOMContentLoaded) ---

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('media-modal');
        if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
            const modalContent = modal.querySelector('#modal-content');
            if (modalContent) modalContent.innerHTML = '';
        }
    }
});