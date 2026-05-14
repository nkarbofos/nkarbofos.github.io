# ЛР 6 — отчёт: что сделано и как показать преподавателю

Документ дополняет требования из [Lab6.md](Lab6.md). Ручные шаги и короткие тесты — в [Lab6-Manual.md](Lab6-Manual.md) и [Lab6-Test.md](Lab6-Test.md). Общий запуск проекта — в [md_files/RUN_AND_TEST.md](md_files/RUN_AND_TEST.md).

---

## 1. Кратко о теме (теория)

### Interceptor (NestJS)

**Interceptor** — точка расширения конвейера запроса: код выполняется до и после обработчика маршрута. Часто используется для логирования, преобразования ответа, измерения времени. В Nest подключается глобально (`app.useGlobalInterceptors`) или на уровне контроллера/метода.

В проекте глобально подключены два перехватчика в [src/main.ts](src/main.ts).

### Клиентское кэширование: `Cache-Control` + `ETag` и `304 Not Modified`

- **`Cache-Control`** (например, `public, max-age=3600`) подсказывает браузеру/прокси, как долго можно считать ответ «свежим» без повторного запроса.
- **`ETag`** — «отпечаток» тела ответа. Клиент при повторном запросе может отправить **`If-None-Match`** с тем же ETag.
- Если ресурс не изменился, сервер может ответить **`304 Not Modified`** без тела — экономия трафика и времени.

В проекте заголовок `Cache-Control` задан на публичных GET тегов в [src/tags/tags-api.controller.ts](src/tags/tags-api.controller.ts). Генерация ETag и сравнение с `If-None-Match` — в [src/common/interceptors/etag.interceptor.ts](src/common/interceptors/etag.interceptor.ts).

### Серверное in-memory кэширование (`CacheModule`)

**In-memory cache** хранит результат в памяти процесса (быстро, но не разделяется между инстансами). **TTL** ограничивает время жизни записи: проще, чем инвалидировать кэш при каждом изменении сущности.

В проекте `CacheModule.register({ ttl: 5 })` подключён в [src/tags/tags.module.ts](src/tags/tags.module.ts); на методах списка и получения тега используются `@UseInterceptors(CacheInterceptor)` и `@CacheTTL(5)` в [src/tags/tags-api.controller.ts](src/tags/tags-api.controller.ts).

### S3-совместимое объектное хранилище

Файлы не хранятся на диске приложения: загрузка идёт в бакет (в задании — Yandex Object Storage) через **AWS SDK v3** (`@aws-sdk/client-s3`). Логику вынесли в инфраструктурный слой: [src/storage/storage.module.ts](src/storage/storage.module.ts), [src/storage/storage.service.ts](src/storage/storage.service.ts).

---

## 2. Что реализовано в коде (привязка к файлам)

| Требование ЛР6 | Реализация |
|----------------|------------|
| Время обработки запроса в логах и в заголовке клиенту (`X-Elapsed-Time`) | [src/common/interceptors/elapsed-time.interceptor.ts](src/common/interceptors/elapsed-time.interceptor.ts), глобально в [src/main.ts](src/main.ts); для GraphQL заголовок выставляется через контекст ответа |
| Клиентский кэш: `Cache-Control` + ETag + 304 | `Cache-Control` на GET тегов: [src/tags/tags-api.controller.ts](src/tags/tags-api.controller.ts); ETag/304: [src/common/interceptors/etag.interceptor.ts](src/common/interceptors/etag.interceptor.ts); CORS `exposedHeaders` в [src/main.ts](src/main.ts) |
| Серверный кэш одной сущности (теги), TTL порядка секунд | [src/tags/tags.module.ts](src/tags/tags.module.ts), [src/tags/tags-api.controller.ts](src/tags/tags-api.controller.ts) |
| Загрузка файла в Object Storage | [src/storage/storage.service.ts](src/storage/storage.service.ts) (`PutObjectCommand`); эндпоинт загрузки аватара: `POST /api/users/:id/avatar` в [src/users/users-api.controller.ts](src/users/users-api.controller.ts) |

---

## 3. Как продемонстрировать преподавателю

