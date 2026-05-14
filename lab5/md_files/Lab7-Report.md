# ЛР 7 — отчёт: что сделано и как показать преподавателю

Документ дополняет требования из [Lab7.md](Lab7.md). Ручная настройка Firebase/БД — в [Lab7-Manual.md](Lab7-Manual.md); сценарии curl — в [Lab7-Test.md](Lab7-Test.md). Общий запуск — [md_files/RUN_AND_TEST.md](md_files/RUN_AND_TEST.md).

---

## 1. Кратко о теме (теория)

### Аутентификация (AuthN) и авторизация (AuthZ)

- **Аутентификация** — установить *кто* пользователь (например, проверить токен от провайдера).
- **Авторизация** — решить, *может ли* этот пользователь выполнить действие (роль, владелец ресурса).

### Firebase Auth и Bearer-токен

Клиент после входа получает **Firebase ID token** (JWT). API ожидает его в заголовке:

`Authorization: Bearer <idToken>`

На backend токен проверяется через **Firebase Admin SDK**; из токена извлекаются `uid`, `email` и т.д.

### NestJS: Guards и декораторы

- **Guard** реализует `canActivate`: разрешить или запретить вход в обработчик маршрута.
- Глобальный guard + декоратор **`@PublicAccess()`** позволяет открыть отдельные эндпоинты без токена.
- Второй guard + **`@Roles(UserRole.ADMIN)`** ограничивает методы по роли в БД.

---

## 2. Что реализовано в коде (привязка к файлам)

### 2.1 Динамический модуль Auth и конфигурация

- Регистрация модуля с параметрами из окружения: [src/app.module.ts](src/app.module.ts) — `AuthModule.register({ firebaseProjectId, firebaseClientEmail, firebasePrivateKey })`.
- Реализация динамического модуля: [src/auth/auth.module.ts](src/auth/auth.module.ts), опции: [src/auth/auth.options.ts](src/auth/auth.options.ts).

### 2.2 Проверка токена, привязка к пользователю БД

- Сервис аутентификации (verify token, контекст `req.user`): [src/auth/auth.service.ts](src/auth/auth.service.ts).
- Глобальный **AuthGuard**: [src/auth/auth.guard.ts](src/auth/auth.guard.ts).
- Публичные маршруты: метаданные через [src/auth/public.decorator.ts](src/auth/public.decorator.ts).

### 2.3 Роли USER / ADMIN

- Enum ролей в Prisma-схеме (поле `User.role`): см. `prisma/schema.prisma`.
- **RolesGuard** и декоратор `@Roles`: [src/auth/roles.guard.ts](src/auth/roles.guard.ts), [src/auth/roles.decorator.ts](src/auth/roles.decorator.ts).
- Глобальное подключение guards: [src/app.module.ts](src/app.module.ts) — `APP_GUARD` для `AuthGuard` и `RolesGuard`.

### 2.4 Регистрация профиля после Firebase

Эндпоинты в [src/auth/auth-api.controller.ts](src/auth/auth-api.controller.ts):

| Метод | Путь | Назначение |
|-------|------|------------|
| `GET` | `/api/auth/me` | Текущий пользователь из БД (нужен Bearer и запись в `users`) |
| `POST` | `/api/auth/register` | Создание/обновление записи `User` по `firebase_uid` + поля профиля |

DTO: [src/auth/dto/register-profile.dto.ts](src/auth/dto/register-profile.dto.ts). Логика upsert: [src/users/users.service.ts](src/users/users.service.ts) — метод `upsertByFirebaseUid`.

### 2.5 Middleware редиректа (по заданию)

Для GET `/` подключён [src/auth/auth-redirect.middleware.ts](src/auth/auth-redirect.middleware.ts) в [src/app.module.ts](src/app.module.ts) (`MiddlewareConsumer`).

### 2.6 CORS и Swagger

- CORS и разрешённые/раскрываемые заголовки: [src/main.ts](src/main.ts).
- Схема Bearer в OpenAPI: `DocumentBuilder.addBearerAuth()` в [src/main.ts](src/main.ts).

### 2.7 Ограничение прав на изменение данных

Примеры проверок «только владелец или админ» реализованы в API ссылок и пользователей (например, правка ссылки, загрузка аватара) — см. контроллеры [src/links/links-api.controller.ts](src/links/links-api.controller.ts), [src/users/users-api.controller.ts](src/users/users-api.controller.ts).

### 2.8 Frontend (Vite + React + MUI)

Каталог [frontend/](frontend/): вход/регистрация через Firebase SDK, все запросы к `VITE_API_BASE_URL` с Bearer — хук [frontend/src/api/http.ts](frontend/src/api/http.ts), контекст [frontend/src/state/AuthContext.tsx](frontend/src/state/AuthContext.tsx).

Основные сценарии UI:

