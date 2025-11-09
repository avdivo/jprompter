# Спецификация на JSON шаблон, HTML форму и выходной JSON объект

Пример JSON шаблона
```json
{
  "version": {
    "_type": "readonly",
    "_label": "Версия шаблона",
    "_default": "1.0.0"
  },
  "main": {
    "_type": "box",
    "_title": "Главное",
    "title": {
      "_type": "text",
      "_label": "Название ролика",
      "_default": ""
    },
    "transition": {
      "_type": "select",
      "_label": "Тип перехода",
      "_options": [
        { "_value": "none", "_label": "Нет" },
        { "_value": "fade", "_label": "Плавный" }
      ],
      "_default": "none"
    }
  },
  "features": {
    "_type": "checkbox",
    "_label": "Дополнительные эффекты",
    "_options": [
      { "_value": "sound", "_label": "Звук" },
      { "_value": "subtitles", "_label": "Субтитры" }
    ],
    "_default": []
  },
  "scenes": {
    "_type": "array",
    "_spoiler": "Сцены",
    "scene": {
      "_type": "object",
      "_title": "Сцена",
      "name": {
        "_type": "text",
        "_label": "Название сцены",
        "_default": ""
      }, 
      "duration": {
        "_type": "number",
        "_label": "Длительность (секунд)",
      }, 
    }
  }
}
```

## Описание полей
Пояснение к примерам шаблонов элементов:
- data-path - полный путь в json шаблоне или в json объекте ответа до нужного элемента
- name - название поля из шаблона
- _label - метка для поля из шаблона
- _default - значение по умолчанию из шаблона, если не указано - опустить это свойство
- _value - значение выбора
- value - значение поля
- свойство data-type определяет тип элемента, туда записывается _type (их перечень ограничен существующими)

### Поле только для чтения (readonly)

#### В шаблоне (json)
```json
  name: {
    "_type": "readonly",
    "_label": "Версия шаблона",
    "_default": "1.0.0"
  }
```

#### В форме (html)
```html
<div class="form-field">
  <label for=data-path>_label</label>
  <input type="text" class="form-control" data-path=data-path id=data-path data-type=_type value=_default readonly>
</div>
```

#### В ответе (json)
```json
  name: value
```

---

### Текстовое поле (text)

#### В шаблоне (json)
```json
  name: {
    "_type": "text",
    "_label": "Название ролика",
    "_default": ""
  }
```

#### В форме (html)
```html
<div class="form-field">
  <label for=data-path>_label</label>
  <input type="text" class="form-control" data-path=data-path id=data-path data-type=_type value=_default placeholder=_label>
</div>
```
Если поля "_label" и/или "_default" отсутствуют в шаблоне - исключаем их из формы

#### В ответе (json)
```json
  name: value
```

---

### Цифровое поле (number)

#### В шаблоне (json)
```json
  name: {
    "_type": "number",
    "_label": "Длительность (секунд)",
    "_default": 5
  }
```

#### В форме (html)
```html
<div class="form-field">
  <label for=data-path>_label</label>
  <input type="number" class="form-control" data-path=data-path id=data-path data-type=_type value=_default placeholder=_label>
</div>
```
Если поля "_label" и/или "_default" отсутствуют в шаблоне - исключаем их из формы

#### В ответе (json)
```json
  name: value
```

---

### Многострочное текстовое поле (textarea)

#### В шаблоне (json)
```json
  name: {
    "_type": "textarea",
    "_label": "Описание ролика",
    "_default": ""
  }
```

#### В форме (html)
```html
<div class="form-field">
  <label for=data-path>_label</label>
  <textarea class="form-control" data-path=data-path id=data-path data-type=_type value=_default placeholder=_label></textarea>
</div>
```
Если поля "_label" и/или "_default" отсутствуют в шаблоне - исключаем их из формы

#### В ответе (json)
```json
  name: value
```

---

### Поле для выбора цвета (color)

#### В шаблоне (json)
```json
  name: {
    "_type": "color",
    "_label": "Цвет",
    "_default": ""
  }
```

#### В форме (html)
```html
<div class="form-field">
  <label for=data-path>_label</label>
  <input type="color" class="..." data-path=data-path id=data-path data-type=_type value=_default placeholder=_label>
</div>
```

Если поля "_label" и/или "_default" отсутствуют в шаблоне - исключаем их из формы

#### В ответе (json)
```json
  name: value
```

---

### Выпадающий список (select)

#### В шаблоне (json)
```json
  name: {
    "_type": "select",
    "_label": "Тип перехода",
    "_options": [
      { "value": "none", "_label": "Нет" },
      { "value": "fade", "_label": "Плавный" }
    ],
    "_default": "none"
  }
```

#### В форме (html)
```html
<div class="form-field">
  <label for=data-path>_label</label>
  <select class="form-control" data-path=data-path id=data-path data-type=_type>
    {{content}}
  </select>
</div>
```

##### Опции для выбора (content)
```html
  <option value=value [selected]>_options[]._label</option>
```
Если поля "_label" и/или "_default" отсутствуют в шаблоне - исключаем подпись из формы, выбор по умолчанию установится сам на первый элемент

#### В ответе (json)
```json
  name: _value
```

---

### Множественный выбор (checkbox)

#### В шаблоне (json)
```json
  name: {
    "_type": "checkbox",
    "_label": "Дополнительные эффекты",
    "_options": [
      { "_value": "none", "_label": "Нет" },
      { "_value": "subtitles", "_label": "Субтитры" }
    ],
    "_default": ["none"]
  }
```

