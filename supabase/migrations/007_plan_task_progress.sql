-- Plan-task practice progress (resume mid-session)
alter table coach_plan_tasks
  add column if not exists attempted_count int not null default 0;
