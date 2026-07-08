create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  founder_cohort boolean not null default false,
  created_at timestamptz default now()
);

create table practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  level int not null,
  question_id text not null,
  correct boolean not null,
  skill text not null,
  created_at timestamptz default now()
);

create table mock_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  level int not null default 3,
  score int not null,
  breakdown jsonb not null,
  created_at timestamptz default now()
);

create table srs_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  word_id text not null,
  level int not null,
  interval_days int not null default 1,
  repetitions int not null default 0,
  ease_factor numeric not null default 2.5,
  due_at timestamptz not null default now(),
  unique (user_id, word_id)
);

create index idx_practice_user_day on practice_attempts (user_id, created_at);
create index idx_srs_due on srs_cards (user_id, due_at);

-- Auto-create profile on signup (backup to auth callback upsert)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, plan)
  values (new.id, new.email, 'free')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
