# Spindle — план проекта

Генератор Vue-компонентов по описанию: пользователь пишет «карточка товара» →
модель (Gemini) генерирует `.vue` → сервер компилирует → компонент работает в живом превью.

## Готово ✅

| # | Что | Где |
|---|---|---|
| 1 | Чат с моделью (стриминг) | `app/pages/index.vue`, `server/api/chat.post.ts` |
| 2 | Генерация компонента как объекта `{ name, description, code, props }` | `server/api/generate.post.ts`, `server/utils/prompts.ts` |
| 3 | Валидация результата через Zod | `shared/schemas/component.ts` |
| 4 | Компиляция SFC → JS + CSS (`vue/compiler-sfc` + `esbuild`) | `server/utils/compileSfc.ts`, `server/api/compile.post.ts`, `shared/types/compile.ts` |
| 5 | Вызов компиляции со страницы после валидации | `app/pages/generate.vue` |

## Сейчас ⏳

**Шаг 6. Живое превью в `<iframe>`**
- `app/components/ComponentPreview.vue`: props `js`, `css` → `srcdoc` HTML
- `<iframe sandbox="allow-scripts">` без `allow-same-origin` (изоляция недоверенного кода)
- import map: `"vue"` → `https://cdn.jsdelivr.net/npm/vue@${version}/dist/vue.runtime.esm-browser.prod.js`
  (`version` импортируется из `"vue"`, чтобы совпадала с компилятором)
- в module-скрипте: скомпилированный JS + `createApp(__sfc__).mount("#app")`
- экранировать `</script` и `</style` в js/css
- подключить в `generate.vue` в ветке `compiled?.ok`

## Дальше

**Ядро:**
7. **Runtime-ошибки из iframe** — iframe ловит ошибки (`window.onerror`, `app.config.errorHandler`)
   и шлёт их родителю через `postMessage`; страница показывает их.
8. **Автоисправление** — ошибки компиляции/запуска отправляются модели («вот код, вот ошибка, исправь»),
   максимум 2–3 попытки.

**Удобство:**
9. **Интерфейс** — вкладки «Превью / Код», «Копировать», скачать `.vue`; убрать сырые блоки JS/CSS.
10. **Доработка компонента** — «сделай кнопку синей» правит текущий компонент, а не генерирует новый.

**Дополнительно:**
11. История генераций (`localStorage`, потом БД).
12. Защита API: rate limit на `/api/generate` и `/api/compile`.
13. Тесты (`compileSfc` на Vitest) и деплой.

---

_Обновляй этот файл после каждого завершённого шага: переноси пункт в «Готово»._
