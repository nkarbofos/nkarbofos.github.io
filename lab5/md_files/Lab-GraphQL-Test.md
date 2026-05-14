# GraphQL: запросы для проверки выполнения лабораторной

Эти запросы соответствуют текущим резолверам в `src/*/*.resolver.ts` и типам в `src/graphql/types/*`.

GraphQL эндпоинт: `POST http://localhost:3010/graphql`

> Примечание по ЛР6: заголовок `X-Elapsed-Time` проверяется по HTTP‑ответу (через `curl -i`), т.к. в GraphQL тело ответа не включает headers.

---

## 0) Быстрый шаблон `curl`

```bash
export BASE_URL="http://localhost:3010"

curl -i "$BASE_URL/graphql" \
  -H "Content-Type: application/json" \
  --data '{"query":"query { users(page: 1, pageSize: 1) { page pageSize hasNext items { id email } } }"}'
```

Ожидаемо (ЛР6): в заголовках есть `X-Elapsed-Time: ...ms`.

---

## 1) Query: Users (пагинация) + User по id

### 1.1 Список пользователей

```graphql
query Users($page: Int!, $pageSize: Int!) {
  users(page: $page, pageSize: $pageSize) {
    page
    pageSize
    hasNext
    items {
      id
      email
      firstName
      lastName
      telegramUrl
      avatarUrl
      createdAt
      updatedAt
    }
  }
}
```

Variables:

```json
{ "page": 1, "pageSize": 5 }
```

### 1.2 Один пользователь + его ссылки (ResolveField)

```graphql
query UserWithLinks($id: ID!) {
  user(id: $id) {
    id
    email
    firstName
    lastName
    links {
      id
      linkName
      githubPagesUrl
      createdAt
    }
  }
}
```

---

## 2) Query: Links (фильтры) + Link по id с relation fields

### 2.1 Список ссылок (фильтры: userId/tagId/courseId)

```graphql
query Links($page: Int!, $pageSize: Int!, $userId: ID, $tagId: ID, $courseId: ID) {
  links(page: $page, pageSize: $pageSize, userId: $userId, tagId: $tagId, courseId: $courseId) {
    page
    pageSize
    hasNext
    items {
      id
      userId
      reviewId
      linkName
      githubPagesUrl
      createdAt
    }
  }
}
```

Variables (пример):

```json
{ "page": 1, "pageSize": 10, "userId": null, "tagId": null, "courseId": null }
```

### 2.2 Одна ссылка + author/review/tags/courses (ResolveField)

```graphql
query LinkFull($id: ID!) {
  link(id: $id) {
    id
    linkName
    githubPagesUrl
    createdAt
    user {
      id
      firstName
      lastName
      email
    }
    review {
      id
      score
      comment
      user {
        id
        email
      }
    }
    tags {
      id
      name
    }
    courses {
      id
      name
      code
    }
  }
}
```

---

## 3) Query: Tags и Courses + обратные связи (links)

### 3.1 Теги (список) + теги по id + ссылки тега

```graphql
query Tags($page: Int!, $pageSize: Int!) {
  tags(page: $page, pageSize: $pageSize) {
    page
    pageSize
    hasNext
    items { id name }
  }
}
```

```graphql
query TagWithLinks($id: ID!) {
  tag(id: $id) {
    id
    name
    links {
      id
      linkName
      githubPagesUrl
    }
  }
}
```

### 3.2 Курсы (список) + курс по id + ссылки курса

```graphql
query Courses($page: Int!, $pageSize: Int!) {
  courses(page: $page, pageSize: $pageSize) {
    page
    pageSize
    hasNext
    items { id name code }
  }
}
```

```graphql
query CourseWithLinks($id: ID!) {
  course(id: $id) {
    id
    name
    code
    links {
      id
      linkName
      githubPagesUrl
    }
  }
}
```

---

## 4) Query: Reviews + Review по id с author и links

```graphql
query Reviews($page: Int!, $pageSize: Int!) {
  reviews(page: $page, pageSize: $pageSize) {
    page
    pageSize
    hasNext
    items { id userId score comment }
  }
}
```

