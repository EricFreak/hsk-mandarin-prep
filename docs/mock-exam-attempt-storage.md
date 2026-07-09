# Mock exam attempt storage (MVP)

## Schema changes

Migration: `supabase/migrations/004_mock_exam_attempt_metadata.sql`

Adds nullable columns to `mock_exam_attempts`:

- `template_id` (text)
- `template_version` (int)
- `answers` (jsonb) — per-question snapshot + user answers, used for review UI
- `started_at` / `completed_at` (timestamptz)
- `duration_seconds` (int)
- `status` (text, default `completed`)

No new tables were added. Existing RLS policies on `mock_exam_attempts` continue to apply (select/insert limited to `auth.uid() = user_id`).

## Backfill / compatibility behavior

- Existing rows remain valid: the new columns are **nullable**, so historic attempts will show summary data but may not have per-question review.
- `/api/mock-exam/submit` now stores a **review snapshot** into `answers` so the attempt can be reviewed even if the code template changes later.
- `breakdown` JSON now includes `breakdown_version: 1` for forward-compatible parsing.

