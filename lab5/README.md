# Lab 5: каталог проектов

Fullstack-приложение для публикации ссылок на GitHub Pages проекты, просмотра профилей пользователей, тегов, курсов и ревью. Frontend написан на React + Vite, backend на NestJS + Prisma.

## Структура

```text
lab5/
├── src/                 # NestJS backend
├── prisma/              # Prisma schema и миграции PostgreSQL
├── scripts/             # smoke-проверки
├── test/                # e2e-тесты backend
├── md_files/            # подробные отчёты и инструкции по лабораторным
├── frontend/            # React + Vite frontend
├── package.json         # backend scripts
└── README.md
```

## Требования

- Node.js `24.x` (в `package.json` указан `24.14.0`).
- PostgreSQL и переменная `DATABASE_URL`.
- Firebase project: frontend использует Firebase Client SDK, backend проверяет Firebase ID token через Firebase Admin SDK.
- Для загрузки файлов можно настроить S3/Yandex Object Storage переменные.

## Переменные окружения

Backend читает `.env` из корня `lab5`. Создайте файл из шаблона:

```bash
cp .env.example .env
```

Основные backend-переменные:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
PORT=3010
FRONTEND_ORIGINS="http://localhost:5173,https://nkarbofos.github.io"

FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Frontend читает `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_BASE_URL="http://localhost:3010"
VITE_FIREBASE_API_KEY="your-firebase-web-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-firebase-project-id"
VITE_FIREBASE_APP_ID="your-firebase-web-app-id"
```

Не коммитьте реальные `.env` файлы. `FIREBASE_PRIVATE_KEY`, `DATABASE_URL` и S3 credentials являются секретами.

## Локальный запуск

Установите backend-зависимости и подготовьте Prisma:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

Запустите backend:

```bash
npm run start:dev
```

API по умолчанию доступно на `http://localhost:3010`.

Установите и запустите frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend по умолчанию доступен на `http://localhost:5173`.

## Сборка и проверки

Backend:

```bash
npm run build
npm test
npm run test:e2e
npm run smoke:curl
```

Frontend:

```bash
cd frontend
npm run build
npm run preview
```

Swagger доступен после запуска backend:

```text
http://localhost:3010/api/docs
```

GraphQL endpoint:

```text
http://localhost:3010/graphql
```

Дополнительные сценарии проверки описаны в `md_files/RUN_AND_TEST.md`, `md_files/Lab5-GraphQL.md`, `md_files/Lab6-Manual.md` и `md_files/Lab7-Manual.md`.

## Деплой frontend на GitHub Pages

Текущий workflow `.github/workflows/deploy.yml` сохраняет прежний принцип деплоя для этого репозитория: GitHub Actions собирает только `lab5/frontend` и публикует статические файлы из `frontend/dist` в ветку `gh-pages`.

Backend не деплоится на GitHub Pages. Его нужно запустить отдельно на Render, Railway, Fly.io, VPS или другом Node.js-хостинге с PostgreSQL. URL backend передаётся frontend через GitHub Secret `VITE_API_BASE_URL`.

### GitHub Secrets

В настройках репозитория добавьте secrets:

```text
VITE_API_BASE_URL
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
```

Если сайт публикуется не в корень домена, задайте repository variable `VITE_BASE_PATH`, например `/lab5/`. По умолчанию используется `/`, что соответствует текущей схеме публикации workflow в корень `gh-pages`.

### Настройка backend для production frontend

На backend-хостинге задайте `FRONTEND_ORIGINS` со списком разрешённых origins:

```env
FRONTEND_ORIGINS="https://nkarbofos.github.io"
```

Для нескольких адресов используйте запятую:

```env
FRONTEND_ORIGINS="http://localhost:5173,https://nkarbofos.github.io"
```

### Ручная сборка frontend

```bash
cd lab5/frontend
VITE_API_BASE_URL="https://your-api.example.com" npm run build
```

Содержимое `lab5/frontend/dist` можно опубликовать на любом статическом хостинге.
