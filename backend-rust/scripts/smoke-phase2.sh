#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:5550}"
ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi
DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-}@${POSTGRES_HOST:-localhost}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-sicerdas}}"

PASS=0
FAIL=0

check() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "PASS: $name ($actual)"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $name (expected $expected, got $actual)"
    FAIL=$((FAIL + 1))
  fi
}

COOKIE_USER=$(mktemp)
COOKIE_ADMIN=$(mktemp)
TMP_PNG=$(mktemp --suffix=.png)
trap 'rm -f "$COOKIE_USER" "$COOKIE_ADMIN" "$TMP_PNG"' EXIT

python3 - <<PYEOF
import base64
# Valid 1x1 PNG
png_b64 = b"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
open("$TMP_PNG", "wb").write(base64.b64decode(png_b64))
PYEOF

echo "=== 1. Public Endpoints ==="
check "GET /api/tier/app-tier" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/tier/app-tier")"
check "GET /api/app/dictionary-data" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/app/dictionary-data")"
check "GET /api/app/periodic-table" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/app/periodic-table")"
check "GET /api/periodic-table/element/1" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/periodic-table/element/1")"
check "POST /api/app/app-latest" "200" "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"dbVersion":0}' "$BASE_URL/api/app/app-latest")"
check "POST /api/version/list" "200" "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/version/list")"
check "POST /api/version/list-simple" "200" "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"dataType":"book"}' "$BASE_URL/api/version/list-simple")"
check "POST /api/education/categories/list" "200" "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/education/categories/list")"
check "POST /api/education/categories/list-simple" "200" "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/education/categories/list-simple")"
check "POST /api/education/grades/list" "200" "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/education/grades/list")"
check "POST /api/education/grades/list-simple" "200" "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/education/grades/list-simple")"
check "POST /api/education/tags/list" "200" "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/education/tags/list")"
check "POST /api/education/tags/list-simple" "200" "$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/education/tags/list-simple")"

REPORT_RESP=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Smoke Reporter","email":"smoke@example.com","title":"Smoke Report","contentType":"book","referenceId":"00000000-0000-0000-0000-000000000001","reason":"other","description":"test"}' \
  "$BASE_URL/api/content-report/create")
REPORT_ID=$(echo "$REPORT_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["id"])' 2>/dev/null || true)
check "POST /api/content-report/create" "1" "$([ -n "$REPORT_ID" ] && echo 1 || echo 0)"
if [ -n "$REPORT_ID" ]; then
  psql "$DATABASE_URL" -c "DELETE FROM content_report WHERE id = '$REPORT_ID';" >/dev/null
fi

echo "=== 2. User Endpoints & RequireAdmin 403 ==="
RAND=$(date +%s)
USER_EMAIL="smoke-user-$RAND@example.com"
ADMIN_EMAIL="smoke-admin-$RAND@example.com"
PASS_VAL="SmokePass123!"

check "Sign-up regular user" "200" "$(curl -s -c "$COOKIE_USER" -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "{\"name\":\"Smoke User\",\"email\":\"$USER_EMAIL\",\"password\":\"$PASS_VAL\"}" "$BASE_URL/api/auth/sign-up/email")"

check "GET /api/users/user/details" "200" "$(curl -s -b "$COOKIE_USER" -o /dev/null -w '%{http_code}' "$BASE_URL/api/users/user/details")"
check "PUT /api/users/user/update-profile" "200" "$(curl -s -b "$COOKIE_USER" -o /dev/null -w '%{http_code}' -X PUT -F 'name=Smoke Updated' -F 'school=SMA 1' -F 'educationLevel=sma' "$BASE_URL/api/users/user/update-profile")"

AVATAR_RESP=$(curl -s -b "$COOKIE_USER" -X PATCH -F "file=@$TMP_PNG;type=image/png" "$BASE_URL/api/users/user/avatar")
AVATAR_URL=$(echo "$AVATAR_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["image"])' 2>/dev/null || true)
check "PATCH /api/users/user/avatar (upload)" "1" "$([ -n "$AVATAR_URL" ] && echo 1 || echo 0)"
if [ -n "$AVATAR_URL" ]; then
  check "GET uploaded avatar URL" "200" "$(curl -s -o /dev/null -w '%{http_code}' "$AVATAR_URL")"
fi
check "PATCH /api/users/user/avatar?action=remove" "200" "$(curl -s -b "$COOKIE_USER" -o /dev/null -w '%{http_code}' -X PATCH "$BASE_URL/api/users/user/avatar?action=remove")"

check "GET /api/users/user/sessions-list" "200" "$(curl -s -b "$COOKIE_USER" -o /dev/null -w '%{http_code}' "$BASE_URL/api/users/user/sessions-list")"
check "PUT /api/users/user/change-password" "200" "$(curl -s -b "$COOKIE_USER" -o /dev/null -w '%{http_code}' -X PUT -H 'Content-Type: application/json' -d "{\"currentPassword\":\"$PASS_VAL\",\"newPassword\":\"NewPass123!\"}" "$BASE_URL/api/users/user/change-password")"

# RBAC 403 checks with role=user
check "403 POST /api/users/admin/list as user" "403" "$(curl -s -b "$COOKIE_USER" -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/users/admin/list")"
check "403 GET /api/users/admin/stats as user" "403" "$(curl -s -b "$COOKIE_USER" -o /dev/null -w '%{http_code}' "$BASE_URL/api/users/admin/stats")"
check "403 GET /api/tier/admin/list-tier as user" "403" "$(curl -s -b "$COOKIE_USER" -o /dev/null -w '%{http_code}' "$BASE_URL/api/tier/admin/list-tier")"
check "403 GET /api/ai/model/admin/models/stats as user" "403" "$(curl -s -b "$COOKIE_USER" -o /dev/null -w '%{http_code}' "$BASE_URL/api/ai/model/admin/models/stats")"

echo "=== 3. Admin Endpoints ==="
check "Sign-up smoke admin" "200" "$(curl -s -c "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "{\"name\":\"Smoke Admin\",\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASS_VAL\"}" "$BASE_URL/api/auth/sign-up/email")"
psql "$DATABASE_URL" -c "UPDATE users SET role = 'admin' WHERE email = '$ADMIN_EMAIL';" >/dev/null
# Re-sign-in so session cache reflects admin role
check "Sign-in smoke admin" "200" "$(curl -s -c "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$PASS_VAL\"}" "$BASE_URL/api/auth/sign-in/email")"

