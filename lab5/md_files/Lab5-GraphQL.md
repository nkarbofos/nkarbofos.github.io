# ЛР 5: что добавлено в проект и краткая теория GraphQL

## Что было добавлено (изменения в коде)

### Зависимости (`package.json`)

- `@nestjs/graphql`, `@nestjs/apollo` — интеграция GraphQL с NestJS (подход **code-first**).
- `@apollo/server`, `graphql` — сервер Apollo и сам язык схем GraphQL.
- `graphql-query-complexity` — подсчёт «сложности» запроса и ограничение `maximumComplexity`.

### Глобальная настройка

- [`src/app.module.ts`](src/app.module.ts): подключён `GraphQLModule` с `ApolloDriver`, путь **`/graphql`**, генерация файла схемы в **`src/schema.gql`** (файл появляется после первого успешного запуска приложения), плагин **Apollo Sandbox** (встроенная песочница), правило валидации **`createComplexityRule`** с лимитом **100** и `simpleEstimator`.

### Типы схемы (ObjectType / InputType / Args)

Каталог [`src/graphql/types/`](src/graphql/types/):

- [`pagination.object.ts`](src/graphql/types/pagination.object.ts) — обёртки списков с полями `items`, `page`, `pageSize`, `hasNext`.
- [`mutation-result.object.ts`](src/graphql/types/mutation-result.object.ts) — `MutationOkGql { ok }` для удалений и detach-операций.
- [`user.model.ts`](src/graphql/types/user.model.ts), [`link.model.ts`](src/graphql/types/link.model.ts), [`review.model.ts`](src/graphql/types/review.model.ts), [`tag.model.ts`](src/graphql/types/tag.model.ts), [`course.model.ts`](src/graphql/types/course.model.ts) — типы сущностей и входные типы для мутаций; у полей указаны **описания** (`description`).

### Резолверы (запросы, мутации, field resolvers)

| Файл | Содержание |
|------|------------|
| [`src/users/users.resolver.ts`](src/users/users.resolver.ts) | `users` / `user`, мутации `createUser`, `updateUser`, `deleteUser`, `@ResolveField` **`links`** |
| [`src/links/links.resolver.ts`](src/links/links.resolver.ts) | `links` (фильтры + пагинация) / `link`, CRUD, **`attachTagToLink`**, **`detachTagFromLink`**, **`attachCourseToLink`**, **`detachCourseFromLink`**, поля **`user`**, **`review`**, **`tags`**, **`courses`** |
| [`src/reviews/reviews.resolver.ts`](src/reviews/reviews.resolver.ts) | `reviews` / `review`, CRUD, поля **`user`**, **`links`** |
| [`src/tags/tags.resolver.ts`](src/tags/tags.resolver.ts) | `tags` / `tag`, CRUD, поле **`links`** |
| [`src/courses/courses.resolver.ts`](src/courses/courses.resolver.ts) | `courses` / `course`, CRUD, поле **`links`** |

Резолверы зарегистрированы в `providers` соответствующих модулей ([`users.module.ts`](src/users/users.module.ts), [`links.module.ts`](src/links/links.module.ts) и др.). Для разрыва циклических зависимостей между пользователями, ссылками и отзывами используется **`forwardRef`**.

### Сервисы (данные для «плоских» запросов и field resolvers)

В существующие сервисы добавлены методы **`findOneShallow`** (только скаляры, без жадной подгрузки связей) и вспомогательные выборки для связей (`findManyForUser`, `findTagsForLink`, `findLinksForTag` и т.д.). Так список/одиночный запрос в GraphQL не тянет всё дерево сразу; вложенность запрашивается через **field resolvers**, когда клиент указал поля в запросе.

### Ошибки Prisma в GraphQL

- [`src/common/filters/prisma-exception.filter.ts`](src/common/filters/prisma-exception.filter.ts): если контекст **`graphql`**, вместо записи в HTTP-ответ пробрасывается **`HttpException`** с тем же телом и кодом, что и для REST.

### Прочее

- [`src/main.ts`](src/main.ts): `void bootstrap()` — устранение предупреждения линтера о «висящем» промиссе.

---

## Краткая теория: что такое GraphQL и зачем он нужен

**GraphQL** — это язык запросов к API и система типов для описания данных и операций над ними. Клиент описывает **какую форму дерева данных** нужно получить; сервер выполняет один HTTP-запрос (обычно `POST /graphql`) и возвращает JSON строго в запрошенной структуре.

### Схема, запросы и мутации

- **Схема (schema)** — контракт: какие типы, поля и операции доступны. В Nest при подходе **code-first** схема **генерируется из TypeScript-классов** с декораторами (`@ObjectType`, `@Field`, `@InputType`, `@Mutation`, `@Query`).
- **Query** — чтение данных (аналог GET в REST, но с произвольной вложенностью полей в одном запросе).
- **Mutation** — изменения (создание, обновление, удаление, прикрепление/открепление связей). В учебной работе важно именовать мутации **по смыслу предметной области** (например, `attachTagToLink` и `detachTagFromLink`), а не одной абстрактной «установкой статуса».

### Чем GraphQL отличается от REST

- В REST часто много эндпоинтов и версий; в GraphQL — **одна точка входа**, а нужные поля выбираются в запросе.
- **Нет «оверфетча»** всех полей ресурса по умолчанию: клиент запрашивает только то, что нужен UI.
- Минус: сложные запросы могут заставить сервер выполнить тяжёлую работу (**проблема сложности**), поэтому в приложении добавлен **лимит сложности** (`graphql-query-complexity`).

### Field resolvers

Поле в типе может обрабатываться отдельной функцией (**field resolver**). Тогда родительский запрос может вернуть «плоский» объект (например, ссылку с `userId`), а поле `user` подгрузится **только если клиент его запросил**. Это демонстрирует идею GraphQL: данные по мере необходимости, а не одним жёстким ответом.

### Пагинация

Для больших списков в схеме используются обёртки с **`page`**, **`pageSize`**, **`hasNext`** (как в REST-части проекта), чтобы не отдавать всю таблицу за один раз.

---

## Как открыть песочницу и проверить работу

1. Задайте **`DATABASE_URL`** (см. [.env.example](.env.example) и [md_files/RUN_AND_TEST.md](md_files/RUN_AND_TEST.md)).
2. Выполните `npx prisma generate` и при необходимости миграции.
3. Запустите приложение: `npm run start` (или `npm run start:dev`).
4. В браузере откройте **`http://localhost:3010/graphql`** — откроется **Apollo Sandbox** (встроенная песочница). Там же можно открыть **документацию схемы** (Schema / Explorer в интерфейсе Sandbox).
5. После первого успешного запуска приложения появится сгенерированный **`src/schema.gql`**; в [`.gitignore`](.gitignore) этот файл указан, чтобы не коммитить автогенерацию.

Пример запроса (подставьте существующий UUID пользователя):

```graphql
query OneUserWithLinks {
  user(id: "00000000-0000-0000-0000-000000000000") {
    id
    email
    links {
      id
      linkName
      tags {
        name
      }
    }
  }
}
```

Если лимит сложности превышен, сервер вернёт ошибку валидации запроса — это ожидаемое поведение защиты от слишком тяжёлых запросов.
