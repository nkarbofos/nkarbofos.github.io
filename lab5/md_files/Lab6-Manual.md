# ЛР 6: ручные действия (что нужно сделать самому)

## 1) Подготовить переменные окружения

1. Скопируйте шаблон:
   - `.env.example` → `.env`
2. Укажите рабочий `DATABASE_URL` (Aiven/локальная PostgreSQL).
3. Проверьте порт:
   - `PORT=3010` (по умолчанию приложение слушает 3010, если `PORT` не задан).

## 2) Подготовить Yandex Object Storage (S3) для аватара пользователя

### Создание бакета

1. В Yandex Cloud откройте **Object Storage** и создайте **bucket** (например `weblabs-avatars`).
2. Включите публичный доступ к объектам (если хотите открывать `avatarUrl` напрямую по URL).
   - Альтернатива: не делать бакет публичным и раздавать файлы через signed URL (в этой лабораторной не обязательно).

### Создание ключей

1. Создайте **Access key / Secret key** для Object Storage.
2. Запишите значения в `.env`:

   - `S3_ENDPOINT` (обычно `https://storage.yandexcloud.net`)
   - `S3_REGION` (обычно `ru-central1`)
   - `S3_BUCKET`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `S3_PUBLIC_BASE_URL` (например `https://storage.yandexcloud.net/<bucket>`)

## 3) Применить миграции Prisma

В проекте добавлено поле `User.avatarUrl` и миграция.

1. Сгенерируйте Prisma Client:

```bash
npx prisma generate
```

2. Примените миграции:

```bash
npx prisma migrate deploy
```

Если база недоступна — сначала исправьте `DATABASE_URL`/сетевой доступ.

## 4) Запуск приложения

```bash
npm run start:dev
```

После старта будут доступны:

- REST: `http://localhost:3010/api/...`
- Swagger: `http://localhost:3010/api/docs`
- GraphQL: `http://localhost:3010/graphql`

