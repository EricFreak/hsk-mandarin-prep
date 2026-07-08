#!/usr/bin/env bash
# Phase 1 requires only Supabase + app URL. Stripe/OpenAI optional.
set -euo pipefail

missing=0
check() {
  local name="$1"
  if [ -z "${!name:-}" ]; then
    echo "MISSING: $name"
    missing=1
  else
    echo "OK: $name"
  fi
}

if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
else
  echo "No .env.local — copy from .env.example first"
  exit 1
fi

echo "=== Phase 1 (Supabase only) ==="
check NEXT_PUBLIC_SUPABASE_URL
check NEXT_PUBLIC_SUPABASE_ANON_KEY
check SUPABASE_SERVICE_ROLE_KEY
check NEXT_PUBLIC_APP_URL

echo ""
echo "=== Optional (Phase 2+) ==="
[ -n "${STRIPE_SECRET_KEY:-}" ] && echo "OK: STRIPE_SECRET_KEY" || echo "SKIP: STRIPE_SECRET_KEY (not needed for beta)"
[ -n "${OPENAI_API_KEY:-}" ] && echo "OK: OPENAI_API_KEY" || echo "SKIP: OPENAI_API_KEY (fallback questions work)"

if [ "$missing" -eq 1 ]; then
  echo ""
  echo "Fix missing vars in .env.local — see docs/launch/01-supabase-setup.md"
  exit 1
fi

echo ""
echo "Phase 1 env ready. Run: npm run dev"
