-- Learning Coach subsystem (Phases A–E)
-- Spec: docs/superpowers/specs/2026-07-10-learning-coach-agent-design.md

create table learner_profiles (
  user_id uuid primary key references profiles(id) on delete cascade,
  target_level int not null default 3,
  target_exam_date date,
  minutes_per_day int,
  native_language text not null default 'en',
  coach_notes text,
  tutoring_interest_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type coach_trigger as enum (
  'mock_exam_completed',
  'manual_refresh',
  'scheduled',
  'post_tutoring'
);

create table coach_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  trigger coach_trigger not null,
  source_attempt_id uuid references mock_exam_attempts(id) on delete set null,
  previous_report_id uuid references coach_reports(id) on delete set null,
  readiness_score int check (readiness_score is null or (readiness_score >= 0 and readiness_score <= 100)),
  summary_markdown text not null,
  strengths jsonb not null default '[]'::jsonb,
  gaps jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  model text,
  version int not null default 1,
  created_at timestamptz not null default now()
);

create table coach_study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  report_id uuid not null references coach_reports(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'superseded')),
  week_start date not null,
  focus_skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table coach_plan_tasks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references coach_study_plans(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  day_offset int not null check (day_offset >= 0 and day_offset <= 6),
  task_type text not null check (task_type in ('practice', 'flashcards', 'mock_section', 'review_mistakes', 'rest')),
  skill text,
  target_count int,
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table coach_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  report_id uuid references coach_reports(id) on delete set null,
  plan_id uuid references coach_study_plans(id) on delete set null,
  trigger coach_trigger not null,
  source_attempt_id uuid references mock_exam_attempts(id) on delete set null,
  input_snapshot jsonb not null default '{}'::jsonb,
  token_usage jsonb,
  latency_ms int,
  error text,
  created_at timestamptz not null default now()
);

create index idx_coach_reports_user_created on coach_reports (user_id, created_at desc);
create index idx_coach_plans_user_status on coach_study_plans (user_id, status);
create index idx_coach_tasks_plan_day on coach_plan_tasks (plan_id, day_offset);
create unique index idx_coach_one_active_plan_per_user
  on coach_study_plans (user_id)
  where status = 'active';
create unique index idx_coach_report_per_attempt
  on coach_reports (source_attempt_id)
  where source_attempt_id is not null;

alter table learner_profiles enable row level security;
alter table coach_reports enable row level security;
alter table coach_study_plans enable row level security;
alter table coach_plan_tasks enable row level security;
alter table coach_runs enable row level security;

create policy "learner_profiles_select_own"
  on learner_profiles for select using (auth.uid() = user_id);
create policy "learner_profiles_insert_own"
  on learner_profiles for insert with check (auth.uid() = user_id);
create policy "learner_profiles_update_own"
  on learner_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "coach_reports_select_own"
  on coach_reports for select using (auth.uid() = user_id);
create policy "coach_reports_insert_own"
  on coach_reports for insert with check (auth.uid() = user_id);

create policy "coach_plans_select_own"
  on coach_study_plans for select using (auth.uid() = user_id);
create policy "coach_plans_insert_own"
  on coach_study_plans for insert with check (auth.uid() = user_id);
create policy "coach_plans_update_own"
  on coach_study_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "coach_tasks_select_own"
  on coach_plan_tasks for select using (auth.uid() = user_id);
create policy "coach_tasks_insert_own"
  on coach_plan_tasks for insert with check (auth.uid() = user_id);
create policy "coach_tasks_update_own"
  on coach_plan_tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "coach_runs_select_own"
  on coach_runs for select using (auth.uid() = user_id);
create policy "coach_runs_insert_own"
  on coach_runs for insert with check (auth.uid() = user_id);
