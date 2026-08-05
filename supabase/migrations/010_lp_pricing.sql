-- supabase/migrations/010_lp_pricing.sql
-- Three-service LP pricing: orders table + service intent + sprint free flag.

alter table learner_profiles
  add column if not exists service_intent text
    check (service_intent in ('coach', 'exam_custom', 'sprint')),
  add column if not exists free_sprint_used_at timestamptz;

create table if not exists lp_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  service_type text not null
    check (service_type in ('coach_4w', 'coach_8w', 'coach_12w', 'exam_custom', 'sprint')),
  composition jsonb not null default '{}',
  lp_total integer not null check (lp_total >= 0),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'quoted'
    check (status in ('quoted', 'paid', 'superseded', 'expired')),
  payment_provider text,
  payment_ref text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lp_orders_user on lp_orders(user_id);
-- Exactly one active paid package per user; older ones flip to 'superseded'.
create unique index if not exists idx_lp_orders_one_paid_per_user
  on lp_orders(user_id) where status = 'paid';

alter table lp_orders enable row level security;

create policy "lp_orders_select_own" on lp_orders
  for select using (auth.uid() = user_id);

-- No user insert policy: all lp_orders writes go through admin-client server
-- routes (/api/lp/quote, /api/sprint/start, /api/checkout, webhook) which
-- compute price_cents server-side. Allowing users to self-insert quoted
-- rows would let them mint $0 orders and bypass the paywall (review C1).
