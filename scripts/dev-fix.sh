#!/usr/bin/env bash
# Fixes the occasional Next.js dev-server "no response/500 missing chunk" issue
# by killing the process on port 3000, clearing `.next`, and restarting `npm run dev`.
set -euo pipefail

APP_PORT="${APP_PORT:-3000}"

echo "==> Checking port ${APP_PORT}..."
pids="$(lsof -nP -iTCP:"${APP_PORT}" -sTCP:LISTEN -t 2>/dev/null || true)"
if [ -n "${pids}" ]; then
  echo "==> Killing process(es) on port ${APP_PORT}: ${pids}"
  # shellcheck disable=SC2086
  kill ${pids} 2>/dev/null || true
  sleep 0.5
fi

echo "==> Clearing .next cache..."
rm -rf .next

echo "==> Starting dev server..."
exec npm run dev

