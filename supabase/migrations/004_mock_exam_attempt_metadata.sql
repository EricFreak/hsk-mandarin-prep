-- Store enough information for attempt review even if templates change.
alter table mock_exam_attempts
  add column if not exists template_id text,
  add column if not exists template_version int,
  add column if not exists answers jsonb,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists duration_seconds int,
  add column if not exists status text not null default 'completed';

-- Helpful for listing attempts by user.
create index if not exists idx_mock_exam_attempts_user_created_at
  on mock_exam_attempts (user_id, created_at desc);

