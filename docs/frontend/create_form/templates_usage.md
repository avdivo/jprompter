# Спецификация использования функции renderTemplate

Функция `renderTemplate(templateName, data)` предназначена для генерации HTML-элементов интерфейса на основе предопределенных шаблонов. Она принимает имя шаблона (строку) и объект данных для замены плейсхолдеров.

> **Примечание:** Эта функция является низкоуровневым шаблонизатором. В большинстве случаев для динамического создания элементов на основе общего шаблона `appData` следует использовать более удобную высокоуровневую функцию `createElement`. См. [документацию `createElement`](./create_element_usage.md).

## Группа 1: Простые поля (readonly, text, number, textarea, color)

Шаблоны: `readonly`, `text`, `number`, `textarea`, `color`.

### Переменные данных
- `data-path` (string): Путь к данным в форме, используется как ID элемента и атрибут data-path.
- `_label` (string): Текст метки поля.
- `_default` (string|number): Значение по умолчанию для поля.

### Пример вызова
```javascript
const data = {
    'data-path': 'main.title',
    '_label': 'Название ролика',
    '_default': 'Мой ролик'
};

const html = renderTemplate('text', data);
```

**Результат:**
```html
<div class="form-field">
    <label for="main.title">Название ролика</label>
    <input type="text" class="form-control" data-path="main.title" id="main.title" data-type="text" value="Мой ролик" placeholder="Название ролика">
</div>
```

## Группа 2: Выпадающий список (select)

Шаблон: `select`.

### Переменные данных
- `data-path` (string): Путь к данным в форме, используется как ID элемента и атрибут data-path.
- `_label` (string): Текст метки поля.
- `_default` (string): Значение по умолчанию, определяет выбранную опцию.
- `_options` (array): Массив объектов опций, каждый объект содержит `_value` (string) и `_label` (string).

### Пример вызова
```javascript
const data = {
    'data-path': 'main.transition',
    '_label': 'Тип перехода',
    '_default': 'fade',
    '_options': [
        {'_value': 'none', '_label': 'Нет'},
        {'_value': 'fade', '_label': 'Плавный'},
        {'_value': 'slide', '_label': 'Скольжение'}
    ]
};

const html = renderTemplate('select', data);
```

**Результат:**
```html
<div class="form-field">
    <label for="main.transition">Тип перехода</label>
    <select class="form-control" data-path="main.transition" id="main.transition" data-type="select">
        <option value="none">Нет</option>
        <option value="fade" selected>Плавный</option>
        <option value="slide">Скольжение</option>
    </select>
</div>
```

## Группа 3: Множественный выбор (checkbox)

Шаблон: `checkbox`.

### Переменные данных
- `data-path` (string): Путь к данным в форме, используется как атрибут data-path для чекбоксов.
- `_label` (string): Текст метки группы чекбоксов.
- `_default` (array): Массив строковых значений, определяющих отмеченные по умолчанию чекбоксы.
- `_options` (array): Массив объектов опций, каждый объект содержит `_value` (string) и `_label` (string).

### Пример вызова
```javascript
const data = {
    'data-path': 'features',
    '_label': 'Дополнительные эффекты',
    '_default': ['sound', 'subtitles'],
    '_options': [
        {'_value': 'sound', '_label': 'Звук'},
        {'_value': 'subtitles', '_label': 'Субтитры'},
        {'_value': 'effects', '_label': 'Эффекты'}
    ]
};

const html = renderTemplate('checkbox', data);
```

**Результат:**
```html
<div class="form-field">
    <label>Дополнительные эффекты</label>
    <div class="form-control checkbox-group">
        <label>
            <input type="checkbox" value="sound" data-path="features" data-type="checkbox" class="checkbox-input" checked>
            Звук
        </label>
        <label>
            <input type="checkbox" value="subtitles" data-path="features" data-type="checkbox" class="checkbox-input" checked>
            Субтитры
        </label>
        <label>
            <input type="checkbox" value="effects" data-path="features" data-type="checkbox" class="checkbox-input">
            Эффекты
        </label>
    </div>
</div>
```

## Группа 4: Блок (boxTitle, boxSpoiler)

Шаблоны: `boxTitle`, `boxSpoiler`.

### Переменные данных
- `data-path` (string): Путь к данным блока, используется как ID элемента и атрибут data-path.
- `_label` (string): Заголовок блока.
- `content` (string): HTML-содержимое блока.

### Пример вызова
```javascript
const data = {
    'data-path': 'main',
    '_label': 'Главное',
    'content': '<p>Содержимое блока</p>'
};

const html = renderTemplate('boxTitle', data);
```

**Результат:**
```html
<div class="scene-block form-field" data-path="main" id="main" data-type="box">
    <div class="header-row">
        <h3>Главное</h3>
    </div>
    <div class="content">
        <p>Содержимое блока</p>
    </div>
</div>
```

## Группа 5: Массив (arrayTitle, arraySpoiler)

Шаблоны: `arrayTitle`, `arraySpoiler`.

### Переменные данных
- `data-path` (string): Путь к массиву, используется как ID элемента и атрибут data-path.
- `_obj` (string): Имя контейнера объектов массива.
- `_label` (string): Заголовок массива.
- `content` (string): HTML-содержимое массива (объекты).

### Пример вызова
```javascript
const data = {
    'data-path': 'scenes',
    '_obj': 'scene',
    '_label': 'Сцены',
    'content': '<div>Объект сцены 1</div><div>Объект сцены 2</div>'
};

const html = renderTemplate('arrayTitle', data);
```

**Результат:**
```html
<div class="scene-block form-field" data-path="scenes" id=1 data-type="array">
    <div class="header-row">
        <h3>Сцены</h3>
        <div class="header-buttons">
            <button class="btn btn-icon-only" data-action="clear-items" data-target="scene" title="Очистить">
                <i class="fa-solid fa-broom add-icon"></i>
            </button>
            <button class="btn btn-icon-only add-item-btn" data-action="add-item" data-target="scene" title="Добавить">
                <i class="fa-solid fa-plus add-btn-icon"></i>
            </button>
        </div>
    </div>
    <div id="scene" class="content">
        <div>Объект сцены 1</div>
        <div>Объект сцены 2</div>
    </div>
</div>
```

## Группа 6: Объект массива (objectTitle, objectSpoiler)

Шаблоны: `objectTitle`, `objectSpoiler`.

### Переменные данных
- `data-path` (string): Базовый путь к объекту массива в шаблоне и выходном объекте, в форме используется для расчета полного пути: `${data-path}_${data-id}`.
- `_obj` (string): Ссылка на родительский массив.
- `data-id` (string): Идентификатор объекта (используется в полном пути и метке).
- `_label` (string): Базовое имя объекта.
- `content` (string): HTML-содержимое объекта.

### Пример вызова
```javascript
const data = {
    'data-path': 'scenes',
    '_obj': 'scene',
    'data-id': '1',
    '_label': 'Сцена',
    'content': '<p>Поля сцены</p>'
};

const html = renderTemplate('objectTitle', data);
```

**Результат:**
```html
<div class="scene-block form-field" data-path="scenes_1" data-type="object" data-parent="scene" data-id="1">
    <div class="header-row">
        <h3>Сцена 1</h3>
        <div class="header-buttons">
            <button class="btn btn-icon-only context-menu-btn" title="Действия">
                <i class="fa-solid fa-ellipsis-vertical fa-fw"></i>
            </button>
        </div>
    </div>
    <div class="content">
        <p>Поля сцены</p>
    </div>
</div>