```graphql
query ReviewFull($id: ID!) {
  review(id: $id) {
    id
    score
    comment
    user { id email }
    links { id linkName githubPagesUrl }
  }
}
```

---

## 5) Mutations: CRUD (минимальный e2e сценарий)

> Для повторных запусков используйте уникальные значения (email, имена тегов/курсов), иначе можно получить `409` (уникальные поля в БД).

### 5.1 CreateUser

```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    firstName
    lastName
    telegramUrl
  }
}
```

Variables:

```json
{
  "input": {
    "email": "gql-test-1@example.com",
    "firstName": "Graph",
    "lastName": "QL",
    "telegramUrl": "https://t.me/gql_test"
  }
}
```

### 5.2 CreateTag / CreateCourse

```graphql
mutation CreateTag($input: CreateTagInput!) {
  createTag(input: $input) { id name }
}
```

```json
{ "input": { "name": "gql-tag-1" } }
```

```graphql
mutation CreateCourse($input: CreateCourseInput!) {
  createCourse(input: $input) { id name code }
}
```

```json
{ "input": { "name": "SoftwareEngineering", "code": "09.03.04" } }
```

### 5.3 CreateLink

```graphql
mutation CreateLink($input: CreateLinkInput!) {
  createLink(input: $input) {
    id
    userId
    linkName
    githubPagesUrl
    createdAt
  }
}
```

Variables (подставьте `userId` от createUser):

```json
{
  "input": {
    "userId": "REPLACE_USER_ID",
    "linkName": "MyProject",
    "githubPagesUrl": "https://example.github.io/project/"
  }
}
```

### 5.4 Attach tag/course to link

```graphql
mutation AttachTag($linkId: ID!, $tagId: ID!) {
  attachTagToLink(linkId: $linkId, tagId: $tagId) { ok }
}
```

```graphql
mutation AttachCourse($linkId: ID!, $courseId: ID!) {
  attachCourseToLink(linkId: $linkId, courseId: $courseId) { ok }
}
```

### 5.5 CreateReview + связать review со ссылкой

```graphql
mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input) { id userId score comment }
}
```

```json
{ "input": { "userId": "REPLACE_USER_ID", "score": 5, "comment": "OK" } }
```

```graphql
mutation UpdateLink($id: ID!, $input: UpdateLinkInput!) {
  updateLink(id: $id, input: $input) { id reviewId linkName githubPagesUrl }
}
```

Variables:

```json
{ "id": "REPLACE_LINK_ID", "input": { "reviewId": "REPLACE_REVIEW_ID" } }
```

### 5.6 Обновления (UpdateTag/UpdateCourse/UpdateUser/UpdateReview)

```graphql
mutation UpdateTag($id: ID!, $input: UpdateTagInput!) {
  updateTag(id: $id, input: $input) { id name }
}
```

```graphql
mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
  updateCourse(id: $id, input: $input) { id name code }
}
```

```graphql
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) { id email firstName lastName telegramUrl }
}
```

```graphql
mutation UpdateReview($id: ID!, $input: UpdateReviewInput!) {
  updateReview(id: $id, input: $input) { id score comment userId }
}
```

### 5.7 Удаления (Detach + Delete)

```graphql
mutation DetachTag($linkId: ID!, $tagId: ID!) {
  detachTagFromLink(linkId: $linkId, tagId: $tagId) { ok }
}
```

```graphql
mutation DetachCourse($linkId: ID!, $courseId: ID!) {
  detachCourseFromLink(linkId: $linkId, courseId: $courseId) { ok }
}
```

```graphql
mutation DeleteLink($id: ID!) { deleteLink(id: $id) { ok } }
mutation DeleteReview($id: ID!) { deleteReview(id: $id) { ok } }
mutation DeleteTag($id: ID!) { deleteTag(id: $id) { ok } }
mutation DeleteCourse($id: ID!) { deleteCourse(id: $id) { ok } }
mutation DeleteUser($id: ID!) { deleteUser(id: $id) { ok } }
```

