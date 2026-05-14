# ЛР 6: инструкции по тестированию

Ниже — быстрые проверки для всех требований ЛР6. Предполагается, что приложение запущено на `PORT=3010`.

## 0) Подготовка

1. Убедитесь, что база доступна по `DATABASE_URL`.
2. Примените миграции:

```bash
npx prisma generate
npx prisma migrate deploy
```

3. Запустите сервер:

```bash
npm run start:dev
```

Зададим переменную:

```bash
export BASE_URL="http://localhost:3010"
```

## 1) Проверка `X-Elapsed-Time` (interceptor времени)

### REST

```bash
curl -i "$BASE_URL/api/tags?page=1&pageSize=1" | sed -n '1,30p'
```

Ожидаемо в заголовках присутствует `X-Elapsed-Time: <...>ms`.

### GraphQL

```bash
curl -i "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  --data '{"query":"query { users(page: 1, pageSize: 1) { page pageSize hasNext items { id email } } }"}' | sed -n '1,40p'
```

Ожидаемо: заголовок `X-Elapsed-Time` тоже присутствует.

## 2) Клиентское кэширование REST: `Cache-Control` + `ETag` + 304

### Cache-Control

```bash
curl -I "$BASE_URL/api/tags?page=1&pageSize=1"
```

Ожидаемо: `Cache-Control: public, max-age=3600`.

### ETag и 304

1) Получить ETag:

```bash
ETAG=$(curl -sD - "$BASE_URL/api/tags?page=1&pageSize=1" -o /dev/null | awk -F': ' 'tolower($1)=="etag"{print $2}' | tr -d '\r')
echo "$ETAG"
```

2) Повторить запрос с `If-None-Match`:

```bash
curl -i "$BASE_URL/api/tags?page=1&pageSize=1" -H "If-None-Match: $ETAG" | sed -n '1,25p'
```

Ожидаемо: статус **304 Not Modified**.

## 3) Серверное кэширование (in-memory CacheModule) для тегов

Кэш включён на `GET /api/tags` и `GET /api/tags/:id`, TTL около **5 секунд**.

Проверка идеей (без сторонних инструментов):

```bash
for i in $(seq 1 5); do curl -s -o /dev/null -w "%{http_code} %{time_total}\n" "$BASE_URL/api/tags?page=1&pageSize=50"; done
```

Ожидаемо: после первого запроса следующие несколько запросов в пределах TTL будут быстрее (особенно заметно при «тяжёлом» ответе/нагрузке).

Проверка через `hey` (если установлен):

```bash
hey -n 50 -c 10 "$BASE_URL/api/tags?page=1&pageSize=50"
```

## 4) Upload аватара пользователя → Yandex Object Storage

### Шаг 1: создать пользователя (получить `USER_ID`)

```bash
USER_JSON=$(curl -sS -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"email":"avatar-test-'$(date +%s)'@example.com","firstName":"Avatar","lastName":"Test","telegramUrl":"https://t.me/avatar_test"}')
echo "$USER_JSON"
USER_ID=$(echo "$USER_JSON" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).id))")
echo "$USER_ID"
```

### Шаг 2: загрузить файл

```bash
curl -sS -X POST "$BASE_URL/api/users/$USER_ID/avatar" \
  -F "file=@./path/to/avatar.png" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).avatarUrl))"
```

Ожидаемо:

- запрос возвращает объект пользователя
- поле `avatarUrl` заполнено публичным URL

### Шаг 3: проверить, что `avatarUrl` сохранился

```bash
curl -sS "$BASE_URL/api/users/$USER_ID" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).avatarUrl))"
```

## 5) Smoke: что сервер стартует

- В логах `npm run start:dev` должно быть `Nest application successfully started`.
- Должен маппиться GraphQL: `Mapped {/graphql, POST} route`.