check "POST /api/users/admin/list" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"page":1,"limit":5}' "$BASE_URL/api/users/admin/list")"
check "GET /api/users/admin/stats" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' "$BASE_URL/api/users/admin/stats")"

CREATED_USER_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST -H 'Content-Type: application/json' -d "{\"name\":\"Managed User\",\"email\":\"managed-$RAND@example.com\",\"password\":\"Pass1234!\"}" "$BASE_URL/api/users/admin/create")
CREATED_UID=$(echo "$CREATED_USER_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["id"])' 2>/dev/null || true)
check "POST /api/users/admin/create" "1" "$([ -n "$CREATED_UID" ] && echo 1 || echo 0)"
if [ -n "$CREATED_UID" ]; then
  check "GET /api/users/admin/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' "$BASE_URL/api/users/admin/$CREATED_UID")"
  check "PATCH /api/users/admin/update" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X PATCH -H 'Content-Type: application/json' -d "{\"id\":\"$CREATED_UID\",\"name\":\"Managed Updated\"}" "$BASE_URL/api/users/admin/update")"
  check "POST /api/users/admin/ban" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "{\"id\":\"$CREATED_UID\",\"banned\":true,\"banReason\":\"test\"}" "$BASE_URL/api/users/admin/ban")"
  check "POST /api/users/admin/reset-password" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "{\"id\":\"$CREATED_UID\",\"newPassword\":\"ResetPass123!\"}" "$BASE_URL/api/users/admin/reset-password")"
  check "DELETE /api/users/admin/delete/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X DELETE "$BASE_URL/api/users/admin/delete/$CREATED_UID")"
fi

# Tier CRUD
check "GET /api/tier/admin/list-tier" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' "$BASE_URL/api/tier/admin/list-tier")"
TIER_SLUG="smoke-tier-$RAND"
check "POST /api/tier/admin/create-tier" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d "{\"slug\":\"$TIER_SLUG\",\"name\":\"Smoke Tier $RAND\",\"price\":\"9.99\"}" "$BASE_URL/api/tier/admin/create-tier")"
check "GET /api/tier/admin/{slug}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' "$BASE_URL/api/tier/admin/$TIER_SLUG")"
check "PATCH /api/tier/admin/{slug}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X PATCH -H 'Content-Type: application/json' -d '{"isPopular":true}' "$BASE_URL/api/tier/admin/$TIER_SLUG")"
check "DELETE /api/tier/admin/{slug}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X DELETE "$BASE_URL/api/tier/admin/$TIER_SLUG")"

