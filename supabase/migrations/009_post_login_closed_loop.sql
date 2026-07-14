-- 009_post_login_closed_loop.sql
-- Spec: docs/superpowers/specs/2026-07-14-post-login-closed-loop-design.md (rev 2)

-- Explicit prefs commit (do not rely on journey_horizon_weeks DEFAULT 12)
alter table learner_profiles
  add column if not exists onboarding_prefs_at timestamptz,
  add column if not exists diagnosis_completed_at timestamptz,
  add column if not exists w1_cleared_at timestamptz,
  add column if not exists coach_last_error text,
  add column if not exists coach_last_run_at timestamptz;

-- Stop DEFAULT 12 from making every new profile look "prefs done"
alter table learner_profiles
  alter column journey_horizon_weeks drop default;

-- Backfill: rows that already set an exam date or a non-null horizon from real onboarding
update learner_profiles
set onboarding_prefs_at = coalesce(onboarding_prefs_at, updated_at, now())
where onboarding_prefs_at is null
  and (target_exam_date is not null or journey_horizon_weeks is not null);

-- Clear horizon for rows that never actually onboarded (stale DEFAULT 12 only)
-- Heuristic: no exam date, no journey start, no diagnosis → treat horizon as unset
update learner_profiles
set journey_horizon_weeks = null,
    onboarding_prefs_at = null
where target_exam_date is null
  and journey_started_at is null
  and diagnosis_completed_at is null
  and onboarding_prefs_at is null
  and journey_horizon_weeks = 12;

-- Backfill diagnosis from completed diagnosis / legacy placement attempts
update learner_profiles lp
set diagnosis_completed_at = sub.first_at
from (
  select user_id, min(completed_at) as first_at
  from mock_exam_attempts
  where template_id in ('hsk3-diagnosis', 'hsk3-placement')
    and status = 'completed'
  group by user_id
) sub
where lp.user_id = sub.user_id
  and lp.diagnosis_completed_at is null;

-- If journey already started, assume diagnosis was finished
update learner_profiles
set diagnosis_completed_at = coalesce(diagnosis_completed_at, journey_started_at)
where journey_started_at is not null
  and diagnosis_completed_at is null;