#### В форме (html)
```html
  <div class="form-field">
    <label>_label</label>
    <div class="form-control checkbox-group">
      {{content}}
    </div>
  </div>
```
##### Опции для выбора (content)
```html
  <label>
    <input type="checkbox" value="none" data-path=data-path id=data-path data-type=_type class="checkbox-input">
    Нет
  </label > 
```
Если поля "_label" и/или "_default" отсутствуют в шаблоне - исключаем подпись из формы, выбор по умолчанию установится сам на первый элемент

#### В ответе (json)
```json
  name: [_value]
```

---

### Блок (box + _spoiler/_title)
Блоки  могут иметь 2 вида отображения:
- Блок со спойлером (_spoiler)
- Блок с заголовком (_title)

#### В шаблоне (json)
```json
  name: {
    "_type": "box"
    <"_spoiler": _label> или <"_title": _label>
    {{content}}
  }
```
Отсутствие _spoiler и _title расценивать как _title с пустым именем "_title": "". 

#### Блок со спойлером в форме (html)
```html
  <details class="form-field" data-path=data-path id=data-path data-type=_type>
    <summary>
      _label 
    </summary>
    <div class="content">
      {{content}}
    </div>
  </details>
```

#### Блок с заголовком в форме html
```html
  <div class="scene-block form-field" data-path=data-path id=data-path data-type=_type>
    <div class="header-row">
      <h3>_label</h3>
    </div>
    <div class="content">
      {{content}}
    </div>
  </div>
```

#### В ответе (json)
```json
  name: value
```

---

### Массив (array + _spoiler/_title)
Массивы могут иметь 2 вида отображения:
- Массив со спойлером (_spoiler)
- Массив с заголовком (_title)
- _obj - указывает на первый объект в шаблоне, и на контейнер объектов в форме (в примере "scene"). В выходном объекте отсутствует

#### Шаблон массива (json)
```json
  name: {
    "_type": "array",
    <"_spoiler": _label> или <"_title": _label>
    "scene": {
      {{content}}
    }
  }
```
Отсутствие _spoiler и _title расценивать как _title с пустым именем "_title": "".  
Массив в шаблоне может иметь только один шаблон объекта, лишние игнорируются.

#### Массив со спойлером в форме html (array + _spoiler)
```html
  <details class="form-field" data-path=data-path id=data-path data-type=_type>
    <summary>
      _label
      <div class="header-buttons">
        <button class="btn btn-icon-only" data-parent=data-path data-target=_obj title="Очистить">
            <i class="fa-solid fa-broom add-icon"></i>
        </button>
        <button class="btn btn-icon-only add-item-btn" data-parent=data-path data-target=_obj title="Добавить">
            <i class="fa-solid fa-plus add-btn-icon"></i>
        </button>
      </div>  
    </summary>
    <div id=_obj class="content">
      {{content (objects)}}
    </div>
  </details>
```

#### Массив с заголовком в форме (html)
```html
  <div class="scene-block form-field" data-path=data-path id=data-path data-type=_type>
    <div class="header-row">
      <h3>_label</h3>
      <div class="header-buttons">
        <button class="btn btn-icon-only" data-parent=data-path data-target=_obj title="Очистить">
            <i class="fa-solid fa-broom add-icon"></i>
        </button>
        <button class="btn btn-icon-only add-item-btn" data-parent=data-path data-target=_obj title="Добавить">
            <i class="fa-solid fa-plus add-btn-icon"></i>
        </button>
      </div>
    </div>
    <div id=_obj class="content">
      {{content (objects)}}
    </div>
  </div>
```

##### Объект массива (object + _spoiler/_title)
Объект, как и массивы могут иметь 2 вида отображения:
- объект со спойлером (_spoiler)
- объект с заголовком (_title)
data-id - свойство в первом теге объекта (оберточном) указывает номер объекта массива, от 1.
data-path - в объекте массива получается из пути к шаблону объекта в шаблоне и порядкового номера объекта в dom дереве: data-path + "_" + data-id
То же и с _label. _label + " " + data-id
data-parent в первом теге объекта (оберточном) указывает путь к массиву-родителю, в кнопках - путь к первому тэгу.


```json
  name: {
    "_type": "object"
    <"_spoiler": _label> или <"_title": _label>
    {{content}}
  }
```
Отсутствие _spoiler и _title расценивать как _title с пустым именем "_title": "". 

###### Объект массива со спойлером (html)
```html
  <details class="form-field" data-path=data-path data-type=_type data-parent=_obj data-id=data-id>
    <summary>
      <span>_label</span>
      <div class="header-buttons">
        <button class="btn btn-icon-only" data-parent=data-path title="Очистить">
          <i class="fa-solid fa-broom add-icon"></i>
        </button>
        <button class="btn btn-icon-only" data-parent=data-path title="Удалить">
          <i class="fa-solid fa-trash del-icon"></i>
        </button>
      </div>
    </summary>
    <div class="content">
      {{content}}
    </div>
  </details>
```

###### Объект массива с заголовком (html)
```html
  <div class="scene-block form-field" data-path=data-path data-type=_type data-parent=_obj data-id=data-id>
    <div class="header-row">
      <h3>_label</h3>
      <div class="header-buttons">
        <button class="btn btn-icon-only" data-parent=data-path title="Очистить">
          <i class="fa-solid fa-broom add-icon"></i>
        </button>
        <button class="btn btn-icon-only" data-parent=data-path title="Удалить">
          <i class="fa-solid fa-trash del-icon"></i>
        </button>
      </div>
    </div>
    <div class="content">
      {{content}}
    </div>
  </div>
```

#### В ответе (json)
```json
  name: value
```


