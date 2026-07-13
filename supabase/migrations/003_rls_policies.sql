-- Row Level Security: users can only access their own data.
-- Service role (Stripe webhook) bypasses RLS.

alter table profiles enable row level security;
alter table practice_attempts enable row level security;
alter table mock_exam_attempts enable row level security;
alter table srs_cards enable row level security;

-- profiles
create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- practice_attempts
create policy "practice_select_own"
  on practice_attempts for select
  using (auth.uid() = user_id);

create policy "practice_insert_own"
  on practice_attempts for insert
  with check (auth.uid() = user_id);

-- mock_exam_attempts
create policy "mock_exam_select_own"
  on mock_exam_attempts for select
  using (auth.uid() = user_id);

create policy "mock_exam_insert_own"
  on mock_exam_attempts for insert
  with check (auth.uid() = user_id);

-- srs_cards
create policy "srs_select_own"
  on srs_cards for select
  using (auth.uid() = user_id);

create policy "srs_insert_own"
  on srs_cards for insert
  with check (auth.uid() = user_id);

create policy "srs_update_own"
  on srs_cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
