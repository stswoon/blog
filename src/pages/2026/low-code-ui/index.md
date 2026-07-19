<!--
{
  "draft": false,
  "tags": ["Программирование"]
}
-->

# Low Code UI

```blogEnginePageDate
22 июля 2026
```

Ранее я уже рассказывал про Coolify в статьях [Собственный Heroku](../../2023/СобственныйHeroku/index.html)
и [Настройка GitLab Для Coolify](../../2023/НастройкаGitLabДляCoolify/index.html). Но он давно обновился и сильно, поэтому
тут представлю иснтрукцию, т.к. из-за известной security баги в next.js арендодатель сервера стер прошлый инстанс со
всеми настройками и пришлось вновь поднимать сервак.

# Low-Code-UI: архитектура и устройство прототипа

> Статья описывает репозиторий [low-code-ui](https://github.com/stswoon/low-code-ui) — прототип low-code платформы, где
> пользовательский интерфейс описывается JSON-конфигурацией и рендерится без написания React-кода. Конфиг можно
> редактировать вручную, генерировать через AI или собирать drag-and-drop.

**Live demo:** [https://low-code-ui.stswoon.ru](https://low-code-ui.stswoon.ru)

---

## 1. Зачем это нужно

Классическая разработка UI требует знания фреймворка, роутинга, форм, запросов к API. Low-Code-UI снимает этот барьер:
достаточно описать **страницы → виджеты → поля → источник данных** в JSON, и приложение отрисуется само.

Три способа работы с конфигом:

| Способ        | Модуль                 | Для кого                                   |
|---------------|------------------------|--------------------------------------------|
| AI-ассистент  | `AiChat`               | «Создай страницу со списком пользователей» |
| JSON-редактор | `JsonConfig`           | Разработчик, знакомый со схемой            |
| Drag-and-drop | `LowCodeAdminConfigUI` | Визуальная сборка без JSON                 |

Все три канала пишут в **один источник правды** — Zustand-store с полем `uiConfig: string`.

---

## 2. Общая архитектура

Приложение разделено на два крупных слоя и общий shared-слой:

```
┌─────────────────────────────────────────────────────────────────┐
│                         App.tsx                                  │
│  ┌──────────────────────┐  │  ┌──────────────────────────────┐ │
│  │      ADMIN           │  │  │         RUNTIME               │ │
│  │  LowCodeAdminConfigUI│  │  │  RuntimeUI → MainRenderer     │ │
│  │  AiChat              │  │  │    → PageRenderer             │ │
│  │  JsonConfig          │  │  │      → Widgets / Fields       │ │
│  └──────────┬───────────┘  │  └──────────────┬───────────────┘ │
│             │              │                  │                  │
│             └──────────────┼──────────────────┘                  │
│                            ▼                                     │
│                   useAppStore (Zustand)                          │
│                   uiConfig: string                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   JSON.parse(uiConfig) → Page[]
                            │
                            ▼
              Registry (widgets, fields, dataSources)
                            │
                            ▼
                   fetch → json-server (db/db.json)
```

### Принцип «Config as Data»

Вся UI-логика — это данные. TypeScript-типы в `src/shared/types.ts` задают контракт:

```typescript
Config = Page[]
Page   → {
    id, name, urlPath, widgets[]
}
Widget → {
    id, name, type
:
    'Form' | 'CardList', datasource, fields[]
}
Field  → {
    id, label, type, dataPath, value ?, availableValues ?
}
DataSource → {
    type: 'fetch', method
:
    'GET' | 'POST', url
}
```

Runtime не знает бизнес-домен — он знает только эту схему и умеет резолвить компоненты через **Registry**.

---

## 3. Структура репозитория

```
low-code-ui/
├── db/db.json              # Mock API (json-server)
├── src/
│   ├── App.tsx             # 4-панельный layout
│   ├── main.tsx            # React + MUI Theme + Router
│   ├── shared/             # Типы, store, константы, утилиты
│   │   ├── types.ts
│   │   ├── store.ts
│   │   ├── const.ts        # SYSTEM_AI_MSG, API_SERVER_URL
│   │   └── uiExamples.const.ts
│   └── modules/
│       ├── admin/          # Редактирование конфига
│       │   ├── LowCodeAdminConfigUI.tsx
│       │   ├── AiChat.tsx
│       │   ├── JsonConfig.tsx
│       │   └── components/ # Brick, DropZone, TreeNodeBricks
│       └── runtime/        # Рендеринг по конфигу
│           ├── MainRenderer.tsx
│           ├── PageRenderer.tsx
│           ├── Registry.ts
│           ├── widgets/    # FormWidget, CardListWidget
│           ├── fields/     # Text, Number, Hidden, Dropdown
│           └── components/ # Card
├── Dockerfile              # prod build + json-server + preview
└── vite.config.ts          # proxy /users → localhost:3201
```

---

## 4. Блоки подробно

### 4.1. Единое состояние (`shared/store.ts`)

Zustand-хранилище минималистично — одно поле и один сеттер:

```typescript
uiConfig: string          // сериализованный JSON
setUiConfig(newUiConfig)  // обновляет конфиг
```

**Почему string, а не `Page[]`?**  
Monaco Editor и AI возвращают текст. Хранение как строка избавляет от постоянной сериализации/десериализации при
редактировании и упрощает синхронизацию между панелями. Runtime и Admin парсят JSON локально:
`JSON.parse(uiConfig ?? '[]')`.

### 4.2. Layout приложения (`App.tsx`)

Четыре resizable-панели (`react-resizable-panels`):

| Левая колонка (60%) | Правая колонка (40%)   |
|---------------------|------------------------|
| Admin DnD (верх)    | Runtime preview (верх) |
| AI Chat (низ)       | JSON Editor (низ)      |

Пользователь одновременно видит: как собирает конфиг, что ответил AI, живой preview и сырой JSON.

### 4.3. Admin: визуальный конструктор

**`LowCodeAdminConfigUI`** — палитра «кирпичиков» слева, дерево конфига справа.

- Палитра: Page, Widget (Form/CardList), Field (text/number/hidden/dropdown), Datasource (fetch).
- DnD через `@dnd-kit/core`.
- Drop-зоны с иерархией: `globalZone` → `pageZone_{id}` → `widgetZone_{id}`.
- При drop создаётся объект с `nanoid`-идентификатором (`getId()`), конфиг пересобирается immutably и записывается в
  store.

**`TreeNodeBricks`** — рекурсивное отображение дерева Page → Widget → Field + Datasource в виде цветных `Brick`
-компонентов.

**`DropZone`** — droppable-зона с визуальной обратной связью: зелёная рамка = drop разрешён, красная = запрещён. Логика
в `isAllowDrop(droppableType, zoneType)`.

> Статус: прототип. DnD умеет добавлять элементы, но не редактировать свойства и не удалять. Комментарий в README честно
> называет это «a little ugly but works».

### 4.4. Admin: AI-ассистент (`AiChat.tsx`)

Интеграция с OpenAI через **LangChain** (`@langchain/openai`):

1. System prompt (`SYSTEM_AI_MSG` в `const.ts`) — полная спецификация схемы Config + пример + правила (CardList = GET,
   Form = POST, JSONPath для `dataPath`).
2. История диалога хранится в React state (`SystemMessage` + пары Human/AI).
3. Ключ и модель — в `localStorage`.
4. Кнопка **Copy AI Answer to Config** парсит последний ответ (с очисткой markdown-обёрток `` ```json ``) и вызывает
   `setUiConfig`.

**Ключевая идея:** system prompt дублирует TypeScript-типы в текстовом виде. Модель «видит» тот же контракт, что и
runtime. При уточнениях пользователя prompt требует возвращать **полный** Config, а не diff — это упрощает применение
ответа одной кнопкой.

### 4.5. Admin: JSON-редактор (`JsonConfig.tsx`)

Monaco Editor с:

- **Auto apply** — при валидном JSON сразу пушит в store (live preview).
- Валидация через `JSON.parse` в `useMemo`.
- Кнопки: Apply, Clear, Example (загружает `uiExample1`).

Двусторонняя синхронизация: `useEffect` подтягивает изменения из store (например, после AI или DnD) и форматирует через
`jsonPretty`.

### 4.6. Runtime: Registry-паттерн (`Registry.ts`)

Центральный реестр расширяемости:

```typescript
Registry = {
    fields: Record<string, ComponentType<FieldProps>>
    widgets: Record<string, ComponentType<Widget>>
    dataSources: Record<string, DatasourceService>
}
```

Регистрация происходит side-effect'ом в `MainRenderer.tsx`:

```typescript
Registry.widgets['Form'] = FormWidget;
Registry.widgets['CardList'] = CardListWidget;
Registry.dataSources['fetch'] = fetchDsService;
Registry.fields['text'] = TextField;
// ...
```

**`PageRenderer`** для каждого widget делает lookup: `Registry.widgets[widget.type]`. Если тип не найден —
inline-ошибка, не падение всего приложения (плюс `ErrorBoundary`).

Добавление нового типа поля или виджета = один React-компонент + одна строка в Registry. JSON-схему расширяют в
`types.ts` и в `SYSTEM_AI_MSG`.

### 4.7. Runtime: роутинг (`MainRenderer.tsx`)

Динамический роутинг из конфига:

- AppBar с ссылками по `page.urlPath`.
- `<Routes>` генерирует `<Route path={page.urlPath} element={<PageRenderer config={page}/>} />` для каждой страницы.

React Router v7 + MUI `LinkBehavior` — ссылки работают как SPA-навигация, а не full reload.

### 4.8. Виджеты

#### FormWidget

- Локальный state `data: unknown`.
- Поля через Registry; `onValueChange` пишет значение по `dataPath`.
- Кнопка Send → `Registry.dataSources[datasource.type].send(config, data)`.

#### CardListWidget

- При mount и по Refresh → `ds.get(config)`.
- Для каждого элемента массива рендерит поля в режиме `readonly`.
- Значения читаются из объекта через `dataPath`.

Оба виджета используют один набор Field-компонентов — разница только в направлении данных (write vs read).

### 4.9. Поля (Fields)

Единый интерфейс `FieldProps`:

```typescript
{
    readonly ?, value ?, onValueChange ?
}
```

| Тип      | Компонент     | Особенности                                  |
|----------|---------------|----------------------------------------------|
| text     | TextField     | Input / span                                 |
| number   | NumberField   | Аналогично                                   |
| hidden   | HiddenField   | Не отображается, но участвует в Form         |
| dropdown | DropdownField | `availableValues`, readonly показывает label |

### 4.10. DataSource (`FetchDsService.ts`)

Единственная реализация — HTTP fetch:

- `get` — GET-запрос, возвращает JSON.
- `send` — POST с `Content-Type: application/json`.

URL собирается через `urlJoin(API_SERVER_URL(), config.url)`:

```typescript
API_SERVER_URL()
=>
localhost:5173(dev)  → http://localhost:3201
    production            → "/"(относительные
пути, proxy
)
```

Backend — **json-server** на порту 3201, данные в `db/db.json` (коллекция `users`).

---

## 5. Хитрые подходы и инженерные решения

### 5.1. JSONPath через `new Function` (прототипный хак)

Вместо полноценного JSONPath-парсера FormWidget и CardListWidget используют динамическую генерацию кода:

```typescript
// Запись (FormWidget)
const dataPath = field.dataPath.replace('$', 'data');  // $.name → data.name
const applyValueToData = new Function('data', 'value', `${dataPath} = value; return data;`);

// Чтение (CardListWidget)
const getValueFromData = new Function('data', `return ${dataPath}`);
```

**Плюсы:** нулевые зависимости, любой путь `$.foo.bar` работает «из коробки».  
**Минусы:** небезопасно (произвольный код), в production нужен нормальный JSONPath (jsonpath-plus, lodash get/set).

Комментарий в коде прямо говорит: `//NOT SAFE, but it is prototype`.

### 5.2. System prompt как живая документация схемы

`SYSTEM_AI_MSG` (~80 строк) — это одновременно:

- документация для разработчика;
- контракт для LLM;
- пример валидного Config.

Дублирование TypeScript-типов в prompt — осознанный trade-off: AI и runtime всегда «смотрят» на одну схему, пусть и в
разных форматах.

### 5.3. Registry вместо switch/case

Классический anti-pattern в low-code — гигантский switch по `widget.type`. Здесь — таблица компонентов. Новый виджет не
трогает PageRenderer.

Задел на lazy loading закомментирован в MainRenderer: `//In non prod need lazy loading`.

### 5.4. ErrorBoundary на двух уровнях

- `RuntimeUI` — общий fallback «Oops, it's just a prototype».
- `PageRenderer` — «Page Failed to Render».

Невалидный JSON в одном виджете не роняет весь preview.

### 5.5. DnD с семантической валидацией drop

`DropZone` не просто подсвечивает hover — проверяет **тип перетаскиваемого** vs **тип зоны** (`Page` → `globalZone`,
`Widget` → `pageZone`, `Field` → `widgetZone`). Красная рамка сразу показывает ошибку пользователя.

### 5.6. Auto apply в Monaco

Режим live-reload конфига из редактора без отдельной кнопки Save — удобно для итераций. Switch «Auto apply» позволяет
редактировать «черновик» и применить вручную.

### 5.7. Docker all-in-one

`Dockerfile` собирает prod (`npm run prod`), затем `npm run start` поднимает одновременно:

- Vite preview на `:3200` (статика + proxy),
- json-server на `:3201`.

Один контейнер = полный demo-стенд.

---

## 6. Поток данных (end-to-end)

```
Пользователь
    │
    ├─► AI Chat ──► setUiConfig(jsonString)
    ├─► JsonConfig ──► setUiConfig (auto/manual)
    └─► Admin DnD ──► setUiConfig(JSON.stringify(pages))
                │
                ▼
         useAppStore.uiConfig
                │
    ┌───────────┴───────────┐
    ▼                       ▼
JsonConfig (sync)    RuntimeUI
                          │
                          ▼
                    JSON.parse → Page[]
                          │
                          ▼
                    MainRenderer
                     ├─ Routes
                     └─ PageRenderer
                          └─ Widget (Form | CardList)
                               ├─ Fields (Registry)
                               └─ DataSource.fetch
                                    └─ json-server /users
```

---

## 7. Стек технологий

| Категория     | Технология                    |
|---------------|-------------------------------|
| UI            | React 18, MUI 7, Emotion      |
| Сборка        | Vite 7, TypeScript 5.8        |
| Роутинг       | React Router 7                |
| State         | Zustand 5                     |
| DnD           | @dnd-kit/core                 |
| Редактор      | Monaco (@monaco-editor/react) |
| AI            | LangChain + OpenAI            |
| Data fetching | fetch + SWR (задел), url-join |
| Mock API      | json-server                   |
| Layout        | react-resizable-panels        |
| ID            | nanoid                        |

---

## 8. Пример конфигурации

Два типичных сценария из `uiExamples.const.ts`:

**Страница создания** (`/create`) — Form + POST `/users`:

```json
{
  "id": "w1",
  "type": "Form",
  "datasource": {
    "type": "fetch",
    "method": "POST",
    "url": "/users"
  },
  "fields": [
    {
      "type": "text",
      "label": "name",
      "dataPath": "$.name"
    },
    {
      "type": "number",
      "label": "age",
      "dataPath": "$.age"
    },
    {
      "type": "dropdown",
      "label": "gender",
      "dataPath": "$.gender",
      "availableValues": [
        {
          "id": "0",
          "value": "man"
        },
        {
          "id": "1",
          "value": "woman"
        }
      ]
    }
  ]
}
```

**Страница списка** (`/list`) — CardList + GET `/users` — те же поля, но readonly и данные с сервера.

---

## 9. Ограничения прототипа

Честный список того, что **ещё не production-ready**:

1. **Безопасность** — `new Function` для dataPath.
2. **DnD** — только добавление, без edit/delete/reorder.
3. **Типизация** — `as any` при регистрации fields в Registry.
4. **Card keys** — `Math.random()` в `Card.tsx` (лишние re-render).
5. **AI** — ключ OpenAI в localStorage, запросы с клиента.
6. **Схема** — два виджета, один datasource, нет валидации конфига на уровне JSON Schema.
7. **Нет персистентности** — конфиг живёт только в памяти (до reload).
8. **Нет auth, i18n, темизации** beyond базового MUI theme.

---

## 10. Куда развивать

Логичные следующие шаги по архитектуре:

| Направление         | Что делать                                    |
|---------------------|-----------------------------------------------|
| Безопасный dataPath | jsonpath-plus или lodash get/set              |
| Валидация Config    | Zod / JSON Schema + подсветка ошибок в Monaco |
| Plugin system       | lazy Registry, npm-пакеты виджетов            |
| Backend for AI      | proxy API key, server-side LLM                |
| Persistence         | save/load конфигов в json-server или БД       |
| DnD v2              | редактирование props, удаление, reorder       |
| Production build    | code-splitting виджетов, убрать json-server   |

---

## 11. Запуск локально

```bash
npm install
npm run serve    # json-server :3201 + Vite dev :5173
# или
npm run prod && npm run start   # lint + build + preview :3200
```

Docker:

```bash
docker build . -t low-code-ui
docker run --rm -p 3200:3200 -p 3201:3201 low-code-ui
```

---

## 12. Резюме

Low-Code-UI — компактный, но архитектурно осмысленный прототип:

- **Config as Data** — UI полностью декларативен.
- **Три редактора одного конфига** — AI, JSON, DnD — сходятся в Zustand.
- **Registry** — точка расширения без переписывания рендерера.
- **Runtime pipeline** — Config → Routes → Widgets → Fields → fetch.
- **Прототипные shortcuts** — `new Function`, client-side AI, минимальный DnD — осознанно помечены в коде.

Проект хорошо демонстрирует, как за несколько сотен строк React можно собрать working low-code loop: описал → увидел →
отправил на API — и при этом оставить архитектуру расширяемой для реального продукта.