- Архив / главная — список ссылок и фильтры: [frontend/src/components/archive/](frontend/src/components/archive/).
- Загрузка ссылки + теги/курс: [frontend/src/pages/UploadPage.tsx](frontend/src/pages/UploadPage.tsx).
- Свои ссылки и редактирование: [frontend/src/pages/MyLinksPage.tsx](frontend/src/pages/MyLinksPage.tsx).
- Профиль пользователя и его работы: [frontend/src/pages/UserProfilePage.tsx](frontend/src/pages/UserProfilePage.tsx).
- Регистрация профиля в БД после Firebase: [frontend/src/pages/RegisterPage.tsx](frontend/src/pages/RegisterPage.tsx) + вызов `/api/auth/register`.

---

## 3. Как продемонстрировать преподавателю

### 3.1 Подготовка

1. Заполнить **backend** `.env` и **frontend** `frontend/.env` по [Lab7-Manual.md](Lab7-Manual.md) (на экране можно закрыть секреты бумажкой / размытием).
2. `npx prisma generate && npx prisma migrate deploy`
3. Запустить backend: `npm run start:dev`; frontend: `cd frontend && npm run dev`.
4. При необходимости выдать роль **ADMIN** в SQL — [Lab7-Manual.md](Lab7-Manual.md).

**Скриншот (плейсхолдер):** два терминала (backend + frontend) без видимых секретов.

### 3.2 Swagger: схема Bearer

Открыть `http://localhost:3010/api/docs` → **Authorize** → вставить Firebase ID token.

**Скриншот (плейсхолдер):** окно Authorize с замазанным токеном.

### 3.3 Публичные эндпоинты без токена

```bash
curl -i "http://localhost:3010/api/links?page=1&pageSize=1"
curl -i "http://localhost:3010/api/tags?page=1&pageSize=1"
```

Ожидаемо: **200** (список может быть пустым).

**Скриншот (плейсхолдер):** ответ200 в Swagger без Authorize.

### 3.4 Защищённые эндпоинты:401 без токена

Пример (удаление тега — только с правами; точный путь см. Swagger):

```bash
curl -i -X DELETE "http://localhost:3010/api/tags/00000000-0000-0000-0000-000000000000"
```

Ожидаемо: **401 Unauthorized** (невалидный uuid может дать 400 — лучше взять реальный id из GET `/api/tags`).

Полный сценарий — [Lab7-Test.md](Lab7-Test.md).

### 3.5 Роли: USER → 403, ADMIN → 200

С токеном обычного пользователя после `UPDATE users SET role = 'USER' ...` — DELETE админского метода → **403**. После выдачи **ADMIN** тому же email в БД — **200**.

**Скриншот (плейсхолдер):** два ответа (403 и 200) в Swagger или curl.

### 3.6 Связка Firebase ↔ PostgreSQL

1. Зарегистрироваться во фронтенде (Firebase создаёт учётную запись).
2. Пройти шаг регистрации профиля (вызов `/api/auth/register` с полями email, имя, фамилия, опционально telegram).
3. Показать в БД строку в `users`: заполнены `firebase_uid`, `email`, `role`, профильные поля.

**Скриншот (плейсхолдер):** Firebase Console → Authentication → Users; и таблица `users` в клиенте БД (без лишних персональных данных на общем экране).

### 3.7 UI: сценарий для защиты

| Шаг | Что показать |
|-----|----------------|
| 1 | Главная / архив без входа — список ссылек доступен |
| 2 | Регистрация → запись в БД |
| 3 | Вход → запросы с Bearer (Network → заголовок Authorization) |
| 4 | Загрузка ссылки + теги/курс |
| 5 | Чужой профиль — только просмотр; свои ссылки — редактирование в My Links |
| 6 | (Опционально) действие только для ADMIN — через Swagger с токеном admin |

**Скриншоты (плейсхолдеры):** Login, Register, Archive, Upload, My Links, User profile.

---

## 4. Чеклист перед показом

- [ ] Firebase: Email/Password включён; web config в `frontend/.env`.
- [ ] Backend: `FIREBASE_*` в `.env`, переносы строк в `FIREBASE_PRIVATE_KEY` как в `.env.example`.
- [ ] Миграции применены, `users` содержит `firebase_uid` и `role`.
- [ ] Для демонстрации ADMIN заранее выдана роль нужному email.
- [ ] CORS: фронт на `http://localhost:5173`, backend разрешает origin из [src/main.ts](src/main.ts).

---

## 5. Типичные проблемы

| Симптом | Что проверить |
|---------|----------------|
| 401 на `/api/auth/register` сразу после регистрации | Нужен свежий ID token в `Authorization` (фронт должен передать токен после `createUserWithEmailAndPassword`) |
| Пользователь есть в Firebase, но нет в БД | Не вызывался `POST /api/auth/register` или ошибка валидации (например, `telegramUrl` должен быть полным URL) |
| 403 на admin-операциях | В БД `role = 'ADMIN'` для того же пользователя, что в токене |
| CORS error в браузере | Origin фронта и `allowedHeaders` в [src/main.ts](src/main.ts) |
| `Invalid private key` | Экранирование `\n` в `FIREBASE_PRIVATE_KEY` в `.env` |
