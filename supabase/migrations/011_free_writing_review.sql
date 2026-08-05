-- supabase/migrations/011_free_writing_review.sql
-- Lifetime one free AI writing review for the sample taste (mirrors free_sprint_used_at).

alter table learner_profiles
  add column if not exists free_writing_review_used_at timestamptz;