### 3.1 Подготовка (1–2 минуты)

1. Заполнить `.env` (БД, при необходимости S3 — см. [Lab6-Manual.md](Lab6-Manual.md)).
2. Запустить backend: `npm run start:dev` (подробности — [md_files/RUN_AND_TEST.md](md_files/RUN_AND_TEST.md)).
3. Открыть Swagger: `http://localhost:3010/api/docs` (или порт из `PORT`).

**Скриншот (плейсхолдер):** главная страница Swagger с видимым заголовком проекта.

### 3.2 `X-Elapsed-Time` (REST и GraphQL)

**REST (curl):**

```bash
export BASE_URL="http://localhost:3010"
curl -i "$BASE_URL/api/tags?page=1&pageSize=1" | sed -n '1,25p'
```

Ожидаемо: в заголовках есть `X-Elapsed-Time: ...ms`.

**GraphQL:**

```bash
curl -i "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  --data '{"query":"query { tags(page: 1, pageSize: 1) { items { id name } } }"}' | sed -n '1,30p'
```

Ожидаемо: снова `X-Elapsed-Time` в ответе.

**Скриншот (плейсхолдер):** вкладка Network в DevTools или вывод `curl -i` с выделенным `X-Elapsed-Time`.

### 3.3 `Cache-Control`, `ETag` и `304 Not Modified`

```bash
curl -I "$BASE_URL/api/tags?page=1&pageSize=1"
```

Ожидаемо: `Cache-Control: public, max-age=3600` и заголовок `ETag`.

```bash
ETAG=$(curl -sD - "$BASE_URL/api/tags?page=1&pageSize=1" -o /dev/null | awk -F': ' 'tolower($1)=="etag"{print $2}' | tr -d '\r')
curl -i "$BASE_URL/api/tags?page=1&pageSize=1" -H "If-None-Match: $ETAG" | sed -n '1,20p'
```

Ожидаемо: статус **304** и пустое тело.

**Скриншот (плейсхолдер):** ответ 304 в Swagger «Try it out» или в Network.

### 3.4 Серверный кэш тегов (несколько запросов подряд)

```bash
for i in $(seq 1 5); do
  curl -s -o /dev/null -w "%{http_code} %{time_total}\n" "$BASE_URL/api/tags?page=1&pageSize=50"
done
```

Ожидаемо: код200; при нагрузке/«тяжёлом» ответе заметна разница времени между первым и последующими запросами в пределах TTL (см. также `hey` в [Lab6-Test.md](Lab6-Test.md)).

**Скриншот (плейсхолдер):** вывод цикла или скрин `hey` с latency.

### 3.5 Загрузка аватара в Yandex Object Storage

Сценарий: создать пользователя → `POST /api/users/:id/avatar` с `multipart/form-data` → убедиться, что в JSON пользователя заполнено поле `avatarUrl`.

Готовые команды — в разделе 4 [Lab6-Test.md](Lab6-Test.md).

**Скриншот (плейсхолдер):** ответ API с `avatarUrl` и/или открытие URL аватара в браузере.

---

## 4. Чеклист перед показом

- [ ] `DATABASE_URL` рабочий, миграции применены (`npx prisma migrate deploy`).
- [ ] Для демонстрации S3: переменные `S3_*` в `.env`, бакет и ключи созданы ([Lab6-Manual.md](Lab6-Manual.md)).
- [ ] Сервер слушает ожидаемый порт (`PORT` или `3010`).
- [ ] Swagger открывается, публичные GET (например теги) отвечают без ошибок.

---

## 5. Типичные проблемы

| Симптом | Что проверить |
|---------|----------------|
| Нет `X-Elapsed-Time` в браузере | Для CORS заголовок должен быть в `exposedHeaders` — см. [src/main.ts](src/main.ts) |
| Нет 304 | Убедиться, что `If-None-Match` **точно совпадает** с `ETag` из предыдущего ответа |
| Ошибка при upload | Полный набор `S3_*` в `.env`, права ключа, имя бакета |
| Prisma P1001 на запросах | Доступность PostgreSQL по `DATABASE_URL` |
