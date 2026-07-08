-- Optional: store Stripe customer ID for webhook subscription lifecycle updates
alter table profiles
  add column if not exists stripe_customer_id text;

create index if not exists idx_profiles_stripe_customer
  on profiles (stripe_customer_id);
