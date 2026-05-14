# Запуск, тесты и документация API

Краткая инструкция для ежедневной работы с проектом. Подробности по миграциям и сбросу БД — в [DB_RESET_AND_MIGRATE.md](DB_RESET_AND_MIGRATE.md). Обзор того, что реализовано в коде — в [MANUAL_STEPS.md](MANUAL_STEPS.md).

## Требования

- **Node.js** версии, указанной в `engines` в [package.json](package.json) (сейчас `24.14.0`).
- Доступная **PostgreSQL** и строка подключения в переменной **`DATABASE_URL`** (Prisma).

## Установка зависимостей

В корне репозитория:

```bash
npm install
```

## Переменные окружения

1. Скопируйте шаблон из [.env.example](.env.example) в файл `.env` в корне проекта.
2. Укажите реальный **`DATABASE_URL`** (для Aiven обычно нужен `?sslmode=require`).
3. При необходимости задайте **`PORT`** (по умолчанию сервер слушает порт `3010` — см. [src/main.ts](src/main.ts)).

Не коммитьте `.env` в git: там хранятся секреты.

## Prisma (после клонирования или смены схемы)

Сгенерировать клиент:

```bash
npx prisma generate
```

Применить миграции к существующей базе (без интерактива):

```bash
npx prisma migrate deploy
```

Сброс схемы и данных, полный сценарий миграций — см. [DB_RESET_AND_MIGRATE.md](DB_RESET_AND_MIGRATE.md).

## Запуск приложения

**Режим разработки** (перезапуск при изменении файлов):

```bash
npm run start:dev
```

**Сборка и продакшен-запуск**:

```bash
npm run build
npm run start:prod
```

Порт: **`PORT`** из `.env`, иначе `3010`.

## Запуск фронтенда (Vite)

Фронтенд живёт в каталоге [frontend](../frontend) и в режиме разработки обычно слушает **http://localhost:5173** (см. вывод `vite`). CORS на бэкенде разрешён для `http://localhost:5173` ([src/main.ts](../src/main.ts)).

```bash
cd frontend
npm install
npm run dev
```

Сборка и локальный превью статики:

```bash
cd frontend
npm run build
npm run preview
```

По умолчанию `vite preview` слушает **http://localhost:4173** — при проверке curl задайте `FRONTEND_URL`, если порт другой.

## Документация API (OpenAPI / Swagger)

После запуска сервера откройте в браузере:

```text
http://localhost:<PORT>/api/docs
```

