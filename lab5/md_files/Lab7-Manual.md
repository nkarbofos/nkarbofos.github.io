# ЛР 7: ручные действия (что нужно сделать самому)

## 1) Firebase (Auth) — подготовка

### 1.1 Создать проект и включить Email/Password

1. Создайте Firebase project (если ещё нет).
2. В Firebase Console включите **Authentication → Sign-in method → Email/Password**.

### 1.2 Web-конфиг для фронтенда

1. В Firebase Console создайте Web App (если ещё не создан).
2. Заполните `frontend/.env` (скопируйте `frontend/.env.example` → `frontend/.env`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_BASE_URL="http://localhost:3010"`

## 2) Firebase Admin (backend) — service account

1. В Firebase Console откройте **Project settings → Service accounts**.
2. Сгенерируйте ключ (JSON).
3. Заполните `.env` (скопируйте `.env.example` → `.env`):

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Важно: `FIREBASE_PRIVATE_KEY` в `.env` должен содержать переводы строк как `\\n` (пример есть в `.env.example`).

## 3) База данных и миграции Prisma

В ЛР7 добавлены:

- `users.firebase_uid` (unique)
- `users.role` (enum `UserRole`: `USER|ADMIN`)

Примените миграции:

```bash
npx prisma generate
npx prisma migrate deploy
```

## 4) Выдать роль ADMIN вручную

По заданию роли две: `USER` и `ADMIN`. Роль хранится в БД, admin выдаётся вручную.

Вариант через SQL (PostgreSQL):

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-admin-email@example.com';
```

Идея: вы логинитесь во фронтенде этим email (Firebase), затем делаете любой запрос к backend с Bearer token — backend свяжет Firebase uid с вашим пользователем по email и роль начнёт применяться.

## 5) Запуск

Backend:

```bash
npm install
npm run start:dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Ожидаемые адреса:

- backend: `http://localhost:3010`
- swagger: `http://localhost:3010/api/docs`
- graphql: `http://localhost:3010/graphql`
- frontend (vite): `http://localhost:5173`

