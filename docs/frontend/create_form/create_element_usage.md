# Спецификация использования функции createElement

Функция `createElement(path, content)` предназначена для генерации HTML-элементов на основе глобального шаблона `window.appData.template`. Она является высокоуровневой оберткой над `renderTemplate` и автоматически подготавливает для нее данные.

> Эта функция является высокоуровневой оберткой и использует низкоуровневую функцию `renderTemplate` для непосредственной генерации HTML. Для получения подробной информации о шаблонах и переменных см. [документацию `renderTemplate`](./templates_usage.md).

Функция принимает путь к элементу (который может содержать индексы) и опциональный контент, а затем возвращает готовую HTML-строку.

## Основной принцип работы

1.  **Принимает `path`**: Путь может быть как простым (из шаблона, `main.title`), так и сложным (из формы, с индексами, `scenes.scene_1.title`).
2.  **Находит шаблон элемента**: Функция автоматически "очищает" путь от индексов (`scenes.scene_1` -> `scenes.scene`), чтобы найти описание элемента в `window.appData.template`.
3.  **Определяет `data-id`**: Если путь заканчивается на `_N`, то `N` становится ID элемента. В противном случае ID равен `1`.
4.  **Подготавливает данные**: На основе найденного шаблона и пути формируется объект `data` для `renderTemplate`.
5.  **Вызывает `renderTemplate`**: Вызывается соответствующий шаблонизатор (`text`, `boxTitle`, `arraySpoiler` и т.д.) для генерации HTML.

---

## Параметры функции

`createElement(path, content)`

-   **`path`** (string, обязательный): Путь к создаваемому элементу. Может быть путем из шаблона или из формы (с индексами).
-   **`content`** (string, необязательный): HTML-строка, которая будет вставлена внутрь контейнерных элементов (`box`, `array`, `object`). Для простых полей ( `text`, `number`) этот параметр игнорируется.

---

## Примеры использования

Предположим, в `window.appData.template` загружен следующий шаблон:

```json
{
  "main": {
    "_type": "box",
    "_title": "Главный блок",
    "title": {
      "_type": "text",
      "_label": "Название"
    }
  },
  "scenes": {
    "_type": "array",
    "_spoiler": "Сцены",
    "scene": {
      "_type": "object",
      "_title": "Сцена",
      "description": {
        "_type": "textarea",
        "_label": "Описание сцены"
      }
    }
  }
}
```

### Пример 1: Создание простого поля

Вызов для создания текстового поля `title` внутри блока `main`.

```javascript
const html = createElement('main.title');
```

**Результат:**
Будет вызван `renderTemplate('text', ...)` и сгенерирован HTML для текстового поля с `data-path="main.title"`.

### Пример 2: Создание блока (`box`)

Вызов для создания контейнера `main`. Внутрь будет помещен результат вызова из Примера 1.

```javascript
const innerContent = createElement('main.title');
const html = createElement('main', innerContent);
```

**Результат:**
Будет вызван `renderTemplate('boxTitle', ...)` и сгенерирован HTML-блок с заголовком "Главный блок", внутри которого будет находиться текстовое поле.
```html
<div class="scene-block form-field" data-path="main" data-type="box" id="main">
    <div class="header-row">
        <h3>Главный блок</h3>
    </div>
    <div class="content">
        <!-- Результат вызова createElement('main.title') -->
        <div class="form-field">
            <label for="main.title">Название</label>
            <input type="text" class="form-control" data-path="main.title" id="main.title" data-type="text" value="" placeholder="Название">
        </div>
    </div>
</div>
```

### Пример 3: Создание массива (`array`)

Вызов для создания контейнера для массива `scenes`.

```javascript
// Предположим, что `objectContent` — это HTML для одного или нескольких объектов сцен
const objectContent = createElement('scenes.scene_1'); 
const html = createElement('scenes', objectContent);
```

**Результат:**
Будет вызван `renderTemplate('arraySpoiler', ...)` и сгенерирован HTML-спойлер "Сцены" с кнопками "Добавить" и "Очистить". В `data-target` у кнопок будет `scene` (имя ключа объекта из шаблона).
```html
<details class="form-field" data-path="scenes" id="scenes" data-type="array">
    <summary>
      Сцены
      <div class="header-buttons">
        <button ... data-target="scene" title="Добавить">...</button>
      </div>  
    </summary>
    <div id="scene" class="content">
        <!-- Содержимое переменной objectContent -->
    </div>
</details>
```

### Пример 4: Создание объекта массива (`object`)

Это самый важный сценарий. Вызов для создания **первого** объекта в массиве `scenes`.

```javascript
// Создаем внутреннее поле для этого объекта
const innerContent = createElement('scenes.scene_1.description');

// Создаем сам объект, передавая в него дочерние поля
const html = createElement('scenes.scene_1', innerContent);
```

**Анализ вызова `createElement('scenes.scene_1', ...)`:**
1.  **`path`**: `scenes.scene_1`.
2.  **Поиск шаблона**: `getElementByPath` уберет `_1` и будет искать в `window.appData.template` путь `scenes.scene`. Он будет найден.
3.  **Подготовка данных (`prepareElementData`)**:
    *   `formPath` равен `scenes.scene_1`.
    *   `finalDataId` будет `1` (из `_1`).
    *   `basePath` будет `scenes.scene` (потому что тип элемента — `object`).
    *   `data._obj` (для `data-parent`) будет `scenes`.
    *   В `renderTemplate` будут переданы `data-path: 'scenes.scene'` и `data-id: 1`.
4.  **Результат**: `renderTemplate` сгенерирует HTML для объекта, где `data-path` будет `scenes.scene_1`, а `data-parent` будет `scenes`.

```html
<!-- Результат вызова createElement('scenes.scene_1', ...) -->
<div class="scene-block form-field" data-path="scenes.scene_1" data-type="object" data-parent="scenes" data-id="1">
    <div class="header-row">
        <h3>Сцена 1</h3>
        <div class="header-buttons">...</div>
    </div>
    <div class="content">
        <!-- Результат вызова createElement('scenes.scene_1.description') -->
        <div class="form-field">
            <label for="scenes.scene_1.description">Описание сцены</label>
            <textarea ... data-path="scenes.scene_1.description" ...></textarea>
        </div>
    </div>
</div>
```
Таким образом, функция корректно обрабатывает вложенность и индексацию, позволяя рекурсивно строить сложные формы.