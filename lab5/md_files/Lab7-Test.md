# ЛР 7: инструкции по тестированию

Ниже описан тест‑план для AuthN/AuthZ (Firebase), ролей USER/ADMIN и фронтенда.

## 0) Подготовка

1. Заполните `.env` и `frontend/.env` по [`Lab7-Manual.md`](Lab7-Manual.md).
2. Примените миграции:

```bash
npx prisma generate
npx prisma migrate deploy
```

3. Запустите backend:

```bash
npm run start:dev
```

4. Запустите frontend:

```bash
cd frontend
npm run dev
```

## 1) Public endpoints (должны работать без токена)

Проверить, что публичные GET отдают 200 без `Authorization`:

```bash
curl -i "http://localhost:3010/api/tags?page=1&pageSize=1"
curl -i "http://localhost:3010/api/courses?page=1&pageSize=1"
curl -i "http://localhost:3010/api/links?page=1&pageSize=1"
curl -i "http://localhost:3010/api/reviews?page=1&pageSize=1"
curl -i "http://localhost:3010/api/users?page=1&pageSize=1"
```

## 2) Protected endpoints (должны требовать Bearer token)

Пример: попытка удалить сущность без токена должна вернуть 401.

```bash
curl -i -X DELETE "http://localhost:3010/api/tags/<uuid>"
```

Ожидаемо: `401 Unauthorized`.

## 3) Получение Firebase ID token

1. Во фронтенде зарегистрируйтесь / залогиньтесь.
2. Получите `idToken` любым способом (например, через devtools или временно выведите токен в UI).

Дальше этот токен используйте как `Authorization: Bearer <TOKEN>`.

## 4) Проверка USER роли (403 на admin-only)

С токеном обычного пользователя:

```bash
TOKEN="REPLACE_ME"
curl -i -X DELETE "http://localhost:3010/api/tags/<uuid>" -H "Authorization: Bearer $TOKEN"
```

Ожидаемо: `403 Forbidden`.

## 5) Проверка ADMIN роли (200 на admin-only)

1. Выдайте роль `ADMIN` пользователю вручную по [`Lab7-Manual.md`](Lab7-Manual.md).
2. Повторите запрос DELETE с токеном admin‑пользователя.

Ожидаемо: `200 OK`.

## 6) Проверка связки Firebase ↔ DB

Сразу после первого запроса к backend с валидным токеном:

- запись пользователя в таблице `users` должна получить `firebase_uid`
- роль должна учитываться guards

## 7) CORS из фронтенда

Откройте фронтенд `http://localhost:5173`, убедитесь что запросы к `http://localhost:3010/api/links` проходят без CORS ошибок.

## 8) UI smoke

- **Без логина**: главная страница `Links` должна показываться (это public GET `/api/links`).
- **Login/Register**: после входа не должно быть ошибок при запросах с Bearer.
- **Logout**: после выхода защищённые страницы (если добавите) должны требовать вход.

## 9) Swagger security

Откройте `http://localhost:3010/api/docs` и убедитесь, что схема **Bearer** присутствует (кнопка Authorize), а защищённые методы при тестировании без токена возвращают 401.
