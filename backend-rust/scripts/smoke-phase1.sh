#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:5560}"
PASS=0
FAIL=0
COOKIE_JAR="$(mktemp)"
RAND_ID="$(date +%s)-$$"
TEST_EMAIL="smoke-phase1-${RAND_ID}@sicerdas.test"
TEST_PASS="SmokePass123!"

cleanup() {
  rm -f "$COOKIE_JAR"
}
trap cleanup EXIT

check() {
  local name="$1"
  local expected_code="$2"
  local actual_code="$3"
  local body="$4"
  local grep_pat="${5:-}"

  if [[ "$actual_code" == "$expected_code" ]] && { [[ -z "$grep_pat" ]] || echo "$body" | grep -qE "$grep_pat"; }; then
    echo "PASS: $name (HTTP $actual_code)"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $name (expected HTTP $expected_code, got $actual_code) -> $body"
    FAIL=$((FAIL + 1))
  fi
}

req() {
  local method="$1"
  local path="$2"
  shift 2
  local tmp
  tmp="$(mktemp)"
  local code
  code="$(curl -s -o "$tmp" -w "%{http_code}" -X "$method" "${BASE_URL}${path}" "$@")"
  local body
  body="$(cat "$tmp")"
  rm -f "$tmp"
  printf '%s\n%s' "$code" "$body"
}

echo "=== Phase 1 Smoke Test against $BASE_URL ==="

# 1. Health checks
out="$(req GET /api/health/live)"
check "GET /api/health/live" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '"status":"ok"'

out="$(req GET /api/health/ready)"
check "GET /api/health/ready" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '"database":"connected"'

out="$(req GET /api/health)"
check "GET /api/health" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '"status":"ok"'

# 2. Unauthenticated session & protected route
out="$(req GET /api/auth/get-session)"
check "GET /api/auth/get-session (unauth)" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '^null$'

out="$(req POST /api/auth/revoke-other-sessions)"
check "POST /api/auth/revoke-other-sessions (unauth -> 401)" 401 "${out%%$'\n'*}" "${out#*$'\n'}" '"success":false'

# 3. Sign up throwaway user
out="$(req POST /api/auth/sign-up/email -c "$COOKIE_JAR" -H "Content-Type: application/json" -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\",\"name\":\"Smoke User\"}")"
code="${out%%$'\n'*}"
body="${out#*$'\n'}"
check "POST /api/auth/sign-up/email" 200 "$code" "$body" '"tierId":"free"'
TOKEN="$(echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || true)"

# 4. Get session via Cookie & Bearer
out="$(req GET /api/auth/get-session -b "$COOKIE_JAR")"
check "GET /api/auth/get-session (cookie)" 200 "${out%%$'\n'*}" "${out#*$'\n'}" "$TEST_EMAIL"

out="$(req GET /api/auth/get-session -H "Authorization: Bearer $TOKEN")"
check "GET /api/auth/get-session (bearer)" 200 "${out%%$'\n'*}" "${out#*$'\n'}" "$TEST_EMAIL"

# 5. Sign in email (wrong password -> 400, multipart -> 200, JSON -> 200)
out="$(req POST /api/auth/sign-in-email -F "email=$TEST_EMAIL" -F "password=WrongPassword")"
check "POST /api/auth/sign-in-email (wrong password)" 400 "${out%%$'\n'*}" "${out#*$'\n'}" '"success":false'

out="$(req POST /api/auth/sign-in-email -c "$COOKIE_JAR" -F "email=$TEST_EMAIL" -F "password=$TEST_PASS")"
check "POST /api/auth/sign-in-email (multipart)" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '"success":true'

out="$(req POST /api/auth/sign-in-email -H "Content-Type: application/json" -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}")"
check "POST /api/auth/sign-in-email (json)" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '"success":true'

# 6. Revoke other sessions (authenticated)
out="$(req POST /api/auth/revoke-other-sessions -b "$COOKIE_JAR")"
check "POST /api/auth/revoke-other-sessions (auth)" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '"status":true'

# 7. Email has OTP
out="$(req POST /api/auth/email-has-otp -H "Content-Type: application/json" -d "{\"email\":\"$TEST_EMAIL\"}")"
check "POST /api/auth/email-has-otp (existing user)" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '"hasOtp":false'

out="$(req POST /api/auth/email-has-otp -H "Content-Type: application/json" -d '{"email":"nonexistent-user-xyz@sicerdas.test"}')"
check "POST /api/auth/email-has-otp (unknown user)" 404 "${out%%$'\n'*}" "${out#*$'\n'}" '"success":false'

# 8. Sign out & verify session cleared
out="$(req POST /api/auth/sign-out -b "$COOKIE_JAR" -c "$COOKIE_JAR")"
check "POST /api/auth/sign-out" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '"success":true'

out="$(req GET /api/auth/get-session -H "Authorization: Bearer $TOKEN")"
check "GET /api/auth/get-session (after sign-out)" 200 "${out%%$'\n'*}" "${out#*$'\n'}" '^null$'

# 9. 404 fallback
out="$(req GET /api/route-does-not-exist)"
check "GET /api/route-does-not-exist (404)" 404 "${out%%$'\n'*}" "${out#*$'\n'}" '"message":"Not Found"'

echo ""
echo "Summary: passed=$PASS failed=$FAIL"
if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