# Version CRUD
VER_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST -H 'Content-Type: application/json' -d "{\"appVersion\":9999,\"dbVersion\":9999,\"dataType\":\"book\",\"name\":\"Smoke Version\"}" "$BASE_URL/api/version/admin/create")
VER_ID=$(echo "$VER_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["id"])' 2>/dev/null || true)
check "POST /api/version/admin/create" "1" "$([ -n "$VER_ID" ] && echo 1 || echo 0)"
if [ -n "$VER_ID" ]; then
  check "GET /api/version/admin/detail/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' "$BASE_URL/api/version/admin/detail/$VER_ID")"
  check "PUT /api/version/admin/update/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X PUT -H 'Content-Type: application/json' -d '{"name":"Smoke Version 2"}' "$BASE_URL/api/version/admin/update/$VER_ID")"
  check "DELETE /api/version/admin/delete/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X DELETE "$BASE_URL/api/version/admin/delete/$VER_ID")"
fi

# Education CRUD (Category, Grade, Tag)
CAT_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST -H 'Content-Type: application/json' -d "{\"name\":\"Smoke Cat $RAND\"}" "$BASE_URL/api/education/categories/admin/create")
CAT_ID=$(echo "$CAT_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["id"])' 2>/dev/null || true)
check "POST /api/education/categories/admin/create" "1" "$([ -n "$CAT_ID" ] && echo 1 || echo 0)"
if [ -n "$CAT_ID" ]; then
  check "PUT /api/education/categories/admin/update/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X PUT -H 'Content-Type: application/json' -d "{\"name\":\"Smoke Cat Updated $RAND\"}" "$BASE_URL/api/education/categories/admin/update/$CAT_ID")"
  check "DELETE /api/education/categories/admin/delete/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X DELETE "$BASE_URL/api/education/categories/admin/delete/$CAT_ID")"
fi

GRADE_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST -H 'Content-Type: application/json' -d "{\"grade\":\"SG$RAND\",\"name\":\"Smoke Grade $RAND\"}" "$BASE_URL/api/education/grades/admin/create")
GRADE_ID=$(echo "$GRADE_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["id"])' 2>/dev/null || true)
check "POST /api/education/grades/admin/create" "1" "$([ -n "$GRADE_ID" ] && echo 1 || echo 0)"
if [ -n "$GRADE_ID" ]; then
  check "PUT /api/education/grades/admin/update/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X PUT -H 'Content-Type: application/json' -d "{\"name\":\"Smoke Grade Updated $RAND\"}" "$BASE_URL/api/education/grades/admin/update/$GRADE_ID")"
  check "DELETE /api/education/grades/admin/delete/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X DELETE "$BASE_URL/api/education/grades/admin/delete/$GRADE_ID")"
fi

TAG_RESP=$(curl -s -b "$COOKIE_ADMIN" -X POST -H 'Content-Type: application/json' -d "{\"name\":\"Smoke Tag $RAND\"}" "$BASE_URL/api/education/tags/admin/create")
TAG_ID=$(echo "$TAG_RESP" | python3 -c 'import sys,json; print(json.load(sys.stdin)["data"]["id"])' 2>/dev/null || true)
check "POST /api/education/tags/admin/create" "1" "$([ -n "$TAG_ID" ] && echo 1 || echo 0)"
if [ -n "$TAG_ID" ]; then
  check "GET /api/education/tags/detail/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' "$BASE_URL/api/education/tags/detail/$TAG_ID")"
  check "PUT /api/education/tags/admin/update/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X PUT -H 'Content-Type: application/json' -d "{\"name\":\"Smoke Tag Updated $RAND\"}" "$BASE_URL/api/education/tags/admin/update/$TAG_ID")"
  check "DELETE /api/education/tags/admin/delete/{id}" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' -X DELETE "$BASE_URL/api/education/tags/admin/delete/$TAG_ID")"
fi

# AI model admin
check "GET /api/ai/model/admin/models/stats" "200" "$(curl -s -b "$COOKIE_ADMIN" -o /dev/null -w '%{http_code}' "$BASE_URL/api/ai/model/admin/models/stats")"

# Clean up smoke test users from DB
psql "$DATABASE_URL" -c "DELETE FROM users WHERE email IN ('$USER_EMAIL', '$ADMIN_EMAIL');" >/dev/null

echo "=== SUMMARY: passed=$PASS failed=$FAIL ==="
[ "$FAIL" -eq 0 ]
