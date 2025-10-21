function generateAnswerJSON() {
    const form = document.querySelector('#form-view-format');
    if (!form) return '{}';

    function processElement(element) {
        const data = {};

        // 1. Собираем поля на текущем уровне
        const directFields = element.querySelectorAll(':scope > .content > .form-field');
        directFields.forEach(fieldContainer => {
            const field = fieldContainer.querySelector('input:not([type="checkbox"]), select, textarea');
            if (field && field.name) {
                data[field.name] = field.value;
            }
            const checkboxes = fieldContainer.querySelectorAll('input[type="checkbox"]');
             checkboxes.forEach(cb => {
                if(cb.name){
                    if (!data[cb.name]) {
                        data[cb.name] = [];
                    }
                    if (cb.checked) {
                        data[cb.name].push(cb.value);
                    }
                }
             });
        });

        // 2. Рекурсивно обрабатываем вложенные <details>
        const childDetails = element.querySelectorAll(':scope > .content > details');
        childDetails.forEach(detail => {
            const key = detail.dataset.section || detail.dataset.sectionType;
            if (!key) return;

            const isList = detail.querySelector('summary > .add-item-btn') !== null;

            if (isList) {
                const listKey = key.replace('-container', '').replace('-item', '');
                data[listKey] = [];
                const items = detail.querySelectorAll(':scope > .content > details[data-id]');
                items.forEach(item => {
                    data[listKey].push(processElement(item));
                });
            } else {
                // Для обычных вложенных секций создаем вложенный объект
                data[key] = processElement(detail);
            }
        });
        
        if (element.dataset.id) {
            data.id = parseInt(element.dataset.id, 10);
        }

        return data;
    }
    
    // Начинаем с корневых <details> внутри .form-container
    const result = {};
    const rootDetails = form.querySelectorAll(':scope > details');
    rootDetails.forEach(detail => {
        const key = detail.dataset.section || detail.dataset.sectionType;
        if(key){
             if (key === 'scenes-container') {
                // Специальная обработка для контейнера сцен
                result['scenes'] = [];
                const sceneItems = detail.querySelectorAll(':scope > .content > details[data-section-type="scene"]');
                sceneItems.forEach(sceneItem => {
                    result['scenes'].push(processElement(sceneItem));
                });
             } else {
                result[key] = processElement(detail);
             }
        }
    });

    return JSON.stringify(result, null, 2);
}