-- Persist generated practice questions so attempts are reviewable.

create table if not exists practice_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  level int not null,
  stem text not null,
  choices jsonb not null,
  answer_index int not null,
  explanation text not null,
  skill text not null,
  seed int not null,
  model text,
  created_at timestamptz default now()
);

alter table practice_questions enable row level security;

create policy "practice_questions_select_own"
  on practice_questions for select
  using (auth.uid() = user_id);

create policy "practice_questions_insert_own"
  on practice_questions for insert
  with check (auth.uid() = user_id);

alter table practice_attempts
  add column if not exists practice_question_id uuid references practice_questions(id);

create index if not exists idx_practice_attempts_question
  on practice_attempts (practice_question_id);