Например, при `PORT=3010`: [http://localhost:3010/api/docs](http://localhost:3010/api/docs).

Swagger подключается в [src/main.ts](../src/main.ts) (`SwaggerModule.setup('api/docs', ...)`).

## Тестирование

Команды из [package.json](../package.json) (корень репозитория):

| Команда | Назначение |
|--------|------------|
| `npm test` | unit-тесты (Jest) |
| `npm run test:watch` | unit-тесты в watch-режиме |
| `npm run test:cov` | покрытие кода |
| `npm run test:e2e` | e2e-тесты бэкенда (Jest + supertest) |
| `npm run lint` | ESLint (с автофиксом по конфигу) |
| `npm run smoke:curl` | smoke-проверка основных URL API и фронта через **curl** (см. ниже) |

## Smoke-проверка curl (API + основные страницы)

Скрипт [scripts/curl-smoke.sh](../scripts/curl-smoke.sh) проверяет доступность бэкенда и (если запущен) дев-сервера Vite. Перед запуском поднимите API (`npm run start:dev` в корне). Для проверки фронта в другом терминале выполните `npm run dev` в `frontend`.

```bash
# из корня репозитория, при работающих серверах по умолчанию:
npm run smoke:curl

# или явно:
BASE_URL=http://localhost:3010 FRONTEND_URL=http://127.0.0.1:5173 bash scripts/curl-smoke.sh
```

Если фронт сейчас не нужен (например, не запущен Vite):

```bash
SKIP_FRONTEND=1 npm run smoke:curl
```

Если проверяете только фронт на другом хосте/порту:

```bash
SKIP_BACKEND=1 FRONTEND_URL=http://localhost:4173 npm run smoke:curl
```

### Что именно проверяется (ожидаемое поведение)

**Бэкенд** (`BASE_URL`, по умолчанию `http://localhost:3010`):

| Запрос | Ожидаемый результат |
|--------|---------------------|
| `GET /` без заголовка `Authorization` (Accept по умолчанию, как у curl) | **401** — корень не помечен как публичный; без Bearer токена доступ запрещён ([AuthGuard](../src/auth/auth.guard.ts)). |
| `GET /` с `Accept: text/html` | **302** на `/login`, если пользователь ещё не установлен в запросе — срабатывает [AuthRedirectMiddleware](../src/auth/auth-redirect.middleware.ts) до установки `req.user`. |
| `GET /api/users`, `/api/tags`, `/api/courses`, `/api/links`, `/api/reviews` с пагинацией (`?page=1&pageSize=1`) | **200**, JSON — эти list/read эндпоинты помечены `@PublicAccess()`. |
| `GET /api/docs`, `GET /api/docs-json` | **200** — Swagger UI и схема OpenAPI. |
| `POST /graphql` с телом `{"query":"{ __typename }"}` | **200**, в теле `data.__typename` — служебное поле без обращения к защищённым резолверам. |
| `POST /graphql` с запросом к данным (например, `courses { items { id } }`) без Bearer | **200**, но в JSON есть `errors` с кодом **UNAUTHENTICATED** — GraphQL-запросы к данным требуют `Authorization: Bearer <Firebase ID token>` ([AuthService](../src/auth/auth.service.ts)). |

**Фронтенд** (`FRONTEND_URL`, по умолчанию `http://127.0.0.1:5173`):

| Маршрут | Ожидаемый результат |
|---------|---------------------|
| `/`, `/login`, `/register`, `/upload`, `/profile`, `/my-links`, `/teacher`, а также примеры `/user/<uuid>`, `/project/<uuid>` | **200** и HTML с `<!doctype html>` — для SPA Vite отдаёт один и тот же `index.html` на любой путь; ограничения «только для авторизованных» выполняются уже в React ([App.tsx](../frontend/src/App.tsx)), а не через отдельный HTTP-код при dev-запросе. |

### Ручные однострочники (без скрипта)

Корень API без браузерного Accept (ожидается **401**):

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:3010/
```

Редирект для «браузерного» Accept (ожидается **302**):

```bash
curl -sS -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Accept: text/html" http://localhost:3010/
```

Публичный список ссылок:

```bash
curl -sS "http://localhost:3010/api/links?page=1&pageSize=5" | head -c 400
echo
```

Подставьте свой порт, если `PORT` в `.env` не `3010`.

## CRUD smoke-tests через `curl`

Ниже — последовательный сценарий проверки REST API (создание → чтение → обновление → удаление) и проверка связей: тег и курс у ссылки, ревью у ссылки.

Перед запуском убедитесь, что сервер запущен (`npm run start:dev`) и база доступна по `DATABASE_URL`.

### Переменные

```bash
export BASE_URL="http://localhost:3010"   # подставьте порт из PORT при необходимости
```

В сценарии ниже `BASE_URL` задаётся внутри блока (`export BASE_URL="${BASE_URL:-http://localhost:3010}"`), так что его можно выполнять отдельно, без предыдущего блока. Приложение подхватывает `.env` из корня проекта через `ConfigModule` (см. [src/app.module.ts](../src/app.module.ts)).

### Вариант 1: один скрипт с `jq` (удобно)

Нужен установленный [`jq`](https://stedolan.github.io/jq/) для разбора JSON и сохранения `id`.

Скрипт **сам задаёт** `BASE_URL` и **уникальные** `email` / имена тега и курса (через `RUN_ID`), чтобы повторный запуск не упирался в `409 Conflict` по уникальным полям.

```bash
set -euo pipefail

export BASE_URL="${BASE_URL:-http://localhost:3010}"
RUN_ID="$(date +%s)-$RANDOM"

# --- User ---
USER_JSON=$(curl -sS -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"curl-test-${RUN_ID}@example.com\",\"firstName\":\"Test\",\"lastName\":\"User\",\"telegramUrl\":\"https://t.me/curl_test\"}")
USER_ID=$(echo "$USER_JSON" | jq -r '.id')
curl -sS "$BASE_URL/api/users?page=1&pageSize=10" | jq .
curl -sS "$BASE_URL/api/users/$USER_ID" | jq .
curl -sS -X PATCH "$BASE_URL/api/users/$USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"TestUpdated"}' | jq .

# --- Tag ---
TAG_JSON=$(curl -sS -X POST "$BASE_URL/api/tags" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"curl-tag-${RUN_ID}\"}")
TAG_ID=$(echo "$TAG_JSON" | jq -r '.id')
curl -sS "$BASE_URL/api/tags?page=1&pageSize=10" | jq .
curl -sS "$BASE_URL/api/tags/$TAG_ID" | jq .
curl -sS -X PATCH "$BASE_URL/api/tags/$TAG_ID" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"curl-tag-renamed-${RUN_ID}\"}" | jq .

# --- Course ---
COURSE_JSON=$(curl -sS -X POST "$BASE_URL/api/courses" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"SE-${RUN_ID}\",\"code\":\"09.03.04\"}")
COURSE_ID=$(echo "$COURSE_JSON" | jq -r '.id')
curl -sS "$BASE_URL/api/courses?page=1&pageSize=10" | jq .
curl -sS "$BASE_URL/api/courses/$COURSE_ID" | jq .
curl -sS -X PATCH "$BASE_URL/api/courses/$COURSE_ID" \
  -H "Content-Type: application/json" \
  -d '{"code":"09.03.04-upd"}' | jq .

# --- Link (без review) ---
LINK_JSON=$(curl -sS -X POST "$BASE_URL/api/links" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"linkName\":\"My project\",\"githubPagesUrl\":\"https://user.github.io/repo/\"}")
LINK_ID=$(echo "$LINK_JSON" | jq -r '.id')

# Привязка тега и курса
curl -sS -X POST "$BASE_URL/api/links/$LINK_ID/tags/$TAG_ID" | jq .
curl -sS -X POST "$BASE_URL/api/links/$LINK_ID/courses/$COURSE_ID" | jq .

# Списки с фильтрами
curl -sS "$BASE_URL/api/links?userId=$USER_ID&page=1&pageSize=10" | jq .
curl -sS "$BASE_URL/api/links?tagId=$TAG_ID&page=1&pageSize=10" | jq .
curl -sS "$BASE_URL/api/links?courseId=$COURSE_ID&page=1&pageSize=10" | jq .

curl -sS "$BASE_URL/api/links/$LINK_ID" | jq .

# --- Review и привязка к ссылке ---
REVIEW_JSON=$(curl -sS -X POST "$BASE_URL/api/reviews" \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"score\":5,\"comment\":\"OK\"}")
REVIEW_ID=$(echo "$REVIEW_JSON" | jq -r '.id')
curl -sS "$BASE_URL/api/reviews?page=1&pageSize=10" | jq .
curl -sS "$BASE_URL/api/reviews/$REVIEW_ID" | jq .
curl -sS -X PATCH "$BASE_URL/api/links/$LINK_ID" \
  -H "Content-Type: application/json" \
  -d "{\"reviewId\":\"$REVIEW_ID\"}" | jq .
curl -sS -X PATCH "$BASE_URL/api/reviews/$REVIEW_ID" \
  -H "Content-Type: application/json" \
  -d '{"score":4,"comment":"Minor fixes"}' | jq .

# --- Удаление (сначала сущности со связями / дочерние) ---
curl -sS -X DELETE "$BASE_URL/api/links/$LINK_ID/tags/$TAG_ID" | jq .
curl -sS -X DELETE "$BASE_URL/api/links/$LINK_ID/courses/$COURSE_ID" | jq .
curl -sS -X DELETE "$BASE_URL/api/links/$LINK_ID" | jq .
curl -sS -X DELETE "$BASE_URL/api/reviews/$REVIEW_ID" | jq .
curl -sS -X DELETE "$BASE_URL/api/users/$USER_ID" | jq .
curl -sS -X DELETE "$BASE_URL/api/tags/$TAG_ID" | jq .
curl -sS -X DELETE "$BASE_URL/api/courses/$COURSE_ID" | jq .
```

Ожидаемо: успешные ответы с телом JSON (для `POST` Nest по умолчанию часто отдаёт `200`, при необходимости можно настроить `201` в коде); в конце — удаление сущностей. При ошибке валидации Nest вернёт `400`, конфликт уникальности — `409` (см. фильтр Prisma).

### Вариант 2: без `jq`

Выполняйте запросы по одному; из тела ответа JSON скопируйте поля `id` в переменные окружения:

```bash
export USER_ID="..." TAG_ID="..." COURSE_ID="..." LINK_ID="..." REVIEW_ID="..."
```

Дальше подставляйте их в URL и тела запросов как в варианте 1.

### Примечания

- Скрипт с `RUN_ID` рассчитан на **повторные запуски** без ручной очистки БД. Если вы запускаете старый вариант с фиксированным email/именами, при повторе возможен `409` — уникальные поля: `email`, `name` у тега и курса.
- Заголовок пагинации **`Link`** (prev/next) можно посмотреть так:  
  `curl -sSI "$BASE_URL/api/users?page=2&pageSize=5" | grep -i ^link:`

