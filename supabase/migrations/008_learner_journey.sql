-- 008_learner_journey.sql
alter table learner_profiles
  add column if not exists journey_horizon_weeks int default 12,
  add column if not exists current_stage text
    check (current_stage is null or current_stage in ('diagnose','foundation','skills','sprint')),
  add column if not exists current_week_index int default 1,
  add column if not exists journey_started_at timestamptz,
  add column if not exists stage_calendar jsonb default '{}'::jsonb;

create table if not exists journey_week_outlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_index int not null,
  stage text not null check (stage in ('diagnose','foundation','skills','sprint')),
  theme text not null,
  skill_focus text[] not null default '{}',
  status text not null default 'locked'
    check (status in ('locked','available','passed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_index)
);

alter table coach_study_plans
  add column if not exists week_index int,
  add column if not exists stage text
    check (stage is null or stage in ('diagnose','foundation','skills','sprint'));

alter table coach_plan_tasks
  add column if not exists mastery_status text
    check (mastery_status is null or mastery_status in ('not_yet','passed','challenged')),
  add column if not exists mastery_score numeric,
  add column if not exists required boolean not null default true;

alter table journey_week_outlines enable row level security;
create policy "journey_week_outlines_select_own"
  on journey_week_outlines for select using (auth.uid() = user_id);
create policy "journey_week_outlines_insert_own"
  on journey_week_outlines for insert with check (auth.uid() = user_id);
create policy "journey_week_outlines_update_own"
  on journey_week_outlines for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
