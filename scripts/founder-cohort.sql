-- Grant Pro to founder cohort emails (run manually in Supabase SQL editor)
-- Replace the placeholder emails with your founder list.

update profiles
set
  plan = 'pro',
  founder_cohort = true
where email in (
  'founder1@example.com',
  'founder2@example.com'
);
