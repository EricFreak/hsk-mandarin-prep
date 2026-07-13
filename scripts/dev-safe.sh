#!/usr/bin/env bash
# Foolproof dev start: always clean .next, free port 3000, then npm run dev.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

APP_PORT="${APP_PORT:-3000}"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js not found. Install from https://nodejs.org then retry."
  exit 1
fi

if [ ! -f package.json ]; then
  echo "ERROR: package.json not found in ${ROOT}"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "==> node_modules missing — running npm install..."
  npm install
fi

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
echo "    Open http://localhost:${APP_PORT} when you see 'Ready'"
exec npm run dev
