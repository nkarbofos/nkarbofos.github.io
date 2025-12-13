# Архивы Проектов - React приложение

Веб-приложение для загрузки и управления архивами исходного кода проектов-сайтов с системой аутентификации и фильтрацией.

## Возможности

- 🔐 Система аутентификации пользователей (регистрация/вход)
- 📦 Загрузка архивов проектов (ZIP, RAR, 7Z, TAR, GZ)
- 🏷️ Теги для классификации проектов
- 🔗 Ссылки на GitHub Pages для каждого проекта
- 🔍 Фильтрация по тегам и пользователям
- 📱 Адаптивный дизайн (Material-UI)

## Технологии

- **React 19** + **TypeScript**
- **Vite** - сборщик
- **Material-UI (MUI)** - UI библиотека
- **Firebase** - Backend (Firestore, Authentication, Storage)
- **React Router** - маршрутизация
- **React Dropzone** - загрузка файлов

## Установка и настройка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Firebase

1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Включите следующие сервисы:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
3. Скопируйте конфигурационные данные Firebase
4. Создайте файл `.env` в корне проекта:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Настройка Firestore правил

В Firebase Console перейдите в Firestore Database > Rules и установите:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Archives collection
    match /archives/{archiveId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Настройка Storage правил

В Firebase Console перейдите в Storage > Rules и установите:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /archives/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Создание индексов Firestore

В Firebase Console создайте следующие индексы:

1. Collection: `archives`
   - Fields: `tags` (Array), `uploadedAt` (Descending)
2. Collection: `archives`
   - Fields: `userId` (Ascending), `uploadedAt` (Descending)

## Запуск

```bash
# Режим разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен сборки
npm run preview
```

## Структура проекта

```
src/
├── components/
│   ├── auth/          # Компоненты аутентификации
│   ├── upload/        # Загрузка архивов
│   ├── archive/       # Список и карточки архивов
│   └── layout/        # Навигация и layout
├── services/          # Firebase сервисы
├── context/           # React контексты
├── hooks/             # Custom hooks
└── types/             # TypeScript типы
```

## Использование

1. Зарегистрируйтесь или войдите в систему
2. Нажмите "Загрузить" для загрузки нового архива
3. Заполните форму:
   - Перетащите или выберите архив
   - Введите ссылку на GitHub Pages
   - Выберите теги проекта
4. Используйте фильтры для поиска архивов по тегам и пользователям
