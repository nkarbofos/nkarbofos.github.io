#!/usr/bin/env bash
# Smoke-проверка API (Nest) и основных URL фронтенда (Vite) через curl.
# Запуск: из корня репозитория после `npm run start:dev` и (опционально) `npm run dev` в frontend.
#
#   bash scripts/curl-smoke.sh
#   BASE_URL=http://localhost:3010 FRONTEND_URL=http://127.0.0.1:5173 bash scripts/curl-smoke.sh
#
# Пропуск проверок, если сервер не поднят:
#   SKIP_BACKEND=1 bash scripts/curl-smoke.sh
#   SKIP_FRONTEND=1 bash scripts/curl-smoke.sh

set -euo pipefail

BASE="${BASE_URL:-http://localhost:3010}"
FE="${FRONTEND_URL:-http://127.0.0.1:5173}"
SKIP_BACKEND="${SKIP_BACKEND:-0}"
SKIP_FRONTEND="${SKIP_FRONTEND:-0}"

CURL=(curl -sS --connect-timeout 2 --max-time 15)

failures=0

ok() { echo "OK   $*"; }
bad() {
  echo "FAIL $*"
  failures=$((failures + 1))
}

want_code() {
  local url=$1 want=$2 label=$3
  local got
  if ! got=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "$url"); then
    bad "$label (curl error)"
    return
  fi
  if [[ "$got" != "$want" ]]; then
    bad "$label: ожидался HTTP $want, получен $got ($url)"
  else
    ok "$label (HTTP $got)"
  fi
}

if [[ "$SKIP_BACKEND" != "1" ]]; then
  echo "=== Backend: $BASE ==="
  want_code "$BASE/" 401 "GET / без Bearer (Accept по умолчанию)"
  got=$("${CURL[@]}" -o /dev/null -w '%{http_code}' -H 'Accept: text/html' "$BASE/") || got=ERR
  redir=$("${CURL[@]}" -o /dev/null -w '%{redirect_url}' -H 'Accept: text/html' "$BASE/") || redir=ERR
  if [[ "$got" != "302" ]]; then
    bad "GET / с Accept: text/html: ожидался 302, получен $got"
  elif [[ "$redir" != *"/login"* ]]; then
    bad "GET / с Accept: text/html: редирект не на /login: $redir"
  else
    ok "GET / с Accept: text/html → 302 на login ($redir)"
  fi

  for path in \
    '/api/users?page=1&pageSize=1' \
    '/api/tags?page=1&pageSize=1' \
    '/api/courses?page=1&pageSize=1' \
    '/api/links?page=1&pageSize=1' \
    '/api/reviews?page=1&pageSize=1'; do
    want_code "$BASE$path" 200 "GET $path"
  done

  want_code "$BASE/api/docs" 200 "Swagger UI GET /api/docs"
  want_code "$BASE/api/docs-json" 200 "OpenAPI JSON GET /api/docs-json"

  body=$("${CURL[@]}" -H 'Content-Type: application/json' \
    -d '{"query":"{ __typename }"}' "$BASE/graphql") || body=
  if echo "$body" | grep -q '"__typename":"Query"'; then
    ok 'POST /graphql { __typename } (без Bearer, ожидается data)'
  else
    bad "POST /graphql __typename: неожиданное тело: ${body:0:200}"
  fi

  body=$("${CURL[@]}" -H 'Content-Type: application/json' \
    -d '{"query":"query { courses(page: 1, pageSize: 1) { items { id } } }"}' "$BASE/graphql") || body=
  if echo "$body" | grep -q '"errors"' && echo "$body" | grep -q 'UNAUTHENTICATED\|Unauthorized'; then
    ok 'POST /graphql courses без Bearer → GraphQL errors (ожидается без доступа к данным)'
  else
    bad "POST /graphql courses: ожидались errors UNAUTHENTICATED, тело: ${body:0:300}"
  fi
else
  echo "=== Backend: пропущено (SKIP_BACKEND=1) ==="
fi

if [[ "$SKIP_FRONTEND" != "1" ]]; then
  echo "=== Frontend: $FE (Vite SPA — все маршруты отдают index.html) ==="
  for path in / /login /register /upload /profile /my-links /teacher; do
    want_code "$FE$path" 200 "GET фронт $path"
  done
  want_code "$FE/user/00000000-0000-0000-0000-000000000000" 200 'GET фронт /user/:uuid'
  want_code "$FE/project/00000000-0000-0000-0000-000000000000" 200 'GET фронт /project/:uuid'
else
  echo "=== Frontend: пропущено (SKIP_FRONTEND=1) ==="
fi

if [[ "$failures" -gt 0 ]]; then
  echo "Итого: $failures ошибок"
  exit 1
fi
echo 'Итого: все проверки прошли'
exit 0
